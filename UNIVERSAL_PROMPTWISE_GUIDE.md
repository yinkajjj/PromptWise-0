# 🌟 PromptWise Universal - Complete Guide

## What Changed

PromptWise has evolved from a **video-only prompt generator** into a **universal AI prompt tool** that works across all domains of life and work.

---

## 🎯 Core Philosophy

**"Just enter your topic and get beautiful prompts — for anything."**

- ✅ Resumes & CVs (all types worldwide)
- ✅ Academic research (Bachelor's, Master's, PhD)
- ✅ Business documents (proposals, reports, plans)
- ✅ Video content (TikTok, YouTube, Reels)
- ✅ Creative writing (stories, scripts, novels)
- ✅ Marketing & ads (campaigns, copy, emails)
- ✅ Technical documentation (guides, APIs, specs)
- ✅ Personal development (goals, coaching, journaling)
- ✅ Legal & formal documents (contracts, letters)
- ✅ Education & teaching (lesson plans, courses)

---

## 🏗️ New Architecture

### 1. **Universal Use Case System** (`client/src/lib/useCases.ts`)

Defines 10 broad categories, each with:
- **Icon** (visual identifier)
- **Categories** (subcategories within each use case)
- **Target outputs** (what users want to create)
- **Examples** (real-world scenarios)

```typescript
interface UseCase {
  id: string;
  name: string;
  icon: string;
  description: string;
  categories: string[];
  targetOutputs: string[];
  examples: string[];
}
```

### 2. **Universal Prompt Generator** (`client/src/lib/universalPromptGenerator.ts`)

Generates **3 tiers** (Basic, Better, Expert) for **any use case**:

- **Basic**: Quick start, beginner-friendly
- **Better**: Strategic depth with multiple approaches
- **Expert**: Professional multi-angle strategy

