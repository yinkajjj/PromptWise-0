import { Pool } from "pg";

export type StoredGeneratedPrompt = {
  title: string;
  description: string;
  prompt: string;
  category: string;
  tool: string;
  tone: string;
  tags: string[];
};

export type StoredPromptJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type StoredPromptJob = {
  id: string;
  topic: string;
  totalCount: number;
  tools: string[];
  tones: string[];
  status: StoredPromptJobStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  generatedCount: number;
  chunkSize: number;
  provider?: string;
  model?: string;
  error?: string;
  previewPrompts: StoredGeneratedPrompt[];
};

type PromptPage = {
  prompts: StoredGeneratedPrompt[];
  hasMore: boolean;
  total: number;
};

const DATABASE_URL = process.env.DATABASE_URL?.trim();

const toDbDate = (value?: string) => (value ? new Date(value) : null);

const mapDbRowToJob = (row: any): StoredPromptJob => ({
  id: row.id,
  topic: row.topic,
  totalCount: Number(row.total_count),
  tools: Array.isArray(row.tools) ? row.tools : [],
  tones: Array.isArray(row.tones) ? row.tones : [],
  status: row.status,
  createdAt: new Date(row.created_at).toISOString(),
  startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
  completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
  generatedCount: Number(row.generated_count),
  chunkSize: Number(row.chunk_size),
  provider: row.provider ?? undefined,
  model: row.model ?? undefined,
  error: row.error ?? undefined,
  previewPrompts: Array.isArray(row.preview_prompts) ? row.preview_prompts : [],
});

export class PromptPersistence {
  private readonly pool: Pool | null;

  constructor() {
    this.pool = DATABASE_URL
      ? new Pool({
          connectionString: DATABASE_URL,
          max: Math.max(2, Number(process.env.PG_POOL_MAX || 10)),
        })
      : null;
  }

  get enabled() {
    return Boolean(this.pool);
  }

  async init() {
    if (!this.pool) {
      return;
    }

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS prompt_jobs (
        id TEXT PRIMARY KEY,
        topic TEXT NOT NULL,
        total_count INTEGER NOT NULL,
        tools JSONB NOT NULL,
        tones JSONB NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        started_at TIMESTAMPTZ NULL,
        completed_at TIMESTAMPTZ NULL,
        generated_count INTEGER NOT NULL,
        chunk_size INTEGER NOT NULL,
        provider TEXT NULL,
        model TEXT NULL,
        error TEXT NULL,
        preview_prompts JSONB NOT NULL DEFAULT '[]'::jsonb
      );

      CREATE TABLE IF NOT EXISTS prompt_job_results (
        job_id TEXT NOT NULL REFERENCES prompt_jobs(id) ON DELETE CASCADE,
        idx INTEGER NOT NULL,
        payload JSONB NOT NULL,
        PRIMARY KEY (job_id, idx)
      );

      CREATE INDEX IF NOT EXISTS idx_prompt_jobs_status_created_at
      ON prompt_jobs(status, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_prompt_job_results_job_idx
      ON prompt_job_results(job_id, idx);
    `);
  }

  async close() {
    if (!this.pool) {
      return;
    }
    await this.pool.end();
  }

  async saveJob(job: StoredPromptJob) {
    if (!this.pool) {
      return;
    }

    await this.pool.query(
      `
      INSERT INTO prompt_jobs (
        id, topic, total_count, tools, tones, status, created_at, started_at,
        completed_at, generated_count, chunk_size, provider, model, error, preview_prompts
      ) VALUES (
        $1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        topic = EXCLUDED.topic,
        total_count = EXCLUDED.total_count,
        tools = EXCLUDED.tools,
        tones = EXCLUDED.tones,
        status = EXCLUDED.status,
        created_at = EXCLUDED.created_at,
        started_at = EXCLUDED.started_at,
        completed_at = EXCLUDED.completed_at,
        generated_count = EXCLUDED.generated_count,
        chunk_size = EXCLUDED.chunk_size,
        provider = EXCLUDED.provider,
        model = EXCLUDED.model,
        error = EXCLUDED.error,
        preview_prompts = EXCLUDED.preview_prompts
      `,
      [
        job.id,
        job.topic,
        job.totalCount,
        JSON.stringify(job.tools),
        JSON.stringify(job.tones),
        job.status,
        new Date(job.createdAt),
        toDbDate(job.startedAt),
        toDbDate(job.completedAt),
        job.generatedCount,
        job.chunkSize,
        job.provider ?? null,
        job.model ?? null,
        job.error ?? null,
        JSON.stringify(job.previewPrompts ?? []),
      ],
    );
  }

  async getJob(jobId: string): Promise<StoredPromptJob | null> {
    if (!this.pool) {
      return null;
    }

    const result = await this.pool.query(`SELECT * FROM prompt_jobs WHERE id = $1`, [jobId]);
    if (result.rowCount === 0) {
      return null;
    }

    return mapDbRowToJob(result.rows[0]);
  }

  async appendResults(jobId: string, startIndex: number, prompts: StoredGeneratedPrompt[]) {
    if (!this.pool || prompts.length === 0) {
      return;
    }

    const values: string[] = [];
    const params: unknown[] = [];

    for (let i = 0; i < prompts.length; i += 1) {
      const base = i * 3;
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}::jsonb)`);
      params.push(jobId, startIndex + i, JSON.stringify(prompts[i]));
    }

    await this.pool.query(
      `
      INSERT INTO prompt_job_results (job_id, idx, payload)
      VALUES ${values.join(",")}
      ON CONFLICT (job_id, idx) DO UPDATE SET payload = EXCLUDED.payload
      `,
      params,
    );
  }

