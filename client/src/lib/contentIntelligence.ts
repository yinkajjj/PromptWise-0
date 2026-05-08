// Phase 3: YouTube/TikTok Trend Analysis & Viral Content Intelligence

export type TrendData = {
  keyword: string;
  platform: "youtube" | "tiktok" | "both";
  trendScore: number; // 0-100
  category: string;
  momentum: "rising" | "stable" | "declining";
  peakTime: string;
  relatedTrends: string[];
  audienceAge: string;
  bestPostingTimes: string[];
};

export type ViralHook = {
  hook: string;
  type: "question" | "shock" | "curiosity" | "personal" | "trending";
  effectiveness: number; // 0-100
  reasoning: string;
  examples: string[];
};

export type ScriptSection = {
  timestamp: string;
  section: "hook" | "intro" | "body" | "climax" | "cta";
  content: string;
  purpose: string;
  duration: string;
};

export type ThumbnailIdea = {
  concept: string;
  elements: string[];
  colorScheme: string;
  textOverlay: string;
  emotionalTrigger: string;
  clickabilityScore: number; // 0-100
  reasoning: string;
};

/**
 * YouTube/TikTok Trend Analyzer
 * Analyzes trending topics and provides data-driven insights
 */
export class TrendAnalyzer {
  private trendDatabase: Record<string, any> = {
    // Trending topics (simulated - in production would use real APIs)
    "ai": { score: 95, momentum: "rising", category: "Technology", audience: "18-34" },
    "climate change": { score: 88, momentum: "stable", category: "Science", audience: "18-44" },
    "productivity": { score: 85, momentum: "rising", category: "Self-improvement", audience: "22-40" },
    "finance": { score: 82, momentum: "stable", category: "Business", audience: "25-45" },
    "fitness": { score: 80, momentum: "stable", category: "Health", audience: "18-35" },
    "cooking": { score: 78, momentum: "stable", category: "Lifestyle", audience: "25-55" },
    "travel": { score: 76, momentum: "rising", category: "Lifestyle", audience: "22-45" },
    "gaming": { score: 90, momentum: "stable", category: "Entertainment", audience: "13-30" },
    "music": { score: 87, momentum: "stable", category: "Entertainment", audience: "13-40" },
    "fashion": { score: 84, momentum: "rising", category: "Lifestyle", audience: "16-35" },
  };

  analyzeTrend(topic: string, platform: "youtube" | "tiktok" | "both"): TrendData {
    const topicLower = topic.toLowerCase();

    // Find matching trend
    let trendScore = 50; // Default
    let category = "General";
    let momentum: "rising" | "stable" | "declining" = "stable";
    let audienceAge = "18-44";

    for (const [key, data] of Object.entries(this.trendDatabase)) {
      if (topicLower.includes(key)) {
        trendScore = data.score;
        momentum = data.momentum;
        category = data.category;
        audienceAge = data.audience;
        break;
      }
    }

    // Platform-specific adjustments
    if (platform === "tiktok") {
      trendScore += 5; // TikTok tends to have higher engagement
      audienceAge = "16-34"; // Younger on TikTok
    }

    // Related trends
    const relatedTrends = this.generateRelatedTrends(topic, category);

    // Best posting times
    const bestPostingTimes = this.getBestPostingTimes(platform, audienceAge);

    return {
      keyword: topic,
      platform,
      trendScore: Math.min(trendScore, 100),
      category,
      momentum,
      peakTime: this.getPeakTime(momentum),
      relatedTrends,
      audienceAge,
      bestPostingTimes,
    };
  }

  private generateRelatedTrends(topic: string, category: string): string[] {
    const related: Record<string, string[]> = {
      "Technology": ["AI tools", "coding", "tech reviews", "software tutorials", "gadgets"],
      "Science": ["research", "experiments", "space", "biology", "physics"],
      "Self-improvement": ["habits", "mindset", "goals", "motivation", "success"],
      "Business": ["entrepreneurship", "investing", "marketing", "side hustles", "passive income"],
      "Health": ["nutrition", "mental health", "wellness", "exercise", "lifestyle"],
      "Lifestyle": ["home decor", "organization", "routines", "vlogs", "DIY"],
      "Entertainment": ["reviews", "reactions", "comedy", "drama", "tutorials"],
    };

    return related[category] || ["trending content", "viral videos", "popular topics"];
  }

  private getBestPostingTimes(platform: string, audienceAge: string): string[] {
    if (platform === "tiktok") {
      return ["7-9 AM", "12-1 PM", "7-11 PM"];
    } else if (platform === "youtube") {
      return ["2-4 PM", "6-9 PM", "12-2 PM (weekends)"];
    }
    return ["12-1 PM", "6-9 PM"];
  }

  private getPeakTime(momentum: string): string {
    if (momentum === "rising") return "Now - next 3 months";
    if (momentum === "declining") return "Past 6 months";
    return "Ongoing";
  }
}

/**
 * Viral Hook Generator
 * Creates attention-grabbing hooks for videos
 */
