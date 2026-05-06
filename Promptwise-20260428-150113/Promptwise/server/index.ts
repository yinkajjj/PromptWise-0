import express, { Request, Response, RequestHandler } from "express";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { Queue, Worker, Job } from "bullmq";
import {
  PromptPersistence,
  StoredGeneratedPrompt,
  StoredPromptJob,
} from "./persistence";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(express.json());

type GeneratedPrompt = StoredGeneratedPrompt;
type PromptJob = StoredPromptJob & {
  resultFilePath?: string;
};

/*
type GeneratedPrompt = {
  title: string;
  description: string;
  prompt: string;
  category: string;
  tool: string;
  tone: string;
  tags: string[];
};
*/

const SUPPORTED_TOOLS = ["chatgpt", "claude", "midjourney", "runway"];

const MAX_SYNC_COUNT = 200;
const DEFAULT_JOB_CHUNK_SIZE = Math.max(1, Number(process.env.PROMPT_JOB_CHUNK_SIZE || 50));
const MAX_JOB_COUNT = Math.max(1, Number(process.env.PROMPT_JOB_MAX_COUNT || 10000));
const MAX_PREVIEW_PROMPTS = 500;
const JOBS_DIR = path.join(process.cwd(), ".promptwise-jobs");
const REDIS_URL = process.env.REDIS_URL?.trim();
const USE_REDIS_QUEUE = Boolean(REDIS_URL);
const PROMPT_QUEUE_NAME = process.env.PROMPT_QUEUE_NAME || "promptwise-generation-jobs";
const PROMPT_QUEUE_ATTEMPTS = Math.max(1, Number(process.env.PROMPT_QUEUE_ATTEMPTS || 1));

type PromptJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

type PromptQueueData = {
  jobId: string;
};

const jobs = new Map<string, PromptJob>();
const queuedJobIds: string[] = [];
let workerBusy = false;
const JOB_RETENTION_MS = Math.max(60_000, Number(process.env.PROMPT_JOB_RETENTION_MS || 24 * 60 * 60 * 1000));
const JOB_MAX_SAVED = Math.max(10, Number(process.env.PROMPT_JOB_MAX_SAVED || 500));

const API_KEY = process.env.PROMPTWISE_API_KEY?.trim();

let queueConnection: { url: string; maxRetriesPerRequest: null } | null = null;
let promptQueue: Queue | null = null;
let promptWorker: Worker | null = null;
const persistence = new PromptPersistence();

const isJobFinal = (status: PromptJobStatus) => (
  status === "completed" || status === "failed" || status === "cancelled"
);

const inferCategory = (topic: string) => {
  const lowered = topic.toLowerCase();
  if (/(image|photo|logo|art|illustration|design|render)/.test(lowered)) return "image";
  if (/(video|youtube|reel|shorts|cinematic|script)/.test(lowered)) return "video";
  if (/(business|sales|marketing|strategy|startup|saas)/.test(lowered)) return "business";
  return "writing";
};

const buildFallbackPrompts = (
  topic: string,
  count: number,
  tools: string[],
  tones: string[],
  offset: number = 0,
) => {
  const category = inferCategory(topic);
  const generated: GeneratedPrompt[] = [];

  for (let i = 0; i < count; i += 1) {
    const absoluteIndex = offset + i;
    const tool = tools[i % tools.length];
    const tone = tones[i % tones.length];
    const variant = absoluteIndex + 1;

    generated.push({
      title: `${topic} Prompt Variant ${variant}`,
      description: `High-converting ${tone} prompt for ${tool} focused on ${topic}.`,
      prompt: [
        `You are an expert ${tool} operator for ${topic}.`,
        `Create a ${tone} output with strong practical value and realistic constraints.`,
        "Structure the output as:",
        "1) Goal and target audience",
        "2) 3-5 tactical steps",
        "3) Pitfalls to avoid",
        "4) Final deliverable in production-ready format",
        "Use measurable criteria and avoid generic language.",
      ].join("\n"),
      category,
      tool,
      tone,
      tags: [topic, tool, tone, "generated"],
    });
  }

  return generated;
};

