/**
 * Phase 4: Enhanced Memory & Personalization System
 * 
 * This system learns from user behavior and creates personalized experiences
 * across sessions. It tracks preferences, expertise levels, and patterns.
 */

export type ExpertiseLevel = "beginner" | "intermediate" | "expert";

export type UserProfile = {
  id: string;
  expertiseLevel: ExpertiseLevel;
  preferences: {
    primaryDomain?: string; // "content-creation", "academic", "business", etc.
    platforms?: string[]; // ["youtube", "tiktok", "instagram"]
    tonePreference?: string; // "casual", "professional", "authoritative"
    contentFocus?: string[]; // ["ai-tools", "productivity", "education"]
    outputLength?: "concise" | "detailed" | "comprehensive";
  };
  learningPatterns: {
    commonUseCases: Map<string, number>; // use case → frequency
    successfulApproaches: string[]; // approaches that worked well
    feedbackHistory: Array<{
      promptId: string;
      rating?: number;
      action: "copied" | "regenerated" | "ignored";
      timestamp: Date;
    }>;
  };
  conversationHistory: {
    totalSessions: number;
    lastSessionDate: Date;
    topicsDiscussed: string[];
    questionsAsked: string[];
  };
};

export class MemorySystem {
  private profile: UserProfile;
  private storageKey = "promptwise_user_profile";

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): UserProfile {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Reconstruct Map from stored object
        parsed.learningPatterns.commonUseCases = new Map(
          Object.entries(parsed.learningPatterns.commonUseCases || {})
        );
        return parsed;
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    }

    return this.createDefaultProfile();
  }

  private createDefaultProfile(): UserProfile {
    return {
      id: `user_${Date.now()}`,
      expertiseLevel: "intermediate",
      preferences: {},
      learningPatterns: {
        commonUseCases: new Map(),
        successfulApproaches: [],
        feedbackHistory: [],
      },
      conversationHistory: {
        totalSessions: 0,
        lastSessionDate: new Date(),
        topicsDiscussed: [],
        questionsAsked: [],
      },
    };
  }

  saveProfile(): void {
    const toSave = {
      ...this.profile,
      learningPatterns: {
        ...this.profile.learningPatterns,
        commonUseCases: Object.fromEntries(this.profile.learningPatterns.commonUseCases),
      },
    };
    localStorage.setItem(this.storageKey, JSON.stringify(toSave));
  }

  // Track use case frequency
  recordUseCase(useCase: string): void {
    const count = this.profile.learningPatterns.commonUseCases.get(useCase) || 0;
    this.profile.learningPatterns.commonUseCases.set(useCase, count + 1);
    this.saveProfile();
  }

  // Detect expertise level from conversation patterns
  detectExpertiseLevel(topic: string, conversationDepth: number): ExpertiseLevel {
    const useCaseCount = this.profile.learningPatterns.commonUseCases.size;
    const sessionCount = this.profile.conversationHistory.totalSessions;

    // Beginner indicators
    if (
      sessionCount < 3 ||
      conversationDepth < 2 ||
      topic.includes("how to") ||
      topic.includes("what is")
    ) {
      return "beginner";
    }

    // Expert indicators
    if (
      sessionCount > 10 ||
      useCaseCount > 5 ||
      conversationDepth > 4 ||
      topic.match(/advanced|optimize|scale|strategic|framework/i)
    ) {
      return "expert";
    }

    return "intermediate";
  }

  // Update expertise level dynamically
  updateExpertiseLevel(level: ExpertiseLevel): void {
    this.profile.expertiseLevel = level;
    this.saveProfile();
  }

  // Record topic discussion
  recordTopic(topic: string): void {
    if (!this.profile.conversationHistory.topicsDiscussed.includes(topic)) {
      this.profile.conversationHistory.topicsDiscussed.push(topic);
      if (this.profile.conversationHistory.topicsDiscussed.length > 50) {
        this.profile.conversationHistory.topicsDiscussed.shift();
      }
      this.saveProfile();
    }
  }

  // Record successful approach
  recordSuccess(approach: string): void {
    if (!this.profile.learningPatterns.successfulApproaches.includes(approach)) {
      this.profile.learningPatterns.successfulApproaches.push(approach);
      this.saveProfile();
    }
  }

  // Record user feedback
  recordFeedback(promptId: string, action: "copied" | "regenerated" | "ignored"): void {
    this.profile.learningPatterns.feedbackHistory.push({
      promptId,
      action,
      timestamp: new Date(),
    });

    // Keep only last 100 feedback items
    if (this.profile.learningPatterns.feedbackHistory.length > 100) {
      this.profile.learningPatterns.feedbackHistory.shift();
    }

    this.saveProfile();
  }

  // Get personalized recommendations
  getRecommendations(): {
    suggestedUseCases: string[];
    suggestedTone: string;
    suggestedDepth: "concise" | "detailed" | "comprehensive";
  } {
    // Find most common use cases
    const sortedUseCases = Array.from(this.profile.learningPatterns.commonUseCases.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([useCase]) => useCase);

    // Determine tone from expertise
    const suggestedTone =
      this.profile.expertiseLevel === "beginner"
        ? "friendly"
        : this.profile.expertiseLevel === "expert"
        ? "authoritative"
        : "professional";

    // Determine depth from expertise
    const suggestedDepth =
      this.profile.expertiseLevel === "beginner"
        ? "concise"
        : this.profile.expertiseLevel === "expert"
        ? "comprehensive"
        : "detailed";

    return {
      suggestedUseCases: sortedUseCases,
      suggestedTone,
      suggestedDepth,
    };
  }

  // Increment session count
  startNewSession(): void {
    this.profile.conversationHistory.totalSessions++;
    this.profile.conversationHistory.lastSessionDate = new Date();
    this.saveProfile();
  }

  // Get profile
  getProfile(): UserProfile {
    return this.profile;
  }

  // Update preferences
  updatePreferences(updates: Partial<UserProfile["preferences"]>): void {
    this.profile.preferences = {
      ...this.profile.preferences,
      ...updates,
    };
    this.saveProfile();
  }

  // Detect primary domain from usage
  detectPrimaryDomain(): string {
    const useCases = Array.from(this.profile.learningPatterns.commonUseCases.keys());

    if (useCases.some(uc => uc.includes("video") || uc.includes("content"))) {
      return "content-creation";
    }
    if (useCases.some(uc => uc.includes("academic") || uc.includes("research"))) {
      return "academic";
    }
    if (useCases.some(uc => uc.includes("business") || uc.includes("marketing"))) {
      return "business";
    }

    return "general";
  }
}