export class ViralHookGenerator {
  generateHooks(topic: string, platform: string, audience: string): ViralHook[] {
    const hooks: ViralHook[] = [];

    // Question hooks
    hooks.push(...this.generateQuestionHooks(topic));

    // Shock/Controversy hooks
    hooks.push(...this.generateShockHooks(topic));

    // Curiosity gap hooks
    hooks.push(...this.generateCuriosityHooks(topic));

    // Personal story hooks
    hooks.push(...this.generatePersonalHooks(topic));

    // Trending format hooks
    hooks.push(...this.generateTrendingHooks(topic, platform));

    // Sort by effectiveness and return top 6
    return hooks
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 6);
  }

  private generateQuestionHooks(topic: string): ViralHook[] {
    return [
      {
        hook: `What if I told you ${topic} is completely different than you think?`,
        type: "question",
        effectiveness: 85,
        reasoning: "Challenges assumptions and creates curiosity",
        examples: ["What if I told you AI is not what you think?", "What if everything you know about fitness is wrong?"],
      },
      {
        hook: `Have you ever wondered why ${topic} really matters?`,
        type: "question",
        effectiveness: 78,
        reasoning: "Invites viewer reflection and engagement",
        examples: ["Have you ever wondered why climate action really matters?"],
      },
    ];
  }

  private generateShockHooks(topic: string): ViralHook[] {
    return [
      {
        hook: `I tried ${topic} for 30 days and this happened...`,
        type: "shock",
        effectiveness: 92,
        reasoning: "Personal transformation stories are highly engaging",
        examples: ["I tried intermittent fasting for 30 days...", "I used AI for everything for 30 days..."],
      },
      {
        hook: `The truth about ${topic} that nobody talks about`,
        type: "shock",
        effectiveness: 88,
        reasoning: "Promises insider information and exclusivity",
        examples: ["The truth about productivity that nobody talks about"],
      },
    ];
  }

  private generateCuriosityHooks(topic: string): ViralHook[] {
    return [
      {
        hook: `You're doing ${topic} wrong (and here's why)`,
        type: "curiosity",
        effectiveness: 90,
        reasoning: "Creates immediate concern and desire to learn correct method",
        examples: ["You're investing wrong (and here's why)", "You're studying wrong..."],
      },
      {
        hook: `3 things about ${topic} I wish I knew sooner`,
        type: "curiosity",
        effectiveness: 86,
        reasoning: "Listicles + regret = powerful engagement",
        examples: ["3 things about coding I wish I knew sooner"],
      },
    ];
  }

  private generatePersonalHooks(topic: string): ViralHook[] {
    return [
      {
        hook: `My ${topic} journey: From zero to results in 90 days`,
        type: "personal",
        effectiveness: 84,
        reasoning: "Personal transformation inspires and provides social proof",
        examples: ["My fitness journey: From zero to marathon in 90 days"],
      },
    ];
  }

  private generateTrendingHooks(topic: string, platform: string): ViralHook[] {
    if (platform === "tiktok") {
      return [
        {
          hook: `POV: You finally understand ${topic}`,
          type: "trending",
          effectiveness: 89,
          reasoning: "POV format is viral on TikTok and creates immersive experience",
          examples: ["POV: You finally understand investing", "POV: You master productivity"],
        },
      ];
    }
    return [];
  }
}

/**
 * Video Script Generator
 * Creates structured, engaging video scripts
 */
export class VideoScriptGenerator {
  generateScript(
    topic: string,
    hook: string,
    duration: "short" | "medium" | "long",
    platform: string
  ): ScriptSection[] {
    const script: ScriptSection[] = [];

    // Hook (0-5 seconds)
    script.push({
      timestamp: "0:00-0:05",
      section: "hook",
      content: hook,
      purpose: "Grab attention immediately and stop the scroll",
      duration: "3-5 seconds",
    });

    // Intro (5-15 seconds)
    script.push({
      timestamp: "0:05-0:15",
      section: "intro",
      content: this.generateIntro(topic),
      purpose: "Establish credibility and preview value",
      duration: "10 seconds",
    });

    // Body sections
    if (duration === "short") {
      script.push(this.generateShortBody(topic));
    } else if (duration === "medium") {
      script.push(...this.generateMediumBody(topic));
    } else {
      script.push(...this.generateLongBody(topic));
    }

    // Climax/Peak value
    script.push({
      timestamp: this.getClimaxTimestamp(duration),
      section: "climax",
      content: `Here's the game-changer about ${topic}...`,
      purpose: "Deliver the biggest insight or transformation moment",
      duration: "15-30 seconds",
    });

    // Call to action
    script.push({
      timestamp: this.getCTATimestamp(duration),
      section: "cta",
      content: this.generateCTA(platform),
      purpose: "Drive engagement and build audience",
      duration: "5-10 seconds",
    });

    return script;
  }