const dedupePrompts = (prompts: GeneratedPrompt[]) => {
  const seen = new Set<string>();
  const deduped: GeneratedPrompt[] = [];

  for (const prompt of prompts) {
    const key = `${prompt.tool}|${prompt.tone}|${prompt.prompt.trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(prompt);
    }
  }

  return deduped;
};

const parseJsonFromText = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
  }

  throw new Error("No JSON payload found in model output");
};

const normalizePrompt = (
  item: any,
  topic: string,
  idx: number,
  allowedTools: string[],
  allowedTones: string[],
): GeneratedPrompt => ({
  title: String(item?.title || `${topic} Prompt ${idx + 1}`),
  description: String(item?.description || `Generated prompt for ${topic}`),
  prompt: String(item?.prompt || ""),
  category: ["writing", "image", "business", "video"].includes(String(item?.category || ""))
    ? String(item.category)
    : inferCategory(topic),
  tool: allowedTools.includes(String(item?.tool || "").toLowerCase())
    ? String(item.tool).toLowerCase()
    : allowedTools[idx % allowedTools.length],
  tone: allowedTones.includes(String(item?.tone || "").toLowerCase())
    ? String(item.tone).toLowerCase()
    : allowedTones[idx % allowedTones.length],
  tags: Array.isArray(item?.tags) && item.tags.length > 0
    ? item.tags.map((tag: unknown) => String(tag).toLowerCase()).slice(0, 6)
    : [topic.toLowerCase(), "generated"],
});

const generatePromptBatch = async (
  topic: string,
  count: number,
  tools: string[],
  tones: string[],
  offset: number = 0,
): Promise<{ prompts: GeneratedPrompt[]; provider: string; model?: string }> => {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return {
      prompts: dedupePrompts(buildFallbackPrompts(topic, count, tools, tones, offset)).slice(0, count),
      provider: "fallback",
    };
  }

  const instruction = [
    "You generate realistic, production-usable AI prompts at scale.",
    `Topic: ${topic}`,
    `Count: ${count}`,
    `Allowed tools: ${tools.join(", ")}`,
    `Allowed tones: ${tones.join(", ")}`,
    "Return ONLY valid JSON array.",
    "Each item must include: title, description, prompt, category, tool, tone, tags.",
    "category must be one of: writing, image, business, video.",
    "tool must be one of the allowed tools.",
    "tone must be one of the allowed tones.",
    "tags must be 3-6 short lowercase tags.",
    "No markdown and no extra text.",
  ].join("\n");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.9,
      messages: [{ role: "user", content: instruction }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Provider call failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Provider returned empty content");
  }

  const parsed = parseJsonFromText(content);
  const prompts = Array.isArray(parsed) ? parsed : [];
  const normalized = prompts
    .slice(0, count)
    .map((item: any, idx: number) => normalizePrompt(item, topic, offset + idx, tools, tones));

  return {
    prompts: dedupePrompts(normalized).slice(0, count),
    provider: "openai-compatible",
    model,
  };
};

const appendPromptsToFile = async (filePath: string, prompts: GeneratedPrompt[]) => {
  if (prompts.length === 0) {
    return;
  }
  const lines = prompts.map((prompt) => JSON.stringify(prompt)).join("\n") + "\n";
  await fs.appendFile(filePath, lines, "utf8");
};

const readPromptsPage = async (filePath: string, offset: number, limit: number) => {
  const content = await fs.readFile(filePath, "utf8");
  const rows = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sliced = rows.slice(offset, offset + limit).map((row) => JSON.parse(row));
  return {
    prompts: sliced,
    hasMore: offset + limit < rows.length,
    total: rows.length,
  };
};

const processPromptJob = async (job: PromptJob, queueJob?: Job) => {
  job.status = "running";
  job.startedAt = new Date().toISOString();
  await persistence.saveJob(job);

  while (job.generatedCount < job.totalCount) {
    if ((job.status as PromptJobStatus) === "cancelled") {
      break;
    }

    const remaining = job.totalCount - job.generatedCount;
    const chunkTarget = Math.min(job.chunkSize, remaining);

    const result = await generatePromptBatch(
      job.topic,
      chunkTarget,
      job.tools,
      job.tones,
      job.generatedCount,
    );

    const chunkStart = job.generatedCount;
    const chunkPrompts = result.prompts.slice(0, chunkTarget);
    if (persistence.enabled) {
      await persistence.appendResults(job.id, chunkStart, chunkPrompts);
    } else if (job.resultFilePath) {
      await appendPromptsToFile(job.resultFilePath, chunkPrompts);
    }

    job.generatedCount += chunkPrompts.length;
    job.provider = result.provider;
    job.model = result.model;

    if (job.previewPrompts.length < MAX_PREVIEW_PROMPTS) {
      const remainingPreview = MAX_PREVIEW_PROMPTS - job.previewPrompts.length;
      job.previewPrompts.push(...chunkPrompts.slice(0, remainingPreview));
    }

    if (chunkPrompts.length === 0) {
      throw new Error("Generation returned empty batch; stopping to prevent infinite loop");
    }

    if (queueJob) {
      const progress = job.totalCount > 0 ? Math.round((job.generatedCount / job.totalCount) * 100) : 0;
      await queueJob.updateProgress(progress);
    }

    await persistence.saveJob(job);
  }

  if ((job.status as PromptJobStatus) !== "cancelled") {
    job.status = "completed";
  }
  job.completedAt = new Date().toISOString();
  await persistence.saveJob(job);
};

const processQueuedJobs = async () => {
  if (workerBusy || queuedJobIds.length === 0) {
    return;
  }

  workerBusy = true;
  const nextJobId = queuedJobIds.shift();
  if (!nextJobId) {
    workerBusy = false;
    return;
  }

  const job = jobs.get(nextJobId);
  if (!job) {
    workerBusy = false;
    setImmediate(processQueuedJobs);
    return;
  }

  try {
    await processPromptJob(job);
  } catch (error: any) {
    if (job.status !== "cancelled") {
      job.status = "failed";
      job.error = String(error?.message || error);
      job.completedAt = new Date().toISOString();
      await persistence.saveJob(job);
    }
  } finally {
    if (job.status === "cancelled" && !job.completedAt) {
      job.completedAt = new Date().toISOString();
      await persistence.saveJob(job);
    }

    workerBusy = false;
    setImmediate(processQueuedJobs);
  }
};

const initDurableQueue = () => {
  if (!USE_REDIS_QUEUE || !REDIS_URL) {
    return;
  }

  queueConnection = {
    url: REDIS_URL,
    maxRetriesPerRequest: null,
  };

  promptQueue = new Queue(PROMPT_QUEUE_NAME, {
    connection: queueConnection,
    defaultJobOptions: {
      attempts: PROMPT_QUEUE_ATTEMPTS,
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  promptWorker = new Worker(
    PROMPT_QUEUE_NAME,
    async (queueJob) => {
      const trackedJob = jobs.get((queueJob.data as PromptQueueData).jobId);
      if (!trackedJob) {
        return;
      }

      if (isJobFinal(trackedJob.status)) {
        return;
      }

      try {
        await processPromptJob(trackedJob, queueJob);
      } catch (error: any) {
        if ((trackedJob.status as PromptJobStatus) !== "cancelled") {
          trackedJob.status = "failed";
          trackedJob.error = String(error?.message || error);
          trackedJob.completedAt = new Date().toISOString();
          await persistence.saveJob(trackedJob);
        }
        throw error;
      }
    },
    {
      connection: queueConnection,
      concurrency: Math.max(1, Number(process.env.PROMPT_QUEUE_CONCURRENCY || 2)),
    },
  );

  promptWorker.on("failed", (queueJob, error) => {
    const failedJobId = (queueJob?.data as PromptQueueData | undefined)?.jobId;
    if (!failedJobId) {
      return;
    }
    const failedJob = jobs.get(failedJobId);
    if (!failedJob || failedJob.status === "cancelled") {
      return;
    }
    failedJob.status = "failed";
    failedJob.error = String(error?.message || error);
    failedJob.completedAt = new Date().toISOString();
    persistence.saveJob(failedJob).catch(() => {
      // Best-effort durable update; avoid crashing worker event loop.
    });
  });
};

const ensureJobsDir = async () => {
  if (persistence.enabled) {
    return;
  }
  await fs.mkdir(JOBS_DIR, { recursive: true });
};

const parseBearerToken = (raw: string | undefined) => {
  if (!raw) return undefined;
  const [scheme, token] = raw.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token?.trim();
};

const requireApiKey: RequestHandler = (req, res, next) => {
  if (!API_KEY) {
    next();
    return;
  }

  const headerKey = req.header("x-api-key")?.trim();
  const bearer = parseBearerToken(req.header("authorization"));
  const candidate = headerKey || bearer;

  if (candidate !== API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};

const cleanupOldJobs = async () => {
  const deletedFromPersistence = await persistence.cleanup(JOB_RETENTION_MS, JOB_MAX_SAVED);
  for (const id of deletedFromPersistence) {
    jobs.delete(id);
  }

  const now = Date.now();

  for (const [jobId, job] of Array.from(jobs.entries())) {
    if (!isJobFinal(job.status)) {
      continue;
    }

    const completedAt = job.completedAt ? new Date(job.completedAt).getTime() : now;
    if (Number.isFinite(completedAt) && now - completedAt > JOB_RETENTION_MS) {
      jobs.delete(jobId);
      if (job.resultFilePath) {
        try {
          await fs.rm(job.resultFilePath, { force: true });
        } catch {
          // Best-effort cleanup; ignore missing/unreadable files.
        }
      }
    }
  }

  const finishedJobs = Array.from(jobs.values())
    .filter((job) => isJobFinal(job.status))
    .sort((a, b) => (new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime()));

  if (finishedJobs.length > JOB_MAX_SAVED) {
    const overflow = finishedJobs.slice(JOB_MAX_SAVED);
    for (const job of overflow) {
      jobs.delete(job.id);
      if (job.resultFilePath) {
        try {
          await fs.rm(job.resultFilePath, { force: true });
        } catch {
          // Best-effort cleanup; ignore missing/unreadable files.
        }
      }
    }
  }
};

setInterval(() => {
  cleanupOldJobs().catch(() => {
    // Keep server resilient: cleanup failures should not crash the process.
  });
}, Math.max(60_000, Math.floor(JOB_RETENTION_MS / 2)));

app.use("/api/prompts", requireApiKey);

app.post("/api/prompts/generate", async (req: Request, res: Response) => {
  const topic = String(req.body?.topic || "").trim();
  const rawCount = Number(req.body?.count ?? 20);
  const count = Number.isFinite(rawCount) ? Math.max(1, Math.min(rawCount, MAX_SYNC_COUNT)) : 20;
  const requestedTools = Array.isArray(req.body?.tools) ? req.body.tools : ["chatgpt"];
  const requestedTones = Array.isArray(req.body?.tones) ? req.body.tones : ["professional"];
  const tools = requestedTools
    .map((t: unknown) => String(t).toLowerCase())
    .filter((t: string) => SUPPORTED_TOOLS.includes(t));
  const tones = requestedTones.map((t: unknown) => String(t).toLowerCase().trim()).filter(Boolean);

  if (!topic) {
    res.status(400).json({ error: "Topic is required" });
    return;
  }

  const normalizedTools = tools.length > 0 ? tools : ["chatgpt"];
  const normalizedTones = tones.length > 0 ? tones : ["professional"];

  try {
    const result = await generatePromptBatch(topic, count, normalizedTools, normalizedTones);
    res.json({ prompts: result.prompts, provider: result.provider, model: result.model });
  } catch (error: any) {
    res.status(500).json({
      error: "Generation failed",
      detail: String(error?.message || error),
    });
  }
});

app.post("/api/prompts/jobs", async (req: Request, res: Response) => {
  const topic = String(req.body?.topic || "").trim();
  const rawCount = Number(req.body?.count ?? 500);
  const count = Number.isFinite(rawCount) ? Math.max(1, Math.min(rawCount, MAX_JOB_COUNT)) : 500;
  const rawChunkSize = Number(req.body?.chunkSize ?? DEFAULT_JOB_CHUNK_SIZE);
  const chunkSize = Number.isFinite(rawChunkSize)
    ? Math.max(1, Math.min(rawChunkSize, MAX_SYNC_COUNT))
    : DEFAULT_JOB_CHUNK_SIZE;

  const requestedTools = Array.isArray(req.body?.tools) ? req.body.tools : ["chatgpt"];
  const requestedTones = Array.isArray(req.body?.tones) ? req.body.tones : ["professional"];

  const tools = requestedTools
    .map((t: unknown) => String(t).toLowerCase())
    .filter((t: string) => SUPPORTED_TOOLS.includes(t));
  const tones = requestedTones.map((t: unknown) => String(t).toLowerCase().trim()).filter(Boolean);

  if (!topic) {
    res.status(400).json({ error: "Topic is required" });
    return;
  }

  const normalizedTools = tools.length > 0 ? tools : ["chatgpt"];
  const normalizedTones = tones.length > 0 ? tones : ["professional"];

  await ensureJobsDir();

  const jobId = randomUUID();
  let resultFilePath: string | undefined;
  if (!persistence.enabled) {
    resultFilePath = path.join(JOBS_DIR, `${jobId}.ndjson`);
    await fs.writeFile(resultFilePath, "", "utf8");
  }

  const job: PromptJob = {
    id: jobId,
    topic,
    totalCount: count,
    tools: normalizedTools,
    tones: normalizedTones,
    status: "queued",
    createdAt: new Date().toISOString(),
    generatedCount: 0,
    chunkSize,
    resultFilePath,
    previewPrompts: [],
  };

  jobs.set(jobId, job);
  await persistence.saveJob(job);

  if (promptQueue) {
    await promptQueue.add(
      "generate-prompts",
      { jobId },
      {
        jobId,
      },
    );
  } else {
    queuedJobIds.push(jobId);
    setImmediate(processQueuedJobs);
  }

  res.status(202).json({
    jobId,
    status: job.status,
    topic: job.topic,
    totalCount: job.totalCount,
    chunkSize: job.chunkSize,
  });
});

app.get("/api/prompts/jobs/:jobId", (req: Request, res: Response) => {
  const respond = (job: PromptJob) => {
    res.json({
      jobId: job.id,
      status: job.status,
      topic: job.topic,
      totalCount: job.totalCount,
      generatedCount: job.generatedCount,
      progress: job.totalCount > 0 ? Math.round((job.generatedCount / job.totalCount) * 100) : 0,
      chunkSize: job.chunkSize,
      provider: job.provider,
      model: job.model,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      previewPrompts: job.previewPrompts,
    });
  };

  const inMemory = jobs.get(req.params.jobId);
  if (inMemory) {
    respond(inMemory);
    return;
  }

  if (!persistence.enabled) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  persistence.getJob(req.params.jobId).then((dbJob) => {
    if (!dbJob) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    respond(dbJob as PromptJob);
  }).catch((error: any) => {
    res.status(500).json({ error: "Failed to read job", detail: String(error?.message || error) });
  });
});

app.post("/api/prompts/jobs/:jobId/cancel", async (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId) || await persistence.getJob(req.params.jobId) as PromptJob | null;
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (isJobFinal(job.status)) {
    res.status(409).json({ error: "Job already finalized", status: job.status });
    return;
  }

  job.status = "cancelled";
  job.error = "Cancelled by user";
  job.completedAt = new Date().toISOString();
  jobs.set(job.id, job);
  await persistence.saveJob(job);

  const queueIdx = queuedJobIds.indexOf(job.id);
  if (queueIdx >= 0) {
    queuedJobIds.splice(queueIdx, 1);
  }

  if (promptQueue) {
    const queuedJob = await promptQueue.getJob(job.id);
    if (queuedJob) {
      await queuedJob.remove().catch(() => {
        // The job may already be active/completed; ignore remove failures.
      });
    }
  }

  await cleanupOldJobs().catch(() => {
    // Ignore best-effort cleanup failures.
  });

  res.json({
    jobId: job.id,
    status: job.status,
    generatedCount: job.generatedCount,
    totalCount: job.totalCount,
  });
});

app.get("/api/prompts/jobs/:jobId/results", async (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId) || await persistence.getJob(req.params.jobId) as PromptJob | null;
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.status !== "completed") {
    res.status(409).json({ error: "Job is not completed yet", status: job.status });
    return;
  }

  const rawOffset = Number(req.query.offset ?? 0);
  const rawLimit = Number(req.query.limit ?? 100);
  const offset = Number.isFinite(rawOffset) ? Math.max(0, rawOffset) : 0;
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(500, rawLimit)) : 100;

  try {
    const page = persistence.enabled
      ? await persistence.readResultsPage(job.id, offset, limit)
      : await readPromptsPage(String(job.resultFilePath || ""), offset, limit);
    res.json({
      jobId: job.id,
      offset,
      limit,
      total: page.total,
      hasMore: page.hasMore,
      prompts: page.prompts,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read job results", detail: String(error?.message || error) });
  }
});

// Simple health endpoint for local dev and readiness checks
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, ts: Date.now() });
});

const resumeInFlightJobs = async () => {
  // Resume jobs that were in-flight (queued or running) before shutdown
  const inFlightJobs = await persistence.getInFlightJobs();
  if (inFlightJobs.length === 0) {
    return;
  }

  console.log(`Resuming ${inFlightJobs.length} in-flight jobs from persistence...`);

  for (const persistedJob of inFlightJobs) {
    // Load job into in-memory map for tracking
    const job: PromptJob = {
      ...persistedJob,
      resultFilePath: !persistence.enabled
        ? path.join(JOBS_DIR, persistedJob.id, "results.jsonl")
        : undefined,
    };

    jobs.set(job.id, job);

    // Transition running jobs back to queued since they didn't complete
    if (job.status === "running") {
      job.status = "queued";
      job.startedAt = undefined;
      await persistence.saveJob(job);
    }

    // Re-enqueue if we have Redis queue; otherwise will be picked up by in-memory queue
    if (promptQueue && job.status === "queued") {
      await promptQueue.add("generation", { jobId: job.id } as PromptQueueData, {
        attempts: PROMPT_QUEUE_ATTEMPTS,
        removeOnComplete: 100,
        removeOnFail: 500,
      });
    }

    queuedJobIds.push(job.id);
  }

  console.log(`✓ Resumed ${inFlightJobs.length} in-flight jobs`);
};

const initializeServices = async () => {
  await persistence.init();
  initDurableQueue();
  await resumeInFlightJobs();
};

initializeServices().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to initialize persistence/queue services", error);
  process.exit(1);
});

// In production, serve the built client from dist/public
if (process.env.NODE_ENV === "production") {
  const publicDir = path.join(process.cwd(), "dist", "public");
  app.use(express.static(publicDir));

  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Server listening on http://localhost:${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"}, queue=${USE_REDIS_QUEUE ? "redis" : "in-memory"})`,
  );
});

const shutdown = async () => {
  await Promise.allSettled([
    promptWorker?.close(),
    promptQueue?.close(),
    persistence.close(),
  ]);
};

process.on("SIGINT", () => {
  shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  shutdown().finally(() => process.exit(0));
});

export default app;