Each tier is **context-aware** — prompts adapt to:
- Use case (video vs resume vs research)
- Category (tutorial vs thesis vs business plan)
- Tone (professional vs friendly vs creative)
- Topic (user's specific input)

---

## 🎨 User Experience Flow

### Step 1: Select Use Case (Visual Grid)
User picks from 10 icon-based categories at the top of the page.

### Step 2: Enter Topic
Input placeholder changes dynamically:
- Video: "Enter your topic (e.g., How to start coding in 2025)..."
- Resume: "Enter your topic (e.g., Senior Software Engineer position)..."
- Academic: "Enter your topic (e.g., AI ethics in healthcare)..."

### Step 3: Refine (Optional)
- **Sub-category**: Context-aware dropdown (e.g., "Tutorial" for video, "ATS-friendly" for resume)
- **Tone**: Professional, Friendly, Simple, Confident, Creative
- **AI Tool**: ChatGPT, Claude, Gemini, etc.

### Step 4: Generate
Click once → get 3 unique prompts instantly.

---

## 📐 Prompt Design Principles

### ✅ **Diversity Within Tiers**

Each "Better" tier randomly selects from **multiple approaches**:

**Video Content:**
- Storytelling approach
- Quick tips format
- Challenge/experiment
- Myth-busting

**Resume/CV:**
- Achievement-focused
- Skills-based

**Academic Research:**
- Problem-solution framework
- Literature-driven approach

### ✅ **Expert Prompts Are Multi-Concept**

Expert tier generates **3 different angles** per use case:

**Video:** Emotional storytelling | Entertainment-first | Insider reveal  
**Resume:** Traditional corporate | Modern showcase | Hybrid ATS-optimized  
**Academic:** Theoretical | Empirical | Mixed-methods

User picks the best fit and gets a complete execution blueprint.

### ✅ **Context-Aware Intelligence**

Prompts include:
- Domain-specific best practices
- Industry keywords and trends
- Target audience considerations
- Platform/format optimization

---

## 🔧 Technical Implementation

### Files Created/Modified

| File | Purpose |
|------|---------|
| `client/src/lib/useCases.ts` | Use case definitions |
| `client/src/lib/universalPromptGenerator.ts` | Prompt generation engine (6 use cases implemented) |
| `client/src/pages/Home.tsx` | UI integration, state management |
| `client/src/index.css` | Container width (1600px for less empty space) |

### Key Changes in `Home.tsx`

1. **State Management**
   ```typescript
   const [selectedUseCase, setSelectedUseCase] = useState<string>("video-content");
   const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
   ```

2. **Dynamic UI**
   - Use case selector grid (10 buttons with icons)
   - Dynamic placeholder text
   - Context-aware sub-category dropdown

3. **Prompt Generation**
   ```typescript
   const basicPrompt = generateUniversalPrompt(selectedUseCase, "basic", topic, category, tone);
   const betterPrompt = generateUniversalPrompt(selectedUseCase, "better", topic, category, tone);
   const expertPrompt = generateUniversalPrompt(selectedUseCase, "expert", topic, category, tone);
   ```

---

## 🧠 Intelligence Features (Preserved)

All previous intelligence features still work:

✅ **Prompt Library** — Save, favorite, tag, rate, search prompts  
✅ **Topic Intelligence** — Analyze viability, trends, seasonality *(video-only for now)*  
✅ **Prompt Remix** — 8 remix modes (make viral, simplify, add detail, etc.)  
✅ **Smart Search** — AI-powered search intent interpretation  
✅ **History Tracking** — Recent topics and searches

---

## 🚀 Extending PromptWise

### Adding New Use Cases

1. **Define use case** in `useCases.ts`:
   ```typescript
   {
     id: "new-category",
     name: "New Category",
     icon: "🎯",
     description: "...",
     categories: ["Type 1", "Type 2"],
     targetOutputs: ["Output 1", "Output 2"],
     examples: ["Example 1", "Example 2"]
   }
   ```

2. **Add prompt strategy** in `universalPromptGenerator.ts`:
   ```typescript
   "new-category": {
     useCase: "New Category",
     basic: (topic, category) => "...",
     better: (topic, category, tone) => [...],
     expert: (topic, category, tone) => "..."
   }
   ```

3. **Update UI labels** in `Home.tsx` (if needed for refinement questions).

---

## 📊 Completion Status

| Use Case | Status |
|----------|--------|
| Video Content | ✅ Fully implemented |
| Resume & CV | ✅ Fully implemented |
| Academic Research | ✅ Fully implemented |
| Business Writing | ✅ Fully implemented |
| Creative Writing | ✅ Fully implemented |
| Marketing & Ads | ✅ Fully implemented |
| Technical Documentation | ⚠️ Defined in useCases.ts, generator pending |
| Personal Development | ⚠️ Defined in useCases.ts, generator pending |
| Legal & Formal | ⚠️ Defined in useCases.ts, generator pending |
| Education & Teaching | ⚠️ Defined in useCases.ts, generator pending |

**Next Step:** Complete prompt generators for the remaining 4 use cases following the same pattern.

---

## 🎨 Design Highlights

- **Minimalist header** inspired by ChatGPT
- **Icon-based use case selector** for instant recognition
- **Dynamic placeholder** adapts to selected use case
- **Side-by-side prompt cards** (3-column grid)
- **Wider container** (1600px max-width) to reduce empty space
- **Smooth animations** (Framer Motion)

---

## 🧪 Testing the New System

### Video Content (Original)
**Topic:** "How to start coding in 2025"  
**Use Case:** Video Content  
**Sub-category:** Tutorial  
**Result:** 3 prompts (story-driven, tips format, challenge format)

### Resume/CV (New)
**Topic:** "Senior Product Manager at Google"  
**Use Case:** Resume & CV  
**Sub-category:** ATS-friendly  
**Result:** Achievement-focused OR skills-based prompt (randomized)

### Academic Research (New)
**Topic:** "AI ethics in autonomous vehicles"  
**Use Case:** Academic Research  
**Sub-category:** PhD Dissertation  
**Result:** Problem-solution OR literature-driven approach (randomized)

---

## 🌍 Global Reach

### Resume Types Supported
- Chronological, Functional, Combination
- ATS-friendly, Creative portfolio, Executive
- Federal (USAJOBS), Academic CV, International formats

### Academic Levels Supported
- Undergraduate projects
- Bachelor's thesis
- Master's thesis
- PhD dissertation
- Research proposals
- Grant applications

### Business Documents Supported
- Business proposals, Strategic reports, Executive summaries
- Market research, Financial reports, Project plans
- Investment decks, Case studies, White papers

---

## 💡 Why This Matters

### Before (Video-Only)
"Better AI prompts for your short-form videos"  
→ **Narrow audience:** Content creators only

### After (Universal)
"Beautiful prompts for anything you create"  
→ **Broad audience:** Students, job seekers, business professionals, creators, writers, marketers, educators, and more

### Impact
- **10x larger market** (from niche to universal)
- **Maintains simplicity** (same 3-tier flow)
- **Preserved intelligence** (all features still work)
- **Scalable architecture** (easy to add new use cases)

---

## 🔮 Future Enhancements

1. **Complete remaining 4 generators** (technical docs, personal dev, legal, education)
2. **Add domain-specific intelligence** (like topic analysis for resumes, plagiarism checks for academic)
3. **Multi-language support** (international CVs, multilingual content)
4. **Industry templates** (pre-built prompts for common scenarios)
5. **AI feedback loop** (users rate prompts, system learns and improves)

---

## 📝 Summary

PromptWise is now a **universal AI prompt assistant** that cuts across all spheres of life:

✅ **Videos** → Create viral TikToks, YouTube Shorts, Reels  
✅ **Resumes** → Craft ATS-friendly CVs for any job worldwide  
✅ **Research** → Write thesis proposals from Bachelor's to PhD  
✅ **Business** → Generate proposals, reports, and strategic plans  
✅ **Writing** → Develop stories, scripts, and creative content  
✅ **Marketing** → Build high-converting ad campaigns  
✅ **And more...**

**One topic input. Three beautiful prompts. Infinite possibilities.**

---

## 🚀 Deployment

The universal system is **production-ready**:
- ✅ Built successfully (`pnpm build`)
- ✅ Preview server running (`pnpm preview`)
- ✅ All previous features preserved
- ✅ TypeScript type-safe
- ✅ Mobile-responsive UI

**Ready to push to GitHub and go live!**
