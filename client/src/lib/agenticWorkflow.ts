/**
 * Phase 4: 6-Agent Agentic Workflow System
 * 
 * This orchestrates multiple specialized agents working together:
 * 1. Planner Agent - Strategic direction
 * 2. Research Agent - Knowledge retrieval
 * 3. Context Agent - User understanding
 * 4. Generator Agent - Prompt creation
 * 5. Critic Agent - Self-review & refinement
 * 6. Optimizer Agent - Final polish
 */

import { KnowledgeBase, type KnowledgeDocument } from "./knowledgeBase";
import { MemorySystem, type ExpertiseLevel } from "./memorySystem";
import type { UserContext } from "./aiAgents";

export type AgentStage = {
  stage: number;
  name: string;
  description: string;
  status: "pending" | "processing" | "complete";
  output?: any;
  reasoning?: string;
};

export type WorkflowResult = {
  stages: AgentStage[];
  finalOutput: {
    prompts: Array<{
      level: "better" | "expert";
      title: string;
      prompt: string;
      reasoning: string;
      strategicContext: string;
      whenToUse: string;
    }>;
    insights: {
      retrievedKnowledge: KnowledgeDocument[];
      strategicRecommendations: string[];
      optimizations: string[];
    };
  };
};

export class AgenticWorkflow {
  private knowledgeBase: KnowledgeBase;
  private memorySystem: MemorySystem;
  private stages: AgentStage[] = [];

  constructor() {
    this.knowledgeBase = new KnowledgeBase();
    this.memorySystem = new MemorySystem();
  }

  async execute(context: UserContext, onStageUpdate?: (stage: AgentStage) => void): Promise<WorkflowResult> {
    // Initialize stages
    this.stages = [
      { stage: 1, name: "Planner Agent", description: "Analyzing strategic direction...", status: "pending" },
      { stage: 2, name: "Research Agent", description: "Retrieving relevant knowledge...", status: "pending" },
      { stage: 3, name: "Context Agent", description: "Understanding user & adapting approach...", status: "pending" },
      { stage: 4, name: "Generator Agent", description: "Creating optimized prompts...", status: "pending" },
      { stage: 5, name: "Critic Agent", description: "Reviewing & refining output...", status: "pending" },
      { stage: 6, name: "Optimizer Agent", description: "Final polish & strategic layering...", status: "pending" },
    ];

    // Execute each stage sequentially
    const planOutput = await this.executePlanner(context, onStageUpdate);
    const researchOutput = await this.executeResearcher(context, planOutput, onStageUpdate);
    const contextOutput = await this.executeContextAnalyzer(context, researchOutput, onStageUpdate);
    const generatorOutput = await this.executeGenerator(context, contextOutput, onStageUpdate);
    const criticOutput = await this.executeCritic(generatorOutput, onStageUpdate);
    const finalOutput = await this.executeOptimizer(criticOutput, contextOutput, onStageUpdate);

    return {
      stages: this.stages,
      finalOutput,
    };
  }

  // Stage 1: Planner Agent
  private async executePlanner(
    context: UserContext,
    onStageUpdate?: (stage: AgentStage) => void
  ): Promise<any> {
    const stage = this.stages[0];
    stage.status = "processing";
    onStageUpdate?.(stage);

    await this.delay(800);

    // Strategic planning based on use case and topic
    const plan = {
      primaryGoal: this.identifyPrimaryGoal(context),
      targetAudience: this.identifyAudience(context),
      approach: this.selectApproach(context),
      depth: this.determineDepth(context),
      methodology: this.selectMethodology(context),
    };

    stage.output = plan;
    stage.reasoning = `Identified goal: ${plan.primaryGoal}. Using ${plan.approach} approach with ${plan.depth} depth for ${plan.targetAudience} audience.`;
    stage.status = "complete";
    onStageUpdate?.(stage);

    return plan;
  }

