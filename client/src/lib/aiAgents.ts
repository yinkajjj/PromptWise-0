// Multi-Agent AI System for PromptWise
// Agents: Question Generator, Context Analyzer, Prompt Architect, Quality Checker

export type AgentMessage = {
  agent: "question" | "analyzer" | "architect" | "checker";
  content: string;
  reasoning: string;
  confidence: number;
};

export type Question = {
  id: string;
  text: string;
  type: "choice" | "text" | "scale";
  options?: string[];
  importance: "critical" | "high" | "medium";
  reasoning: string;
};

export type UserContext = {
  topic: string;
  useCase: string;
  answers: Record<string, any>;
  detectedIntent?: string;
  ambiguities?: string[];
  missingInfo?: string[];
};

/**
 * AGENT 1: Question Generator
 * Analyzes user input and generates intelligent clarifying questions
 */
export class QuestionGeneratorAgent {
  analyze(context: UserContext): Question[] {
    const questions: Question[] = [];
    const { topic, useCase, answers } = context;

    // Detect ambiguities and missing information
    const ambiguities = this.detectAmbiguities(topic, useCase);
    const missingCriticalInfo = this.detectMissingInfo(topic, useCase, answers);

    // Generate questions based on use case
    if (useCase === "video-content") {
      questions.push(...this.generateVideoQuestions(topic, answers));
    } else if (useCase === "academic-research") {
      questions.push(...this.generateAcademicQuestions(topic, answers));
    } else if (useCase === "resume-cv") {
      questions.push(...this.generateResumeQuestions(topic, answers));
    } else if (useCase === "business-writing") {
      questions.push(...this.generateBusinessQuestions(topic, answers));
    } else if (useCase === "creative-writing") {
      questions.push(...this.generateCreativeQuestions(topic, answers));
    } else if (useCase === "marketing-content") {
      questions.push(...this.generateMarketingQuestions(topic, answers));
    }

    // Add ambiguity clarification questions
    for (const ambiguity of ambiguities) {
      questions.push({
        id: `ambiguity_${Date.now()}_${Math.random()}`,
        text: ambiguity,
        type: "text",
        importance: "high",
        reasoning: "Clarifying ambiguous input to generate more precise prompts",
      });
    }

    // Prioritize by importance
    return questions.sort((a, b) => {
      const importanceOrder = { critical: 0, high: 1, medium: 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    }).slice(0, 3); // Max 3 questions to avoid overwhelming user
  }

  private detectAmbiguities(topic: string, useCase: string): string[] {
    const ambiguities: string[] = [];
    const topicLower = topic.toLowerCase();

    // Vague topics
    if (topicLower.length < 10) {
      ambiguities.push("Your topic is quite brief. Could you provide more context or specific details?");
    }

    // Missing target audience
    if (!topicLower.includes("for") && !topicLower.includes("audience")) {
      // Skip this for some use cases
      if (!["resume-cv"].includes(useCase)) {
        // ambiguities.push("Who is your target audience?");
      }
    }

    return ambiguities;
  }

  private detectMissingInfo(topic: string, useCase: string, answers: Record<string, any>): string[] {
    const missing: string[] = [];
    // This can be expanded based on what answers we already have
    return missing;
  }

  private generateVideoQuestions(topic: string, answers: Record<string, any>): Question[] {
    const questions: Question[] = [];

    if (!answers.platform) {
      questions.push({
        id: "video_platform",
        text: "Which platform is this video for?",
        type: "choice",
        options: ["YouTube (long-form)", "TikTok", "Instagram Reels", "YouTube Shorts", "Multiple platforms"],
        importance: "critical",
        reasoning: "Different platforms require different content strategies and formats",
      });
    }

    if (!answers.video_style) {
      questions.push({
        id: "video_style",
        text: "What style of video do you want to create?",
        type: "choice",
        options: ["Educational/Tutorial", "Entertainment", "Documentary", "Vlog", "Review", "Commentary"],
        importance: "high",
        reasoning: "Video style determines tone, pacing, and content structure",
      });
    }

    if (!answers.audience_age) {
      questions.push({
        id: "video_audience",
        text: "What's your target audience age range?",
        type: "choice",
        options: ["13-17 (Gen Z teens)", "18-24 (Young adults)", "25-34 (Millennials)", "35-44", "45+", "All ages"],
        importance: "high",
        reasoning: "Audience age influences language, references, and content approach",
      });
    }

    if (!answers.video_length) {
      questions.push({
        id: "video_length",
        text: "Approximate video length?",
        type: "choice",
        options: ["Under 60 seconds (Short)", "1-3 minutes", "3-10 minutes", "10-20 minutes", "20+ minutes (Long-form)"],
        importance: "medium",
        reasoning: "Length affects content density and narrative structure",
      });
    }

    return questions;
  }

  private generateAcademicQuestions(topic: string, answers: Record<string, any>): Question[] {
    const questions: Question[] = [];

    if (!answers.academic_level) {
      questions.push({
        id: "academic_level",
        text: "What academic level is this for?",
        type: "choice",
        options: ["Bachelor's Project", "Master's Thesis", "PhD Dissertation", "Research Paper", "Literature Review"],
        importance: "critical",
        reasoning: "Academic level determines depth, scope, and methodological rigor",
      });
    }

    if (!answers.research_approach) {
      questions.push({
        id: "research_approach",
        text: "What research approach are you considering?",
        type: "choice",
        options: ["Qualitative", "Quantitative", "Mixed Methods", "Theoretical/Conceptual", "Not sure yet"],
        importance: "high",
        reasoning: "Research methodology shapes the entire study design",
      });
    }

    if (!answers.discipline) {
      questions.push({
        id: "academic_discipline",
        text: "What is your academic discipline/field?",
        type: "text",
        importance: "high",
        reasoning: "Discipline-specific conventions affect structure and expectations",
      });
    }

    return questions;
  }

  private generateResumeQuestions(topic: string, answers: Record<string, any>): Question[] {
    const questions: Question[] = [];

    if (!answers.career_level) {
      questions.push({
        id: "career_level",
        text: "What is your career level?",
        type: "choice",
        options: ["Entry-level/Student", "Mid-level (3-7 years)", "Senior (7-15 years)", "Executive/Leadership", "Career change"],
        importance: "critical",
        reasoning: "Career level determines resume structure and emphasis",
      });
    }

    if (!answers.job_target) {
      questions.push({
        id: "job_target",
        text: "What type of role are you targeting?",
        type: "text",
        importance: "critical",
        reasoning: "Target role determines which skills and experiences to highlight",
      });
    }

    if (!answers.resume_strength) {
      questions.push({
        id: "resume_strength",
        text: "What's your biggest career strength?",
        type: "choice",
        options: ["Technical skills", "Leadership", "Problem-solving", "Creativity", "Communication", "Results/Metrics"],
        importance: "high",
        reasoning: "Highlighting strengths makes your resume more compelling",
      });
    }

    return questions;
  }

  private generateBusinessQuestions(topic: string, answers: Record<string, any>): Question[] {
    const questions: Question[] = [];

    if (!answers.doc_type) {
      questions.push({
        id: "business_doc_type",
        text: "What type of business document?",
        type: "choice",
        options: ["Proposal", "Report", "Business Plan", "Case Study", "White Paper", "Memo/Brief"],
        importance: "critical",
        reasoning: "Document type dictates format, tone, and structure",
      });
    }

    if (!answers.audience) {
      questions.push({
        id: "business_audience",
        text: "Who is the primary audience?",
        type: "choice",
        options: ["Executives/C-suite", "Investors", "Clients", "Team/Internal", "External stakeholders"],
        importance: "high",
        reasoning: "Audience determines level of detail and communication style",
      });
    }

    if (!answers.goal) {
      questions.push({
        id: "business_goal",
        text: "What's the main goal of this document?",
        type: "choice",
        options: ["Persuade/Convince", "Inform/Educate", "Request approval", "Document findings", "Present strategy"],
        importance: "high",
        reasoning: "Goal shapes the narrative and call-to-action",
      });
    }

    return questions;
  }

  private generateCreativeQuestions(topic: string, answers: Record<string, any>): Question[] {
    const questions: Question[] = [];

    if (!answers.genre) {
      questions.push({
        id: "creative_genre",
        text: "What genre are you writing?",
        type: "choice",
        options: ["Fiction (Novel/Short story)", "Poetry", "Screenplay", "Non-fiction narrative", "Personal essay"],
        importance: "critical",
        reasoning: "Genre determines structure, pacing, and stylistic conventions",
      });
    }

    if (!answers.tone) {
      questions.push({
        id: "creative_tone",
        text: "What tone are you aiming for?",
        type: "choice",
        options: ["Dark/Serious", "Light/Humorous", "Mysterious", "Emotional/Heart-warming", "Suspenseful"],
        importance: "high",
        reasoning: "Tone sets the emotional atmosphere of your writing",
      });
    }

    return questions;
  }

  private generateMarketingQuestions(topic: string, answers: Record<string, any>): Question[] {
    const questions: Question[] = [];

    if (!answers.channel) {
      questions.push({
        id: "marketing_channel",
        text: "What marketing channel?",
        type: "choice",
        options: ["Social media", "Email", "Website/Blog", "Ads (PPC/Display)", "Print/Traditional", "Multi-channel"],
        importance: "critical",
        reasoning: "Channel dictates format, length, and messaging style",
      });
    }

    if (!answers.campaign_goal) {
      questions.push({
        id: "marketing_goal",
        text: "Primary campaign goal?",
        type: "choice",
        options: ["Brand awareness", "Lead generation", "Conversion/Sales", "Engagement", "Retention/Loyalty"],
        importance: "high",
        reasoning: "Goal determines key messaging and CTAs",
      });
    }

    return questions;
  }
}

/**
 * AGENT 2: Context Analyzer
 * Deep analysis of user intent and context enrichment
 */
export class ContextAnalyzerAgent {
  analyze(context: UserContext): {
    intent: string;
    confidence: number;
    enrichedContext: Record<string, any>;
    recommendations: string[];
  } {
    const { topic, useCase, answers } = context;

    // Analyze intent
    const intent = this.detectIntent(topic, useCase);
    const confidence = this.calculateConfidence(topic, answers);

    // Enrich context with inferred information
    const enrichedContext = this.enrichContext(topic, useCase, answers);

    // Generate strategic recommendations
    const recommendations = this.generateRecommendations(intent, enrichedContext, confidence);

    return {
      intent,
      confidence,
      enrichedContext,
      recommendations,
    };
  }