  private generateIntro(topic: string): string {
    return `In this video, I'm breaking down ${topic} in a way that actually makes sense. Whether you're a complete beginner or have some experience, you'll walk away with actionable insights you can use today.`;
  }

  private generateShortBody(topic: string): ScriptSection {
    return {
      timestamp: "0:15-0:45",
      section: "body",
      content: `[Main point 1] First, understand that ${topic} is all about [key concept].\n[Main point 2] Then, apply this by [specific action].\n[Main point 3] The result? [Expected outcome].`,
      purpose: "Deliver core value quickly and clearly",
      duration: "30 seconds",
    };
  }

  private generateMediumBody(topic: string): ScriptSection[] {
    return [
      {
        timestamp: "0:15-1:00",
        section: "body",
        content: `Let's start with the basics of ${topic}...`,
        purpose: "Build foundation and context",
        duration: "45 seconds",
      },
      {
        timestamp: "1:00-2:00",
        section: "body",
        content: `Now here's where it gets interesting...`,
        purpose: "Deepen understanding with examples and nuance",
        duration: "60 seconds",
      },
    ];
  }

  private generateLongBody(topic: string): ScriptSection[] {
    return [
      {
        timestamp: "0:15-2:00",
        section: "body",
        content: `Part 1: The fundamentals of ${topic}...`,
        purpose: "Establish comprehensive foundation",
        duration: "1:45",
      },
      {
        timestamp: "2:00-4:00",
        section: "body",
        content: `Part 2: Advanced strategies and techniques...`,
        purpose: "Build expertise with detailed tactics",
        duration: "2:00",
      },
      {
        timestamp: "4:00-6:00",
        section: "body",
        content: `Part 3: Real-world applications and case studies...`,
        purpose: "Make it practical with examples",
        duration: "2:00",
      },
    ];
  }

  private getClimaxTimestamp(duration: string): string {
    if (duration === "short") return "0:45-1:00";
    if (duration === "medium") return "2:00-2:30";
    return "6:00-6:30";
  }

  private getCTATimestamp(duration: string): string {
    if (duration === "short") return "0:55-1:00";
    if (duration === "medium") return "2:30-2:45";
    return "6:30-7:00";
  }

  private generateCTA(platform: string): string {
    if (platform === "tiktok") {
      return "Follow for more tips like this! Drop a 🔥 if this helped!";
    }
    return "If you found this valuable, smash that like button and subscribe for more content like this. Drop your questions in the comments!";
  }
}

/**
 * Thumbnail Idea Generator
 * Creates viral thumbnail concepts
 */
export class ThumbnailGenerator {
  generateThumbnailIdeas(topic: string, hook: string, platform: string): ThumbnailIdea[] {
    const ideas: ThumbnailIdea[] = [];

    // High-emotion thumbnail
    ideas.push({
      concept: "Shocked/Surprised reaction",
      elements: ["Your face with wide eyes and open mouth", "Bright contrasting background", "Topic keyword highlighted"],
      colorScheme: "Bold reds, yellows, and blues",
      textOverlay: topic.toUpperCase() + "?!",
      emotionalTrigger: "Shock and curiosity",
      clickabilityScore: 92,
      reasoning: "High-emotion faces stop scrolling and drive clicks",
    });

    // Before/After split
    ideas.push({
      concept: "Before/After transformation",
      elements: ["Split screen with X on left, checkmark on right", "Visual contrast", "Arrow showing progression"],
      colorScheme: "Red (before) to green (after)",
      textOverlay: "BEFORE vs AFTER",
      emotionalTrigger: "Aspiration and proof",
      clickabilityScore: 90,
      reasoning: "Transformation stories are inherently engaging",
    });

    // Curiosity gap thumbnail
    ideas.push({
      concept: "Mystery/Reveal concept",
      elements: ["Partially hidden element", "Question mark or blur effect", "Pointing gesture"],
      colorScheme: "Dark with bright highlights",
      textOverlay: "You Won't Believe...",
      emotionalTrigger: "Intense curiosity",
      clickabilityScore: 88,
      reasoning: "Creates information gap that viewers want to close",
    });

    // Authority/Expert thumbnail
    ideas.push({
      concept: "Professional expert setup",
      elements: ["Clean professional background", "Confident pose", "Visual props/graphics related to topic"],
      colorScheme: "Professional blues and whites",
      textOverlay: `${topic}: The Truth`,
      emotionalTrigger: "Trust and credibility",
      clickabilityScore: 85,
      reasoning: "Positions you as authoritative source",
    });

    // Listicle thumbnail
    ideas.push({
      concept: "Numbered list visual",
      elements: ["Large number (3, 5, 7)", "Multiple small images", "Checklist or steps visual"],
      colorScheme: "Bright and organized",
      textOverlay: "5 Ways to [topic]",
      emotionalTrigger: "Value and comprehensiveness",
      clickabilityScore: 83,
      reasoning: "Promises specific, actionable value",
    });

    return ideas.sort((a, b) => b.clickabilityScore - a.clickabilityScore);
  }
}
