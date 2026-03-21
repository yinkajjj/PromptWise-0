/**
 * One-time migration utility to import legacy file-based job results into Postgres.
 * Usage: PROMPT_JOBS_DIR=.promptwise-jobs DATABASE_URL=postgres://... tsx server/migrate.ts
 */

import fs from "fs/promises";
import path from "path";
import { PromptPersistence, StoredPromptJob, StoredGeneratedPrompt } from "./persistence";

const JOBS_DIR = process.env.PROMPT_JOBS_DIR?.trim() || path.join(process.cwd(), ".promptwise-jobs");

interface LegacyJobData {
  topic: string;
  totalCount: number;
  tools: string[];
  tones: string[];
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  generatedCount: number;
  chunkSize: number;
  provider?: string;
  model?: string;
  error?: string;
  previewPrompts?: unknown[];
}

const migrate = async () => {
  const persistence = new PromptPersistence();

  if (!persistence.enabled) {
    console.error("ERROR: DATABASE_URL not set. Cannot migrate without Postgres connection.");
    process.exit(1);
  }

  console.log(`Initializing persistence layer...`);
  await persistence.init();

  console.log(`Reading job metadata from: ${JOBS_DIR}`);
  let entries: string[] = [];
  try {
    entries = await fs.readdir(JOBS_DIR);
  } catch (err) {
    console.log(
      `⚠️  JOBS_DIR not found or empty. No legacy jobs to migrate. Exiting gracefully.`,
    );
    await persistence.close();
    process.exit(0);
  }

  const jobDirs = entries.filter((e) => !e.startsWith("."));
  if (jobDirs.length === 0) {
    console.log(`✓ No job directories found. Migration complete (nothing to do).`);
    await persistence.close();
    process.exit(0);
  }

  let migratedCount = 0;
  let failedCount = 0;

  for (const jobId of jobDirs) {
    try {
      const jobDir = path.join(JOBS_DIR, jobId);
      const metaPath = path.join(jobDir, "meta.json");
      const resultsPath = path.join(jobDir, "results.jsonl");

      let metaContent: string;
      try {
        metaContent = await fs.readFile(metaPath, "utf8");
      } catch (err) {
        console.warn(`  ⚠️  No meta.json for job ${jobId}, skipping.`);
        continue;
      }

      const meta: LegacyJobData = JSON.parse(metaContent);

      const job: StoredPromptJob = {
        id: jobId,
        topic: meta.topic,
        totalCount: meta.totalCount,
        tools: meta.tools ?? [],
        tones: meta.tones ?? [],
        status: (meta.status ?? "queued") as any,
        createdAt: meta.createdAt ?? new Date().toISOString(),
        startedAt: meta.startedAt,
        completedAt: meta.completedAt,
        generatedCount: meta.generatedCount ?? 0,
        chunkSize: meta.chunkSize ?? 50,
        provider: meta.provider,
        model: meta.model,
        error: meta.error,
        previewPrompts: (meta.previewPrompts ?? []) as StoredGeneratedPrompt[],
      };

      // Save job metadata
      await persistence.saveJob(job);

      // Import results if they exist
      let resultsCount = 0;
      try {
        const resultsContent = await fs.readFile(resultsPath, "utf8");
        const resultsLines = resultsContent
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        // Batch import results in chunks of 100
        for (let i = 0; i < resultsLines.length; i += 100) {
          const batch = resultsLines.slice(i, i + 100).map((line) => JSON.parse(line));
          await persistence.appendResults(jobId, i, batch);
          resultsCount += batch.length;
        }
      } catch (err) {
        if ((err as any).code === "ENOENT") {
          // results.jsonl doesn't exist, which is fine
        } else {
          throw err;
        }
      }

      console.log(`  ✓ Migrated job ${jobId} (${resultsCount} results)`);
      migratedCount += 1;
    } catch (err) {
      console.error(`  ✗ Failed to migrate job ${jobId}:`, (err as Error).message);
      failedCount += 1;
    }
  }

  console.log(`\n=== Migration Summary ===`);
  console.log(`Total jobs: ${migratedCount + failedCount}`);
  console.log(`Successfully migrated: ${migratedCount}`);
  console.log(`Failed: ${failedCount}`);

  await persistence.close();
  process.exit(failedCount > 0 ? 1 : 0);
};

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
