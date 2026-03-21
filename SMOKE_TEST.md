# Smoke Test Guide: Durable Persistence

This guide walks through end-to-end testing of the durable persistence layer with Postgres.

## Prerequisites

1. **Postgres running** on localhost:5432 (or configure via `DATABASE_URL`)
2. **OpenAI API key** set in `.env` for generation testing (or fallback to mock generation)
3. **Development server** running or production build ready

## Setup

### 1. Configure Postgres Connection

Create or update `.env.local` (development) or `.env` (production):

```bash
DATABASE_URL=postgres://user:password@localhost:5432/promptwise
PG_POOL_MAX=10
OPENAI_API_KEY=sk-... # optional, uses fallback if not set
```

### 2. Start the Server

**Development:**
```bash
pnpm run dev:server
```

**Production:**
```bash
NODE_ENV=production node dist/index.js
```

The server will:
- Initialize Postgres schema (tables, indexes)
- Resume any in-flight jobs from previous sessions
- Start listening on http://localhost:3001

## Smoke Tests

### Test 1: Create a Job

```bash
curl -X POST http://localhost:3001/api/prompts/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "SaaS onboarding",
    "totalCount": 10,
    "tools": ["chatgpt", "claude"],
    "tones": ["friendly", "professional"]
  }'
```

Expected response:
```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "status": "queued",
  "topic": "SaaS onboarding",
  "totalCount": 10,
  "generatedCount": 0,
  "createdAt": "2026-03-21T...",
  "statusUrl": "/api/prompts/jobs/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Verify in Postgres:**
```sql
SELECT id, status, topic, generated_count, total_count FROM prompt_jobs 
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

Should show: `queued`, 0 generated.

---

### Test 2: Poll Job Status

```bash
JOB_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

curl http://localhost:3001/api/prompts/jobs/$JOB_ID
```

Expected response: Job metadata with increasing `generatedCount` as work progresses.

**Verify in Postgres:**
```sql
SELECT id, status, generated_count, started_at FROM prompt_jobs 
WHERE id = '$JOB_ID';
```

After a few seconds, should show `status = 'running'` and `generated_count > 0`.

---

### Test 3: Read Paginated Results

Once job has generated some prompts:

```bash
JOB_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Get first page
curl "http://localhost:3001/api/prompts/jobs/$JOB_ID/results?offset=0&limit=5"

# Get second page
curl "http://localhost:3001/api/prompts/jobs/$JOB_ID/results?offset=5&limit=5"
```

Expected response:
```json
{
  "prompts": [
    {
      "title": "...",
      "description": "...",
      "prompt": "...",
      "category": "...",
      "tool": "...",
      "tone": "...",
      "tags": [...]
    }
  ],
  "total": 10,
  "hasMore": true
}
```

**Verify in Postgres:**
```sql
SELECT COUNT(*) FROM prompt_job_results WHERE job_id = '$JOB_ID';
```

Should show incremented count as results are appended.

---

### Test 4: Cancel a Job

```bash
JOB_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

curl -X POST http://localhost:3001/api/prompts/jobs/$JOB_ID/cancel
```

Expected response:
```json
{
  "id": "$JOB_ID",
  "status": "cancelled",
  "error": "Cancelled by user"
}
```

**Verify in Postgres:**
```sql
SELECT id, status, error FROM prompt_jobs WHERE id = '$JOB_ID';
```

Should show `status = 'cancelled'`.

---

### Test 5: Restart-Resume

After the server has processed a few jobs:

1. **Stop the server** (Ctrl+C)
2. **Verify resume checkpoint:**
   ```bash
   # Wait 2 seconds and check server logs
   ```
3. **Restart the server:**
   ```bash
   pnpm run dev:server
   ```

Expected in logs:
```
Resuming N in-flight jobs from persistence...
✓ Resumed N in-flight jobs
```

**Verify:**
- Any job with status "queued" prior to restart should be re-enqueued
- Any job with status "running" should be transitioned back to "queued" and re-enqueued
- Job counts should resume from where they left off

---

## Migration Test (Optional)

If you have legacy `.promptwise-jobs` directory:

```bash
DATABASE_URL=postgres://... tsx server/migrate.ts
```

Expected output:
```
Reading job metadata from: .promptwise-jobs
✓ Migrated job xxx (N results)
✓ Migrated job yyy (M results)

=== Migration Summary ===
Total jobs: 2
Successfully migrated: 2
Failed: 0
```

**Verify in Postgres:**
```sql
SELECT COUNT(*) FROM prompt_jobs;
SELECT COUNT(*) FROM prompt_job_results;
```

---

## Tracing & Debugging

### Check all jobs in Postgres:
```sql
SELECT id, status, topic, generated_count, total_count, created_at FROM prompt_jobs 
ORDER BY created_at DESC LIMIT 10;
```

### Check results for a specific job:
```sql
SELECT idx, payload->>'title' AS title, payload->>'tool' AS tool 
FROM prompt_job_results 
WHERE job_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
ORDER BY idx LIMIT 10;
```

### Monitor persistence layer:
```bash
# In server logs, you'll see:
# - "Initializing persistence layer..."
# - "Resuming N in-flight jobs from persistence..."
# - On shutdown: persistence layer closes gracefully
```

---

## Expected Behavior Summary

| Scenario | Expectation |
|----------|-------------|
| Create job | Job appears in Postgres with status "queued" |
| Job processing | Status transitions to "running", results appended to DB table |
| Job completion | Status = "completed", `completedAt` timestamp set |
| Cancel job | Status = "cancelled", error message saved |
| Restart (queued jobs) | Re-queued automatically on startup |
| Restart (running jobs) | Transitioned to "queued" and re-queued on startup |
| Pagination | Results paginated correctly with `hasMore` flag accurate |
| Migration | Legacy `.jsonl` files imported into Postgres |

---

## Troubleshooting

**"Failed to initialize persistence/queue services"**
- Check `DATABASE_URL` is valid
- Verify Postgres is running and accessible
- Check logs for connection error details

**"No results returned for job"**
- Job may still be processing; poll status endpoint
- Check `prompt_job_results` table for records
- Verify `offset` and `limit` are valid

**"Restart-resume didn't pick up jobs"**
- Ensure `DATABASE_URL` is set before restart
- Check for jobs with status "queued" or "running" in Postgres
- Verify queue is enabled (REDIS_URL set or in-memory fallback)

---

## Performance Notes

- Postgres connection pool: configurable via `PG_POOL_MAX` (default: 10)
- Result batching: Results appended in chunks during generation
- Cleanup: Old jobs automatically pruned based on `PROMPT_JOB_RETENTION_MS` and `PROMPT_JOB_MAX_SAVED`
- Indexing: Queries use `idx_prompt_jobs_status_created_at` and `idx_prompt_job_results_job_idx` for performance