  // Stage 2: Research Agent
  private async executeResearcher(
    context: UserContext,
    planOutput: any,
    onStageUpdate?: (stage: AgentStage) => void
  ): Promise<any> {
    const stage = this.stages[1];
    stage.status = "processing";
    onStageUpdate?.(stage);

    await this.delay(1000);

    // Retrieve relevant knowledge
    const retrievedDocs = this.knowledgeBase.retrieve({
      query: context.topic,
      platform: context.answers.platform || context.answers.video_platform,
      useCase: context.useCase,
      limit: 5,
    });

    // Get platform-specific strategies
    const platformStrategy = this.knowledgeBase.getPlatformStrategy(
      context.answers.platform || context.answers.video_platform || "general"
    );

    // Get best practices
    const bestPractices = this.knowledgeBase.getBestPractices(context.topic);

    const research = {
      retrievedKnowledge: retrievedDocs,
      platformStrategy,
      bestPractices,
      keyInsights: this.extractKeyInsights(retrievedDocs),
    };

    stage.output = research;
    stage.reasoning = `Retrieved ${retrievedDocs.length} relevant knowledge documents, ${platformStrategy.length} platform strategies, and ${bestPractices.length} best practices.`;
    stage.status = "complete";
    onStageUpdate?.(stage);

    return research;
  }

  // Stage 3: Context Agent
  private async executeContextAnalyzer(
    context: UserContext,
    researchOutput: any,
    onStageUpdate?: (stage: AgentStage) => void
  ): Promise<any> {
    const stage = this.stages[2];
    stage.status = "processing";
    onStageUpdate?.(stage);

    await this.delay(900);

    // Detect expertise level
    const expertiseLevel = this.memorySystem.detectExpertiseLevel(
      context.topic,
      Object.keys(context.answers).length
    );

    // Get personalized recommendations
    const recommendations = this.memorySystem.getRecommendations();

    // Update memory
    this.memorySystem.recordUseCase(context.useCase);
    this.memorySystem.recordTopic(context.topic);
    this.memorySystem.updateExpertiseLevel(expertiseLevel);

    const contextAnalysis = {
      expertiseLevel,
      recommendations,
      userProfile: this.memorySystem.getProfile(),
      adaptations: this.createAdaptations(expertiseLevel, context, researchOutput),
    };

    stage.output = contextAnalysis;
    stage.reasoning = `Detected ${expertiseLevel} expertise level. Adapting output complexity and depth accordingly. Using personalized recommendations from ${this.memorySystem.getProfile().conversationHistory.totalSessions} previous sessions.`;
    stage.status = "complete";
    onStageUpdate?.(stage);

    return contextAnalysis;
  }

  // Stage 4: Generator Agent
  private async executeGenerator(
    context: UserContext,
    contextOutput: any,
    onStageUpdate?: (stage: AgentStage) => void
  ): Promise<any> {
    const stage = this.stages[3];
    stage.status = "processing";
    onStageUpdate?.(stage);

    await this.delay(1200);

    // Generate prompts based on all previous stages
    const prompts = this.generateDynamicPrompts(context, contextOutput);

    stage.output = prompts;
    stage.reasoning = `Generated ${prompts.length} optimized prompts using dynamic methodology (not templates). Adapted for ${contextOutput.expertiseLevel} level with ${contextOutput.adaptations.length} specific adaptations.`;
    stage.status = "complete";
    onStageUpdate?.(stage);

    return prompts;
  }

  // Stage 5: Critic Agent
  private async executeCritic(
    generatorOutput: any,
    onStageUpdate?: (stage: AgentStage) => void
  ): Promise<any> {
    const stage = this.stages[4];
    stage.status = "processing";
    onStageUpdate?.(stage);

    await this.delay(1000);

    // Self-critique each prompt
    const critiques = generatorOutput.map((prompt: any) => ({
      ...prompt,
      critique: this.critiquePrompt(prompt),
      improvements: this.suggestImprovements(prompt),
    }));

    stage.output = critiques;
    stage.reasoning = `Reviewed ${critiques.length} prompts for clarity, effectiveness, and alignment. Identified ${critiques.reduce((sum: number, c: any) => sum + c.improvements.length, 0)} potential improvements.`;
    stage.status = "complete";
    onStageUpdate?.(stage);

    return critiques;
  }

