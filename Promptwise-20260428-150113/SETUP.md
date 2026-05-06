# PromptWise Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and add your OpenAI API key:
```bash
cp .env.example .env
```

**Required:** Add your OpenAI API key to `.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Run the Application

**Option A: Run both client and server together (recommended)**
```bash
pnpm run dev:all
```

**Option B: Run client and server separately**

Terminal 1 (Client):
```bash
pnpm dev
```

Terminal 2 (Server):
```bash
pnpm run dev:server
```

### 4. Open in Browser
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## ✨ Features & How They Work

### 🎯 **Prompt Generation** (Home Page)
1. Enter a topic or objective in the textarea
2. Press **Enter** or click **Generate**
3. The server uses OpenAI API to generate custom prompts
4. Generated prompts are automatically saved to your **History** (left sidebar)
5. You can cancel generation jobs in progress

**Tech:** 
- Frontend: `client/src/pages/Home.tsx`
- Backend: `server/index.ts` - `/api/prompts/jobs` endpoint
- Uses async job processing with progress tracking

### 📚 **Browse Catalog** (Browse Page)
1. Click on category tiles to filter by category
2. Use the filter sidebar (click Filter button) to select AI tools and tones
3. Toggle between **Grid** and **List** view
4. Sort by Popular, Newest, Rating, or A-Z
5. Click any prompt card to view details and copy

**Tech:**
- Real-time filtering with React useMemo
- Multi-select filters for categories, tools, and tones
- Mock data from `client/src/data/mockPrompts.ts`

### ❤️ **My Library** (Library Page)
1. Click the **Heart icon** on any prompt card to save it
2. Saved prompts appear in My Library
3. Create custom collections to organize prompts
4. Drag and drop prompts between collections
5. All data is stored in **localStorage** (client-side only)

**Tech:**
- Custom React hooks: `useSavedPrompts`, `useLibraryCollections`
- Persistent storage in browser localStorage
- No database required for library features

### 📜 **Prompt History** (Sidebar)
- Automatically tracks all your prompt generation requests
- Click any history item to re-run that generation
- Clear history button at the bottom
- Stores up to 100 recent prompts

**Tech:**
- Utility functions in `client/src/lib/promptHistory.ts`
- Event-driven updates across components
- localStorage persistence

### ❓ **Help Center** (Help Page)
- Getting Started guide
- FAQ with expandable answers
- Keyboard shortcuts reference
- Contact support section

---

## 🔧 Configuration Options

### OpenAI API Settings
```env
# Use a different model
OPENAI_MODEL=gpt-4o  # or gpt-3.5-turbo

# Use a compatible API (Groq, Together, etc.)
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_API_KEY=your-groq-key
```

### Generation Limits
```env
# Max prompts per chunk (default: 50)
PROMPT_JOB_CHUNK_SIZE=25

# Max total prompts per job (default: 10,000)
PROMPT_JOB_MAX_COUNT=5000

# How long to keep completed jobs (ms, default: 24 hours)
PROMPT_JOB_RETENTION_MS=3600000
```

### API Protection (Optional)
```env
# Require API key for generation endpoints
PROMPTWISE_API_KEY=your-secret-key
```

Then send requests with header:
```bash
curl -H "X-API-Key: your-secret-key" http://localhost:3001/api/prompts/generate
```

### Redis Queue (Optional - for production)
```env
REDIS_URL=redis://localhost:6379
PROMPT_QUEUE_CONCURRENCY=4
```

Enables distributed job processing with BullMQ.

### Database Persistence (Optional)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/promptwise
PG_POOL_MAX=10
```

Stores jobs and results in PostgreSQL instead of filesystem.

---

## 📁 Project Structure

```
client/
  src/
    pages/          # Main pages (Home, Browse, Library, Help, Settings)
    components/     # Reusable components (Sidebar, PromptCard, etc.)
    hooks/          # Custom React hooks (useSavedPrompts, useLibraryCollections)
    lib/            # Utilities (promptHistory, promptSearch)
    data/           # Mock data (mockPrompts.ts)

server/
  index.ts          # Express server with API endpoints
  persistence.ts    # Database/file storage logic

shared/             # Shared types (if any)
```

---

## 🔑 API Endpoints

### Generate Prompts (Sync)
```bash
POST /api/prompts/generate
Content-Type: application/json

{
  "topic": "e-commerce product launches",
  "count": 20,
  "tools": ["chatgpt", "claude"],
  "tones": ["professional", "conversational"]
}
```

### Create Generation Job (Async)
```bash
POST /api/prompts/jobs
Content-Type: application/json

{
  "topic": "marketing strategies",
  "count": 500,
  "chunkSize": 50,
  "tools": ["chatgpt"],
  "tones": ["creative"]
}

Response: { "jobId": "uuid", "status": "queued", ... }
```

### Check Job Status
```bash
GET /api/prompts/jobs/:jobId

Response: {
  "jobId": "uuid",
  "status": "running",
  "progress": 45,
  "generatedCount": 225,
  "totalCount": 500,
  ...
}
```

### Get Job Results
```bash
GET /api/prompts/jobs/:jobId/results?offset=0&limit=100
```

### Cancel Job
```bash
POST /api/prompts/jobs/:jobId/cancel
```

---

## 🐛 Troubleshooting

### "Failed to generate prompts"
- Check that `OPENAI_API_KEY` is set in `.env`
- Verify your API key is valid at https://platform.openai.com/api-keys
- Check server logs for error details

### Server not responding
- Make sure both client AND server are running
- Client runs on port 3000, server on port 3001
- Use `pnpm run dev:all` to run both together

### Library prompts not saving
- Check browser console for localStorage errors
- Clear localStorage if corrupted: `localStorage.clear()`
- Library uses client-side storage only (no server required)

### Generation stuck at 0%
- Check server logs for errors
- Verify OPENAI_API_KEY is correct
- If using Redis, ensure Redis is running

---

## 📦 Production Build

```bash
# Build both client and server
pnpm build

# Run production server
pnpm start
```

The build outputs to:
- Client: `dist/public/` (static files)
- Server: `dist/index.js` (Node.js bundle)

The production server serves both the API and static frontend.

---

## 🚢 Deployment

### Environment Variables
Make sure to set these in your production environment:
- `OPENAI_API_KEY` (required)
- `PORT` (optional, defaults to 3001)
- `NODE_ENV=production`

### Recommended Services
- **Frontend + Backend**: Render, Railway, Fly.io
- **Frontend only**: Vercel, Netlify (requires separate backend deployment)
- **Redis**: Upstash, Redis Cloud
- **Database**: Neon, Supabase, Railway

---

## 💡 Tips

- **Keyboard Shortcuts**: Press `Enter` in the textarea to generate prompts
- **Quick Search**: Use the search bar on Browse page to find specific prompts
- **Collections**: Organize your library with custom collections (drag & drop)
- **History**: Your generation history is always available in the left sidebar
- **Filters**: Combine multiple filters on Browse page for precise results

---

## 🤝 Need Help?

- Check the **Help Center** page in the app
- Review API documentation above
- Check `server/index.ts` for backend logic
- Check `client/src/pages/Home.tsx` for frontend logic

---

**Built with:** React, TypeScript, Express, OpenAI API, Vite, Tailwind CSS
