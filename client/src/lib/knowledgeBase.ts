/**
 * Phase 4: RAG (Retrieval-Augmented Generation) System
 * 
 * This system provides contextual knowledge retrieval for viral hooks,
 * best practices, successful creator patterns, and platform strategies.
 */

export type KnowledgeDocument = {
  id: string;
  category: "viral-hook" | "creator-pattern" | "platform-strategy" | "best-practice" | "trend-data";
  platform?: "youtube" | "tiktok" | "instagram" | "twitter" | "general";
  niche?: string;
  title: string;
  content: string;
  metadata: {
    effectiveness: number; // 0-100
    audience: string;
    format: string;
    useCase: string[];
    tags: string[];
  };
  embedding?: number[]; // For future semantic search
};

export type RetrievalContext = {
  query: string;
  platform?: string;
  niche?: string;
  audience?: string;
  useCase?: string;
  limit?: number;
};

export class KnowledgeBase {
  private documents: KnowledgeDocument[] = [];

  constructor() {
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase(): void {
    // Viral Hooks Database
    this.documents.push(
      // YouTube Hooks
      {
        id: "hook_yt_1",
        category: "viral-hook",
        platform: "youtube",
        title: "Pattern Interrupt Hook",
        content: "Most people think [common belief], but [surprising truth]. In this video, I'll show you why [consequence] and how [solution].",
        metadata: {
          effectiveness: 92,
          audience: "general",
          format: "long-form",
          useCase: ["education", "how-to", "explainer"],
          tags: ["pattern-interrupt", "curiosity", "contradiction"],
        },
      },
      {
        id: "hook_yt_2",
        category: "viral-hook",
        platform: "youtube",
        title: "Transformation Promise",
        content: "In the next [timeframe], I'm going to show you how to [achieve result] without [common struggle]. And it's easier than you think.",
        metadata: {
          effectiveness: 88,
          audience: "beginners",
          format: "tutorial",
          useCase: ["how-to", "skill-building", "productivity"],
          tags: ["transformation", "promise", "ease"],
        },
      },
      {
        id: "hook_yt_3",
        category: "viral-hook",
        platform: "youtube",
        title: "Mistake Revelation",
        content: "I made a [costly mistake] so you don't have to. Here's what happened and the 3 lessons that saved me [benefit].",
        metadata: {
          effectiveness: 90,
          audience: "intermediate",
          format: "story",
          useCase: ["case-study", "lessons-learned", "cautionary-tale"],
          tags: ["mistake", "lesson", "empathy"],
        },
      },

      // TikTok Hooks
      {
        id: "hook_tt_1",
        category: "viral-hook",
        platform: "tiktok",
        title: "Scroll-Stopper Question",
        content: "Wait, you're [doing common thing] wrong? Here's what [experts/successful people] actually do.",
        metadata: {
          effectiveness: 95,
          audience: "general",
          format: "short-form",
          useCase: ["tips", "hacks", "quick-wins"],
          tags: ["question", "correction", "authority"],
        },
      },
      {
        id: "hook_tt_2",
        category: "viral-hook",
        platform: "tiktok",
        title: "Urgent Warning",
        content: "Stop! If you're about to [common action], watch this first. This mistake costs people [consequence].",
        metadata: {
          effectiveness: 93,
          audience: "beginners",
          format: "short-form",
          useCase: ["warnings", "mistakes", "prevention"],
          tags: ["urgency", "warning", "consequence"],
        },
      },
      {
        id: "hook_tt_3",
        category: "viral-hook",
        platform: "tiktok",
        title: "Secret Reveal",
        content: "[Industry/Niche] doesn't want you to know this, but [surprising fact]. Here's how to use it.",
        metadata: {
          effectiveness: 91,
          audience: "general",
          format: "short-form",
          useCase: ["secrets", "insider-tips", "controversial"],
          tags: ["secret", "controversy", "insider"],
        },
      }
    );

    // Platform Strategy Best Practices
    this.documents.push(
      {
        id: "strategy_yt_1",
        category: "platform-strategy",
        platform: "youtube",
        title: "YouTube Long-Form Strategy",
        content: "For YouTube success: Hook in first 8 seconds, establish credibility by 30s, deliver value throughout, use pattern interrupts every 2-3 minutes, strong CTA at 80% mark. Optimal length: 8-12 minutes for educational content.",
        metadata: {
          effectiveness: 87,
          audience: "creators",
          format: "strategy",
          useCase: ["content-planning", "video-structure"],
          tags: ["youtube", "retention", "structure"],
        },
      },
      {
        id: "strategy_tt_1",
        category: "platform-strategy",
        platform: "tiktok",
        title: "TikTok Viral Formula",
        content: "TikTok algorithm priorities: watch time percentage > completion rate > re-watches. Hook within 1 second, payoff by 15 seconds. Use trending sounds (not music). Post 1-3x daily during peak hours (7-9am, 12-1pm, 7-11pm EST).",
        metadata: {
          effectiveness: 92,
          audience: "creators",
          format: "strategy",
          useCase: ["content-planning", "growth"],
          tags: ["tiktok", "algorithm", "timing"],
        },
      }
    );

    // Creator Patterns
    this.documents.push(
      {
        id: "creator_pattern_1",
        category: "creator-pattern",
        platform: "youtube",
        niche: "ai-tools",
        title: "AI Tool Review Format",
        content: "Successful AI tool creators follow this pattern: Open with bold claim/result, show the tool in action first (not explanation), demonstrate 3 specific use cases, compare to alternatives, end with honest limitations + who it's for.",
        metadata: {
          effectiveness: 89,
          audience: "creators",
          format: "content-framework",
          useCase: ["reviews", "comparisons", "tutorials"],
          tags: ["ai-tools", "reviews", "credibility"],
        },
      },
      {
        id: "creator_pattern_2",
        category: "creator-pattern",
        platform: "tiktok",
        niche: "productivity",
        title: "Productivity Hack Format",
        content: "Top productivity creators use: Start with relatable pain point, introduce hack as 'game-changer', show before/after or time-lapse, provide one actionable step, end with challenge or question to boost comments.",
        metadata: {
          effectiveness: 91,
          audience: "creators",
          format: "content-framework",
          useCase: ["tips", "hacks", "lifestyle"],
          tags: ["productivity", "engagement", "actionable"],
        },
      }
    );

    // Best Practices
    this.documents.push(
      {
        id: "best_practice_1",
        category: "best-practice",
        platform: "general",
        title: "Thumbnail Psychology",
        content: "High-performing thumbnails use: 1) Faces with exaggerated expressions (surprise/shock), 2) Bold text (3-5 words max), 3) High contrast colors (red/yellow/blue), 4) Curiosity gap (show part of result), 5) Avoid clutter (max 3 elements).",
        metadata: {
          effectiveness: 94,
          audience: "creators",
          format: "best-practice",
          useCase: ["thumbnails", "click-through"],
          tags: ["thumbnails", "ctr", "psychology"],
        },
      },
      {
        id: "best_practice_2",
        category: "best-practice",
        platform: "general",
        title: "Retention Strategies",
        content: "Keep viewers watching: Use open loops (promise payoff later), fast pacing (cut pauses), visual variety (b-roll every 5-10 sec), curiosity timestamps in description, pattern interrupts (sudden music change, visual effect, question).",
        metadata: {
          effectiveness: 88,
          audience: "creators",
          format: "best-practice",
          useCase: ["retention", "engagement"],
          tags: ["retention", "editing", "pacing"],
        },
      }
    );
  }

  // Retrieve relevant knowledge
  retrieve(context: RetrievalContext): KnowledgeDocument[] {
    const { query, platform, niche, audience, useCase, limit = 5 } = context;

    let scored = this.documents.map(doc => {
      let score = 0;

      // Platform match (high priority)
      if (platform && (doc.platform === platform || doc.platform === "general")) {
        score += 30;
      }

      // Niche match
      if (niche && doc.niche === niche) {
        score += 20;
      }

      // Use case match
      if (useCase && doc.metadata.useCase.includes(useCase)) {
        score += 25;
      }

      // Audience match
      if (audience && doc.metadata.audience === audience) {
        score += 15;
      }

      // Query keyword matching (simple text search)
      const queryLower = query.toLowerCase();
      const contentLower = (doc.title + " " + doc.content + " " + doc.metadata.tags.join(" ")).toLowerCase();

      const queryWords = queryLower.split(/\s+/);
      queryWords.forEach(word => {
        if (word.length > 3 && contentLower.includes(word)) {
          score += 5;
        }
      });

      // Effectiveness bonus
      score += doc.metadata.effectiveness * 0.1;

      return { doc, score };
    });

    // Sort by score and return top results
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.doc);
  }

  // Get viral hook examples
  getViralHooks(platform: string, niche?: string, audience?: string): KnowledgeDocument[] {
    return this.retrieve({
      query: "viral hook",
      platform,
      niche,
      audience,
      limit: 5,
    });
  }

  // Get platform strategy
  getPlatformStrategy(platform: string): KnowledgeDocument[] {
    return this.documents.filter(
      doc => doc.category === "platform-strategy" && doc.platform === platform
    );
  }

  // Get creator patterns
  getCreatorPatterns(platform: string, niche: string): KnowledgeDocument[] {
    return this.documents.filter(
      doc =>
        doc.category === "creator-pattern" &&
        (doc.platform === platform || doc.platform === "general") &&
        (doc.niche === niche || !doc.niche)
    );
  }

  // Get best practices
  getBestPractices(context: string): KnowledgeDocument[] {
    return this.retrieve({
      query: context,
      limit: 3,
    });
  }
}