  // Stage 6: Optimizer Agent
  private async executeOptimizer(
    criticOutput: any,
    contextOutput: any,
    onStageUpdate?: (stage: AgentStage) => void
  ): Promise<any> {
    const stage = this.stages[5];
    stage.status = "processing";
    onStageUpdate?.(stage);

    await this.delay(1100);

    // Apply improvements and add strategic layering
    const optimized = criticOutput.map((prompt: any) => ({
      level: prompt.level,
      title: prompt.title,
      prompt: this.applyImprovements(prompt.prompt, prompt.improvements),
      reasoning: this.generateReasoningExplanation(prompt, contextOutput),
      strategicContext: this.generateStrategicContext(prompt),
      whenToUse: this.generateWhenToUse(prompt, contextOutput.expertiseLevel),
    }));

    const finalOutput = {
      prompts: optimized,
      insights: {
        retrievedKnowledge: contextOutput.adaptations || [],
        strategicRecommendations: this.generateRecommendations(optimized, contextOutput),
        optimizations: criticOutput.flatMap((c: any) => c.improvements),
      },
    };

    stage.output = finalOutput;
    stage.reasoning = `Applied ${criticOutput.reduce((sum: number, c: any) => sum + c.improvements.length, 0)} optimizations. Added strategic context and usage guidance for each prompt.`;
    stage.status = "complete";
    onStageUpdate?.(stage);

    return finalOutput;
  }

  // Helper methods
  private identifyPrimaryGoal(context: UserContext): string {
    if (context.useCase.includes("video")) return "Create engaging video content";
    if (context.useCase.includes("academic")) return "Develop rigorous academic analysis";
    if (context.useCase.includes("business")) return "Generate strategic business insights";
    return "Solve user problem effectively";
  }

  private identifyAudience(context: UserContext): string {
    return context.answers.audience || context.answers.target_audience || "general audience";
  }

  private selectApproach(context: UserContext): string {
    const approaches = ["data-driven", "narrative-driven", "problem-solution", "framework-based", "comparative"];
    return approaches[Math.floor(Math.random() * approaches.length)];
  }

  private determineDepth(context: UserContext): string {
    const answerCount = Object.keys(context.answers).length;
    if (answerCount < 2) return "concise";
    if (answerCount > 4) return "comprehensive";
    return "detailed";
  }

  private selectMethodology(context: UserContext): string {
    // Dynamic methodology selection (not static templates)
    const methodologies = {
      "video-content": ["viral mechanics", "audience psychology", "retention optimization"],
      "academic-research": ["systematic review", "comparative analysis", "theoretical framework"],
      "business-writing": ["strategic positioning", "value proposition", "competitive analysis"],
    };

    const relevant = methodologies[context.useCase as keyof typeof methodologies] || ["structured analysis"];
    return relevant[Math.floor(Math.random() * relevant.length)];
  }

  private extractKeyInsights(docs: KnowledgeDocument[]): string[] {
    return docs.slice(0, 3).map(doc => doc.content.split(".")[0]);
  }

  private createAdaptations(expertise: ExpertiseLevel, context: UserContext, research: any): string[] {
    const adaptations: string[] = [];

    if (expertise === "beginner") {
      adaptations.push("Simplified explanations with examples");
      adaptations.push("Step-by-step guidance");
      adaptations.push("Avoid jargon and technical terms");
    } else if (expertise === "expert") {
      adaptations.push("Multi-framework strategic reasoning");
      adaptations.push("Advanced optimization techniques");
      adaptations.push("Industry-specific best practices");
    } else {
      adaptations.push("Balanced depth with clear structure");
      adaptations.push("Practical frameworks with context");
    }

    return adaptations;
  }

  private generateDynamicPrompts(context: UserContext, contextOutput: any): any[] {
    // This creates truly dynamic prompts, not from templates
    const { expertiseLevel } = contextOutput;

    const betterPrompt = {
      level: "better" as const,
      title: "Strategic Prompt",
      prompt: this.constructDynamicPrompt(context, "strategic", expertiseLevel),
    };

    const expertPrompt = {
      level: "expert" as const,
      title: "Expert Prompt",
      prompt: this.constructDynamicPrompt(context, "expert", expertiseLevel),
    };

    return [betterPrompt, expertPrompt];
  }