  async readResultsPage(jobId: string, offset: number, limit: number): Promise<PromptPage> {
    if (!this.pool) {
      return {
        prompts: [],
        hasMore: false,
        total: 0,
      };
    }

    const [countResult, rowsResult] = await Promise.all([
      this.pool.query(`SELECT COUNT(*)::int AS total FROM prompt_job_results WHERE job_id = $1`, [jobId]),
      this.pool.query(
        `
        SELECT payload
        FROM prompt_job_results
        WHERE job_id = $1
          AND idx >= $2
          AND idx < $3
        ORDER BY idx ASC
        `,
        [jobId, offset, offset + limit],
      ),
    ]);

    const total = Number(countResult.rows[0]?.total || 0);
    const prompts = rowsResult.rows.map((row) => row.payload as StoredGeneratedPrompt);

    return {
      prompts,
      hasMore: offset + limit < total,
      total,
    };
  }

  async cleanup(retentionMs: number, maxSaved: number): Promise<string[]> {
    if (!this.pool) {
      return [];
    }

    const toDelete = new Set<string>();

    const expired = await this.pool.query(
      `
      SELECT id
      FROM prompt_jobs
      WHERE status IN ('completed', 'failed', 'cancelled')
        AND completed_at IS NOT NULL
        AND completed_at < NOW() - ($1::text)::interval
      `,
      [`${Math.floor(retentionMs / 1000)} seconds`],
    );

    for (const row of expired.rows) {
      toDelete.add(row.id as string);
    }

    const overflow = await this.pool.query(
      `
      SELECT id
      FROM prompt_jobs
      WHERE status IN ('completed', 'failed', 'cancelled')
      ORDER BY completed_at DESC NULLS LAST, created_at DESC
      OFFSET $1
      `,
      [maxSaved],
    );

    for (const row of overflow.rows) {
      toDelete.add(row.id as string);
    }

    const ids = Array.from(toDelete);
    if (ids.length > 0) {
      await this.pool.query(`DELETE FROM prompt_jobs WHERE id = ANY($1::text[])`, [ids]);
    }

    return ids;
  }

  async getInFlightJobs(): Promise<StoredPromptJob[]> {
    if (!this.pool) {
      return [];
    }

    const result = await this.pool.query(
      `
      SELECT * FROM prompt_jobs
      WHERE status IN ('queued', 'running')
      ORDER BY created_at ASC
      `,
    );

    return result.rows.map((row) => mapDbRowToJob(row));
  }
}
