# Intelligent 3-Tier Prompt System

## Overview
PromptWise now features an intelligent, multi-tier prompt generation system specifically designed for **short-form video creators** (TikTok, YouTube Shorts, Instagram Reels).

## Key Features

### 🎯 Unique Positioning
**"The only prompt tool built specifically for short-form video creators"**

Instead of being a generic prompt generator, PromptWise now focuses exclusively on helping creators make better content for TikTok, YouTube Shorts, and Reels.

### 🧠 Intelligent Refinement Flow

**Step 1: User enters their idea**
```
Example: "I want to make videos about AI tools for beginners"
```

**Step 2: System asks refinement questions**
- **Platform**: TikTok only? YouTube Shorts? All platforms?
- **Content Type**: Educational? Entertaining? Tutorial? Storytelling?

**Step 3: Generate 3 versions**

## 📊 3-Tier Prompt System

### 1. Basic Prompt 📝
- **For**: Beginners, quick ideas
- **Description**: Simple and easy to use
- **Example**: `Create tutorial content about: AI tools for beginners`

### 2. Better Prompt 🎯
- **For**: More detailed output
- **Description**: Includes context, platform specifics, structure suggestions
- **Example**: Mentions platform, video format, hooks, structure, call-to-action

### 3. Expert Prompt 🚀
- **For**: Best quality results
- **Description**: Comprehensive with role, task, format, and tone
- **Includes**:
  - Role definition (expert strategist)
  - Detailed task breakdown
  - Specific deliverables (hook, core message, visuals, script timing, CTA, hashtags)
  - Tone specification
  - Platform optimization notes

## 🎨 UI Design

### Card-Based Display
Each prompt tier is displayed in a card with:
- **Icon & Title**: Visual hierarchy (📝 Basic, 🎯 Better, 🚀 Expert)
- **Description**: What it's good for
- **Copy Button**: One-click copy to clipboard
- **Syntax Highlighting**: Monospace font in bordered container
- **Visual Emphasis**: Expert prompt has special styling (primary border, background tint)

### Interactive Elements
- **Copy Feedback**: Button changes to "✓ Copied!" with color change
- **Follow-up Actions**:
  - "Generate New Prompt" - Start over
  - "Refine & Regenerate" - Adjust refinement questions and regenerate
- **Pro Tip**: Educational hint about when to use each tier

## 🎬 Short-Form Video Optimizations

The prompts are specifically optimized for:
1. **Mobile viewing** - Vertical format considerations
2. **Attention hooks** - First 3 seconds strategy
3. **Watch time** - Keeping viewers engaged
4. **Engagement** - Comments, shares, saves
5. **Viral potential** - Trend awareness
6. **Quick value delivery** - 15-60 second format

## 📋 User Flow

```
1. User enters topic
   ↓
2. Click "Generate Prompt"
   ↓
3. Refinement questions appear (platform, content type)
   ↓
4. Click "Generate My Prompts"
   ↓
5. View 3 tiers: Basic, Better, Expert
   ↓
6. Copy the one that fits their needs
   ↓
7. Option to refine or start new
```

## 🔧 Technical Implementation

### New State Variables
```typescript
- showRefinement: boolean          // Toggle refinement UI
- tieredPrompts: PromptTier[]      // Store 3 generated prompts
- copiedPrompt: string | null      // Track which prompt was copied
- refinementPlatform: string       // User's platform choice
- refinementContentType: string    // User's content type choice
```

### Key Functions
- `generate3TierPrompts()`: Creates Basic/Better/Expert versions
- `handleCopyPrompt()`: Clipboard copy with visual feedback
- Modified `handleGenerate()`: Shows refinement before generation

## 🎯 Competitive Advantage

Unlike generic prompt generators:
- ✅ **Niche-focused**: Built for video creators, not writers/coders
- ✅ **Multi-tier output**: 3 versions instead of 1
- ✅ **Interactive refinement**: Asks questions before generating
- ✅ **Platform-specific**: Optimized for TikTok/Shorts/Reels format
- ✅ **Viral optimization**: Includes hooks, structure, hashtags, CTA

## 📝 Content Updates

### Headline
**Before**: "Turn your idea into a better AI prompt"
**After**: "Better AI prompts for your short-form videos"

### Subtext
Emphasizes the unique positioning: "The only prompt tool built specifically for TikTok, YouTube Shorts, and Reels creators"

### Input Placeholder
Changed from generic example to video-focused: "I want to make videos about AI tools for beginners..."

### Category Options
Updated from generic (job-application, email, study) to video-specific:
- Tutorial / How-to
- Educational content
- Entertainment / Comedy
- Lifestyle / Daily vlog
- Product review
- Storytelling
- Motivation / Inspiration
- Challenge / Trend
- Behind the scenes

## 🚀 Next Steps

Potential enhancements:
1. Add script timing calculator (e.g., "This will be 42 seconds")
2. Trending hashtag suggestions from live data
3. Hook templates library ("What if I told you...")
4. Visual storyboard generator
5. Platform-specific best practices (TikTok vs Shorts differences)
6. Viral score predictor based on content type
7. Integration with video editing tools

## 💡 Usage Tips

**For Users**:
- Start with Better Prompt if unsure
- Use Expert Prompt for important content
- Try all 3 to see different AI outputs
- Refine your answers for better results

**For Creators**:
- The Expert Prompt includes everything AI needs to create viral-worthy content
- Platform choice matters (TikTok trends differ from Reels)
- Content type affects the prompt structure
- Answer refinement questions thoughtfully for best results
