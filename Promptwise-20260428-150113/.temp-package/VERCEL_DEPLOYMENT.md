# Vercel Deployment Guide for PromptWise

## Prerequisites
1. [Vercel account](https://vercel.com/signup) (free)
2. [Vercel CLI](https://vercel.com/docs/cli) (optional, for command-line deployment)
3. GitHub repository connected

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended for first-time)

1. **Push your code to GitHub**
   ```powershell
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository: `yinkajjj/Promptwise1`
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**
   In Vercel project settings, add:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NODE_ENV` - Set to `production`
   - `REDIS_URL` - (Optional) If using Redis for job queue
   - `PORT` - Set to `3001` (or let Vercel auto-assign)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like `https://promptwise1.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```powershell
   pnpm add -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy**
   ```powershell
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Set Environment Variables**
   ```powershell
   vercel env add OPENAI_API_KEY
   vercel env add NODE_ENV production
   ```

## Project Configuration

Your `vercel.json` is configured with:
- **Build Command**: `pnpm build`
- **Output Directory**: `dist/public` (Vite client build)
- **API Routes**: `/api/*` routes to serverless functions
- **Node.js Runtime**: 20.x
- **Memory**: 1024 MB
- **Max Duration**: 30 seconds

## Post-Deployment

### Update API Endpoint
If your client makes API calls to `localhost:3001`, update them to use relative paths or Vercel's URL:

```typescript
// Before (development)
const API_URL = "http://localhost:3001/api";

// After (production)
const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:3001/api";
```

### Custom Domain (Optional)
1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Enable Automatic Deployments
Vercel automatically deploys when you push to your main branch. Configure this in:
- Vercel Dashboard → Project Settings → Git

### Monitor Deployments
- Check build logs in Vercel Dashboard
- View runtime logs under "Functions" tab
- Set up monitoring/alerts if needed

## Common Issues

### Build Failures
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `dependencies` (not just `devDependencies`)
- Verify `package.json` scripts are correct

### Environment Variables
- Make sure all required env vars are set in Vercel project settings
- Restart deployment after adding new env vars

### API Route Issues
- Verify `/api` routes work: `https://your-app.vercel.app/api/health`
- Check function logs in Vercel Dashboard

### Redis/Database Connections
- For production, use hosted services:
  - Redis: [Upstash](https://upstash.com/) (free tier available)
  - PostgreSQL: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Supabase](https://supabase.com/)

## Vercel Features to Explore

- **Analytics**: Track page views and performance
- **Speed Insights**: Monitor Core Web Vitals
- **Preview Deployments**: Every branch/PR gets a unique URL
- **Edge Functions**: For ultra-fast API responses
- **KV Storage**: For caching and sessions

## Development Workflow

```powershell
# Local development
pnpm run dev:all

# Test production build locally
pnpm build
pnpm start

# Deploy to Vercel preview
vercel

# Deploy to production
vercel --prod
```

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Import project to Vercel
3. ✅ Set environment variables
4. ✅ Deploy
5. ✅ Test your live site
6. 🔧 Configure custom domain (optional)
7. 📊 Set up monitoring

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