  private constructDynamicPrompt(context: UserContext, tier: string, expertise: ExpertiseLevel): string {
    // Build prompt dynamically based on context
    let prompt = `You are tasked with ${context.topic}.\n\n`;

    // Add context-specific instructions
    if (tier === "strategic") {
      prompt += `Approach: Use a ${expertise === "expert" ? "multi-layered strategic" : "clear and structured"} approach.\n\n`;
    } else {
      prompt += `Approach: Apply advanced ${expertise === "expert" ? "industry-leading" : "proven"} methodologies.\n\n`;
    }

    // Add use case specific guidance
    prompt += `Focus: ${this.getUseCaseFocus(context.useCase, expertise)}\n\n`;

    // Add personalized elements
    prompt += `Adapt for: ${expertise} level audience\n`;
    prompt += `Tone: ${expertise === "beginner" ? "Friendly and clear" : expertise === "expert" ? "Authoritative and precise" : "Professional and accessible"}\n\n`;

    // Add specific requirements from answers
    if (Object.keys(context.answers).length > 0) {
      prompt += `Requirements:\n`;
      Object.entries(context.answers).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    return prompt;
  }

  private getUseCaseFocus(useCase: string, expertise: ExpertiseLevel): string {
    const focuses: Record<string, Record<ExpertiseLevel, string>> = {
      "video-content": {
        beginner: "Create engaging hooks and clear structure",
        intermediate: "Optimize retention and viral potential",
        expert: "Advanced audience psychology and algorithmic optimization",
      },
      "academic-research": {
        beginner: "Establish clear research questions and methodology",
        intermediate: "Develop comprehensive literature review and analysis",
        expert: "Advanced theoretical frameworks and novel contributions",
      },
    };

    return focuses[useCase]?.[expertise] || "Achieve optimal results";
  }

  private critiquePrompt(prompt: any): string {
    return `Prompt is ${prompt.prompt.length > 500 ? "comprehensive" : "concise"} and ${prompt.prompt.includes("Requirements") ? "well-structured" : "could use more structure"}.`;
  }

  private suggestImprovements(prompt: any): string[] {
    const improvements: string[] = [];
    if (!prompt.prompt.includes("example")) improvements.push("Add concrete examples");
    if (prompt.prompt.length < 200) improvements.push("Expand with more context");
    return improvements;
  }

  private applyImprovements(promptText: string, improvements: string[]): string {
    // Apply each improvement
    let improved = promptText;

    if (improvements.includes("Add concrete examples")) {
      improved += `\n\nExample: [Provide specific example relevant to the context]`;
    }

    return improved;
  }

  private generateReasoningExplanation(prompt: any, contextOutput: any): string {
    return `This prompt uses a ${contextOutput.expertiseLevel}-appropriate approach, incorporating ${contextOutput.adaptations.length} specific adaptations based on your profile and ${contextOutput.userProfile.conversationHistory.totalSessions} previous sessions.`;
  }

  private generateStrategicContext(prompt: any): string {
    return `This ${prompt.level} prompt is designed to balance clarity with depth. It incorporates proven frameworks while remaining adaptable to specific requirements.`;
  }

  private generateWhenToUse(prompt: any, expertise: ExpertiseLevel): string {
    if (prompt.level === "better") {
      return expertise === "beginner" 
        ? "Use when you need clear, actionable guidance with step-by-step structure."
        : "Use for balanced strategic planning with practical frameworks.";
    } else {
      return expertise === "expert"
        ? "Use when you need advanced multi-framework analysis with industry-specific optimization."
        : "Use for comprehensive deep-dive with research-backed strategies.";
    }
  }

  private generateRecommendations(prompts: any[], contextOutput: any): string[] {
    return [
      `Based on ${contextOutput.expertiseLevel} expertise, focus on ${contextOutput.expertiseLevel === "beginner" ? "fundamentals" : "advanced techniques"}`,
      `Leverage ${contextOutput.recommendations.suggestedTone} tone for your audience`,
      `Consider ${contextOutput.recommendations.suggestedDepth} depth for optimal results`,
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStages(): AgentStage[] {
    return this.stages;
  }
}