  private detectIntent(topic: string, useCase: string): string {
    const topicLower = topic.toLowerCase();

    // Intent patterns
    if (topicLower.includes("how to") || topicLower.includes("tutorial")) {
      return "educational";
    }
    if (topicLower.includes("review") || topicLower.includes("compare")) {
      return "evaluative";
    }
    if (topicLower.includes("story") || topicLower.includes("narrative")) {
      return "storytelling";
    }
    if (topicLower.includes("strategy") || topicLower.includes("plan")) {
      return "strategic";
    }
    if (topicLower.includes("analysis") || topicLower.includes("research")) {
      return "analytical";
    }

    return "general";
  }

  private calculateConfidence(topic: string, answers: Record<string, any>): number {
    let confidence = 0.5; // Base confidence

    // More details = higher confidence
    if (topic.length > 50) confidence += 0.2;
    if (Object.keys(answers).length > 2) confidence += 0.2;
    if (Object.keys(answers).length > 4) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private enrichContext(topic: string, useCase: string, answers: Record<string, any>): Record<string, any> {
    return {
      topicComplexity: this.assessComplexity(topic),
      suggestedTone: this.suggestTone(topic, answers),
      estimatedScope: this.estimateScope(topic, useCase),
      keyTerms: this.extractKeyTerms(topic),
    };
  }

  private assessComplexity(topic: string): "simple" | "moderate" | "complex" {
    if (topic.length < 30) return "simple";
    if (topic.length < 80) return "moderate";
    return "complex";
  }

  private suggestTone(topic: string, answers: Record<string, any>): string {
    if (answers.tone) return answers.tone;

    const topicLower = topic.toLowerCase();
    if (topicLower.includes("fun") || topicLower.includes("entertaining")) return "casual";
    if (topicLower.includes("professional") || topicLower.includes("business")) return "formal";
    if (topicLower.includes("inspiring") || topicLower.includes("motivat")) return "inspiring";

    return "professional";
  }

  private estimateScope(topic: string, useCase: string): "narrow" | "medium" | "broad" {
    const topicLower = topic.toLowerCase();

    if (topicLower.includes("specific") || topicLower.includes("particular")) return "narrow";
    if (topicLower.includes("overview") || topicLower.includes("general")) return "broad";

    return "medium";
  }

  private extractKeyTerms(topic: string): string[] {
    // Simple keyword extraction (can be enhanced with NLP)
    const words = topic.toLowerCase().split(/\s+/);
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"]);

    return words
      .filter(w => w.length > 3 && !stopWords.has(w))
      .slice(0, 5);
  }

  private generateRecommendations(intent: string, context: Record<string, any>, confidence: number): string[] {
    const recommendations: string[] = [];

    if (confidence < 0.7) {
      recommendations.push("Consider providing more details for better results");
    }

    if (context.topicComplexity === "complex") {
      recommendations.push("Breaking down into smaller sections may help");
    }

    if (intent === "educational") {
      recommendations.push("Include step-by-step structure for clarity");
    }

    return recommendations;
  }
}

/**
 * AGENT 3: Reasoning Pipeline
 * Multi-step reasoning to generate optimal prompts
 */
export class ReasoningPipeline {
  async reason(context: UserContext, analysis: any): Promise<{
    steps: string[];
    strategy: string;
    adaptations: string[];
  }> {
    const steps: string[] = [];
    const adaptations: string[] = [];

    // Step 1: Understand the request
    steps.push(`Understanding request: ${context.topic} (${context.useCase})`);

    // Step 2: Analyze context
    steps.push(`Analyzing context: Intent=${analysis.intent}, Confidence=${(analysis.confidence * 100).toFixed(0)}%`);

    // Step 3: Determine strategy
    const strategy = this.determineStrategy(context, analysis);
    steps.push(`Strategy: ${strategy}`);

    // Step 4: Apply adaptations based on answers
    if (Object.keys(context.answers).length > 0) {
      adaptations.push(...this.applyAdaptations(context.answers));
      steps.push(`Applied ${adaptations.length} contextual adaptations`);
    }

    // Step 5: Quality considerations
    steps.push("Optimizing for clarity, specificity, and actionability");

    return { steps, strategy, adaptations };
  }

  private determineStrategy(context: UserContext, analysis: any): string {
    const { useCase } = context;
    const { intent, enrichedContext } = analysis;

    if (useCase === "academic-research") {
      return "Multi-angle academic approach with methodological rigor";
    } else if (useCase === "video-content") {
      return "Engagement-focused narrative with platform optimization";
    } else if (useCase === "business-writing") {
      return "Results-oriented professional communication";
    } else if (intent === "educational") {
      return "Step-by-step instructional framework";
    } else if (enrichedContext.topicComplexity === "complex") {
      return "Layered approach with progressive detail";
    }

    return "Balanced comprehensive approach";
  }

  private applyAdaptations(answers: Record<string, any>): string[] {
    const adaptations: string[] = [];

    if (answers.platform) {
      adaptations.push(`Optimized for ${answers.platform}`);
    }
    if (answers.audience || answers.audience_age || answers.video_audience) {
      const aud = answers.audience || answers.audience_age || answers.video_audience;
      adaptations.push(`Tailored for ${aud} audience`);
    }
    if (answers.academic_level) {
      adaptations.push(`${answers.academic_level} level requirements`);
    }
    if (answers.career_level) {
      adaptations.push(`${answers.career_level} positioning`);
    }

    return adaptations;
  }
}
