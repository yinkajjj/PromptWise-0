# PromptWise - Quick Reference Card

## 🚀 Quick Start
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-your-key-here

# 3. Install dependencies
pnpm install

# 4. Run everything
pnpm run dev:all

# 5. Open browser
# http://localhost:3000
```

## ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Enter` | Generate prompts (in textarea) |
| `Shift + Enter` | New line (in textarea) |
| `Esc` | Close dialogs |

## 🎯 Key Features

### Home Page
- **Generate Prompts**: Enter topic → Press Enter
- **View Progress**: Real-time progress bar
- **Cancel Job**: Click Cancel button
- **History**: Left sidebar shows all generations

### Browse Page
- **Filter by Category**: Click category tiles
- **Advanced Filters**: Click Filter button
- **Sort**: Use dropdown (Popular/Newest/Rating/A-Z)
- **View Modes**: Toggle Grid ⇄ List
- **Save Prompt**: Click ❤️ heart icon

### Library Page
- **View Saved**: All saved prompts
- **Create Collection**: Enter name + Create
- **Organize**: Drag & drop or use dropdown
- **Manage**: Pencil (rename) | Trash (delete)

### Settings
- **Profile**: Edit name, email, bio
- **Theme**: White | Grey | Dark
- **OTP Demo**: Test email verification

### Help
- **FAQ**: Click questions to expand
- **Shortcuts**: Quick reference table
- **Support**: Contact information

## 📁 Project Structure
```
client/src/
  ├── pages/          # Main pages
  │   ├── Home.tsx           # Generation
  │   ├── Browse.tsx         # Catalog
  │   ├── Library.tsx        # Saved
  │   ├── Community.tsx      # Help (renamed)
  │   └── Settings.tsx       # Preferences
  ├── components/     # Reusable UI
  │   ├── Sidebar.tsx        # Navigation
  │   ├── PromptCard.tsx     # Prompt display
  │   └── ui/                # Primitives
  ├── hooks/          # Custom hooks
  │   ├── useSavedPrompts.ts
  │   └── useLibraryCollections.ts
  └── lib/            # Utilities
      ├── promptHistory.ts
      └── promptSearch.ts

server/
  ├── index.ts        # Express API
  └── persistence.ts  # Storage logic
```

## 🔌 API Endpoints

### Generate Prompts
```bash
POST /api/prompts/jobs
{
  "topic": "marketing strategies",
  "count": 20,
  "tools": ["chatgpt", "claude"],
  "tones": ["professional"]
}
→ Returns: { jobId, status, totalCount }
```

### Check Status
```bash
GET /api/prompts/jobs/:jobId
→ Returns: { status, progress, generatedCount, previewPrompts }
```

### Get Results
```bash
GET /api/prompts/jobs/:jobId/results?offset=0&limit=100
→ Returns: { prompts: [...], hasMore, total }
```

### Cancel Job
```bash
POST /api/prompts/jobs/:jobId/cancel
→ Returns: { status: "cancelled", generatedCount }
```

## 💾 localStorage Keys
| Key | Purpose |
|-----|---------|
| `promptwise:prompt-history` | Generation history (100 max) |
| `promptwise:saved-prompts` | Saved prompts (25 max) |
| `promptwise:library-collections` | Collections (1 max) |
| `promptwise:profile` | User profile data |
| `promptwise:theme` | Theme preference |

## 🎨 Theme Options
- **White**: High contrast, crisp
- **Grey**: Neutral, soft
- **Dark**: Low-light mode

## 🔧 Environment Variables

### Required
```env
OPENAI_API_KEY=sk-your-key-here
```

### Optional
```env
OPENAI_MODEL=gpt-4o-mini          # Model to use
OPENAI_BASE_URL=...               # Alternative API
PORT=3001                         # Server port
PROMPTWISE_API_KEY=...            # API authentication
REDIS_URL=...                     # Queue persistence
DATABASE_URL=...                  # Job persistence
```

## 🐛 Troubleshooting

### Generation not working?
- ✅ Check OPENAI_API_KEY in .env
- ✅ Verify server is running (port 3001)
- ✅ Check browser console for errors
- ✅ Check server terminal for errors

### Prompts not saving?
- ✅ Check browser localStorage quota
- ✅ Try clearing localStorage
- ✅ Check browser console for errors

### Server won't start?
- ✅ Check if port 3001 is in use
- ✅ Run: `netstat -ano | findstr :3001`
- ✅ Kill process or change PORT in .env

### Filters not working?
- ✅ Refresh the page
- ✅ Click "Clear all filters"
- ✅ Check browser console

## 📊 Limits (Free Tier)
- **Saved Prompts**: 25 maximum
- **Collections**: 1 maximum  
- **History**: 100 most recent
- **Generation**: 10,000 prompts per job

## 🎯 Common Tasks

### Generate prompts for multiple tools
```typescript
// On Home page, textarea:
"Create product launch strategies"
→ Press Enter
→ Automatically uses all configured tools
```

### Find specific prompts
```typescript
// On Browse page:
1. Click category tile (e.g., "Business")
2. Open filter sidebar
3. Select tools (e.g., ChatGPT, Claude)
4. Select tones (e.g., Professional)
5. Use search bar for keywords
```

### Organize library
```typescript
// On Library page:
1. Create collection: "Marketing"
2. Drag prompt to collection column
// OR
1. Use dropdown under each prompt
2. Select target collection
```

## 📝 Tips & Tricks

1. **History Sidebar**: Click any history item to re-run that generation
2. **Quick Filter**: Category tiles are fastest way to filter
3. **Hover Preview**: Hover over prompts to see full text
4. **Copy Prompt**: Click copy icon on any prompt card
5. **Theme Switch**: Change theme in Settings → Appearance
6. **View Toggle**: Switch between Grid/List on Browse page
7. **Active Filters**: Click X on filter chips to remove individual filters

## 🚀 Production Checklist
- [ ] Set OPENAI_API_KEY
- [ ] Configure REDIS_URL (optional)
- [ ] Configure DATABASE_URL (optional)
- [ ] Set PROMPTWISE_API_KEY for security
- [ ] Enable CORS for your domain
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Set up backups (if using DB)
- [ ] Test all features
- [ ] Review security headers

## 📚 Documentation
- **Full Setup**: See `SETUP.md`
- **Functionality**: See `README-FUNCTIONALITY.md`
- **Code Guide**: See `.github/copilot-instructions.md`
- **Environment**: See `.env.example`

## 🆘 Need Help?
- Check the **Help** page in the app
- Review `SETUP.md` for detailed instructions
- Check server logs for backend errors
- Check browser console for frontend errors

---

**Version**: 1.0.0  
**Updated**: 2025-01-XX  
**Status**: ✅ All features functional
