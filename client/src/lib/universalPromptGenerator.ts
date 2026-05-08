// Universal Prompt Generator - Works for ANY use case

export interface PromptStrategy {
  useCase: string;
  basic: (topic: string, category: string) => string;
  better: (topic: string, category: string, tone: string) => string[];
  expert: (topic: string, category: string, tone: string) => string;
}

export const universalStrategies: Record<string, PromptStrategy> = {
  "video-content": {
    useCase: "Video Content",
    basic: (topic, category) => 
      `Create a short-form ${category.toLowerCase()} video about "${topic}". Make it engaging and platform-optimized.`,

    better: (topic, category, tone) => [
      // Storytelling approach
      `Create a ${category.toLowerCase()} video about "${topic}".

**Storytelling Approach:**
• Start with a personal story or relatable scenario
• Use the "But then I discovered..." structure
• Show transformation or surprising revelation
• Tone: ${tone}

Make it feel authentic and conversational.`,

      // Quick tips format
      `Create a ${category.toLowerCase()} video about "${topic}".

**Quick Tips Format:**
• "X Things About ${topic} Nobody Tells You"
• Fast-paced, engaging delivery
• Visual examples for each point
• Tone: ${tone}

Use pattern interrupts to maintain attention.`
    ],

    expert: (topic, category, tone) => 
      `Role: You are an expert video content strategist.

Task: Create a complete video content strategy for "${topic}" in the ${category} category.

Generate 3 DIFFERENT CONCEPTS:
1. Emotional storytelling approach
2. Entertainment-first education
3. Expert/insider reveal

For your chosen concept, provide:
- Second-by-second breakdown
- Hook variations (5 options)
- Editing strategy
- Platform optimization
- Publishing strategy

Tone: ${tone}`
  },

  "resume-cv": {
    useCase: "Resume & CV",
    basic: (topic, category) => 
      `Create a ${category} resume for a ${topic} position. Include key sections and highlight relevant skills.`,

    better: (topic, category, tone) => [
      // Achievement-focused
      `Create a ${category} resume for "${topic}".

**Achievement-Focused Approach:**
• Lead with quantifiable achievements
• Use action verbs and metrics
• Highlight impact over responsibilities
• Format: Modern, ATS-friendly
• Tone: ${tone}

Focus on results that demonstrate value.`,

      // Skills-based
      `Create a ${category} resume for "${topic}".

**Skills-Based Approach:**
• Organize by skill categories
• Provide concrete examples for each skill
• Match industry keywords
• Include certifications/training
• Tone: ${tone}

Perfect for career changers or diverse backgrounds.`
    ],

    expert: (topic, category, tone) => 
      `Role: You are a professional resume writer with 10+ years experience and ATS optimization expertise.

Task: Create a comprehensive ${category} resume strategy for "${topic}".

Provide 3 TAILORED APPROACHES:
1. Traditional corporate format (for conservative industries)
2. Modern showcase format (for creative/tech roles)
3. Hybrid ATS-optimized format (maximum compatibility)

For each approach include:
- Complete section structure
- Achievement formula (Context + Action + Result)
- Keyword optimization strategy
- ATS compatibility checklist
- Visual formatting guidelines
- Cover letter alignment

Tone: ${tone}
Target: Roles requiring ${topic} expertise`
  },

  "academic-research": {
    useCase: "Academic Research",
    basic: (topic, category) => 
      `Create a ${category} research proposal about "${topic}". Include research questions, methodology, and expected outcomes.`,

    better: (topic, category, tone) => [
      // Problem-solution framework
      `Create a ${category} research proposal for "${topic}".

**Problem-Solution Framework:**
• Clearly define the research gap
• State specific research questions
• Propose innovative methodology
• Outline expected contributions
• Academic level: ${category}
• Writing style: ${tone}

Focus on originality and feasibility.`,

      // Literature-driven approach
      `Create a ${category} research proposal for "${topic}".

**Literature-Driven Approach:**
• Comprehensive literature review structure
• Identify theoretical frameworks
• Position within existing scholarship
• Clear research hypotheses
• Level: ${category}
• Style: ${tone}

Build on established research while adding novelty.`
    ],

    expert: (topic, category, tone) => 
      `Role: You are a tenured professor and experienced research supervisor specializing in ${category}-level work.

Task: Create a comprehensive research proposal for "${topic}" at the ${category} level.

Generate MULTIPLE RESEARCH ANGLES:
1. Theoretical/conceptual approach
2. Empirical/data-driven approach  
3. Mixed-methods approach

For the chosen angle, provide:
- Title variations (3 options)
- Abstract (200 words)
- Research questions/hypotheses (3-5)
- Detailed methodology
- Literature review framework
- Timeline (realistic milestones)
- Expected contributions to field
- Potential challenges & solutions
- Publication strategy

Academic rigor: ${category} standard
Writing style: ${tone}
Ensure originality, feasibility, and academic significance.`
  },

  "business-writing": {
    useCase: "Business Documents",
    basic: (topic, category) => 
      `Create a ${category} for "${topic}". Include executive summary, key points, and actionable recommendations.`,

    better: (topic, category, tone) => [
      // Data-driven approach
      `Create a ${category} for "${topic}".

**Data-Driven Approach:**
• Lead with key metrics and insights
• Use charts/graphs to visualize data
• Evidence-based recommendations
• Clear ROI projections
• Tone: ${tone}

Make it executive-friendly and actionable.`,

      // Narrative approach
      `Create a ${category} for "${topic}".

**Strategic Narrative Approach:**
• Tell a compelling business story
• Connect to company vision/goals
• Emotional appeal + logic
• Stakeholder-focused messaging
• Tone: ${tone}

Balance inspiration with practical steps.`
    ],

    expert: (topic, category, tone) => 
      `Role: You are a senior business consultant with MBA and Fortune 500 experience.

Task: Create a professional ${category} for "${topic}".

Develop 3 STRATEGIC APPROACHES:
1. Financial/ROI-focused (for CFO/investors)
2. Innovation/growth-focused (for CEO/leadership)
3. Operations/execution-focused (for managers)

For your chosen approach include:
- Executive summary (1 page max)
- Situation analysis (SWOT/market context)
- Strategic recommendations (prioritized)
- Implementation roadmap (timeline + resources)
- Risk assessment & mitigation
- Success metrics & KPIs
- Financial projections (if applicable)
- Appendices (supporting data)

Tone: ${tone}
Audience: Senior decision-makers
Objective: Drive action and secure buy-in`
  },

  "creative-writing": {
    useCase: "Creative Writing",
    basic: (topic, category) => 
      `Write a ${category} about "${topic}". Create compelling characters, engaging plot, and vivid descriptions.`,

    better: (topic, category, tone) => [
      // Character-driven
      `Write a ${category} about "${topic}".

**Character-Driven Approach:**
• Deep character development
• Internal conflict drives external plot
• Show don't tell
• Emotional authenticity
• Genre/tone: ${tone}

Focus on transformation and relatability.`,

      // Plot-driven
      `Write a ${category} about "${topic}".

**Plot-Driven Approach:**
• Hook with immediate action
• Rising tension and stakes
• Unexpected twists
• Satisfying resolution
• Style: ${tone}

Keep readers turning pages with momentum.`
    ],

    expert: (topic, category, tone) => 
      `Role: You are a bestselling author and creative writing professor.

Task: Create a complete ${category} outline for "${topic}".

Develop 3 NARRATIVE STRUCTURES:
1. Three-act structure (classic approach)
2. Hero's journey (transformation arc)
3. Non-linear/experimental (modern approach)

For your chosen structure provide:
- Premise (elevator pitch)
- Character profiles (protagonist, antagonist, supporting)
- Act/chapter breakdown (with key scenes)
- Thematic elements
- Setting descriptions (world-building)
- Conflict layers (internal + external)
- Dialogue samples (showing voice)
- Opening hook (first 200 words)
- Climax scenario
- Ending variations (2-3 options)

Genre/Style: ${tone}
Word count target: [based on ${category}]
Market positioning: Commercial appeal + literary merit`
  },

  "marketing-content": {
    useCase: "Marketing & Ads",
    basic: (topic, category) => 
      `Create ${category} content for "${topic}". Focus on benefits, clear CTA, and target audience appeal.`,

    better: (topic, category, tone) => [
      // Problem-solution focus
      `Create ${category} content for "${topic}".

**Problem-Solution Focus:**
• Identify customer pain point
• Agitate the problem
• Present solution (your product/service)
• Proof (testimonials, data)
• Clear CTA
• Tone: ${tone}

Use copywriting formulas (PAS, AIDA).`,

      // Benefit-driven
      `Create ${category} content for "${topic}".

**Benefit-Driven Approach:**
• Lead with biggest benefit
• Features → Benefits translation
• Social proof integration
• Urgency/scarcity elements
• Compelling CTA
• Voice: ${tone}

Focus on transformation, not features.`
    ],

    expert: (topic, category, tone) => 
      `Role: You are a direct-response copywriter with 8-figure campaign experience.

Task: Create high-converting ${category} for "${topic}".

Develop 3 CONVERSION STRATEGIES:
1. Emotional appeal (story-driven)
2. Logical appeal (data/benefit-driven)
3. Authority appeal (expert/testimonial-driven)

For your chosen strategy include:
- Headline variations (10 options to A/B test)
- Subheadline/hook
- Body copy (problem-agitate-solve)
- Bullet points (benefit-focused)
- Social proof integration
- CTA variations (5 options)
- Objection handling
- Guarantee/risk reversal
- PS section (email) or closing argument
- Mobile optimization notes

Tone: ${tone}
Objective: Maximize conversions (clicks, sales, signups)
Audience: [Define target avatar]
Psychology: Leverage persuasion principles`
  }
};

export function generateUniversalPrompt(
  useCase: string,
  tier: "basic" | "better" | "expert",
  topic: string,
  category: string,
  tone: string = "Professional"
): string | string[] {
  const strategy = universalStrategies[useCase];

  if (!strategy) {
    return "Use case not found";
  }

  switch (tier) {
    case "basic":
      return strategy.basic(topic, category);
    case "better":
      const betterOptions = strategy.better(topic, category, tone);
      return betterOptions[Math.floor(Math.random() * betterOptions.length)];
    case "expert":
      return strategy.expert(topic, category, tone);
    default:
      return "";
  }
}
