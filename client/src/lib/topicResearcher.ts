// Topic Researcher - Analyzes topics and enriches prompts with intelligent context

export interface TopicContext {
  mainSubject: string;
  domain: string;
  timeframe?: string;
  keyEntities: string[];
  relatedConcepts: string[];
  geographicalContext?: string;
  culturalContext?: string;
  suggestedAngles: string[];
  knowledgeBase: string;
}

// Knowledge base for common topics (expandable)
const knowledgeDatabase: Record<string, any> = {
  // Music & Culture
  "afrobeat": {
    keyFigures: ["Fela Kuti", "Tony Allen", "Burna Boy", "Wizkid", "Davido", "Tiwa Savage"],
    timeframe: "1970s-present",
    origins: ["Nigeria", "Ghana", "West Africa"],
    movements: ["Afrobeats", "Afro-fusion", "Afropop"],
    context: "African musical genre combining West African musical styles with jazz, funk, and highlife",
    relatedGenres: ["Highlife", "Juju", "Fuji", "Hip hop", "R&B"],
    culturalImpact: "Global recognition, Grammy wins, diaspora influence"
  },
  "african music": {
    scope: "continent-wide diverse musical traditions",
    regions: ["West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa"],
    traditions: ["oral tradition", "drumming", "call-and-response", "polyrhythm"],
    modernMovements: ["Afrobeats", "Gqom", "Amapiano", "Kizomba", "Soukous"],
    timespan: "ancient to contemporary"
  },
  "ai ethics": {
    keyTopics: ["bias and fairness", "transparency", "accountability", "privacy", "job displacement", "autonomous weapons"],
    frameworks: ["EU AI Act", "IEEE Ethics", "UNESCO AI Ethics"],
    scholars: ["Kate Crawford", "Timnit Gebru", "Joy Buolamwini", "Stuart Russell"],
    applications: ["healthcare", "criminal justice", "hiring", "autonomous vehicles", "surveillance"]
  },
  "climate change": {
    aspects: ["global warming", "carbon emissions", "renewable energy", "climate policy", "environmental justice"],
    keyAgreements: ["Paris Agreement", "Kyoto Protocol", "COP summits"],
    impacts: ["sea level rise", "extreme weather", "biodiversity loss", "food security"],
    solutions: ["carbon capture", "renewable energy", "sustainable agriculture", "circular economy"]
  },
  "machine learning": {
    subfields: ["supervised learning", "unsupervised learning", "reinforcement learning", "deep learning", "neural networks"],
    applications: ["computer vision", "NLP", "recommendation systems", "predictive analytics"],
    frameworks: ["TensorFlow", "PyTorch", "scikit-learn", "Keras"],
    challenges: ["overfitting", "bias", "interpretability", "data quality"]
  }
};

// Domain-specific vocabulary enrichment
const domainKeywords: Record<string, string[]> = {
  music: ["genre", "artist", "movement", "influence", "evolution", "cultural impact", "diaspora", "fusion", "tradition"],
  technology: ["innovation", "disruption", "adoption", "scalability", "implementation", "infrastructure", "ecosystem"],
  science: ["methodology", "hypothesis", "evidence", "peer review", "replication", "interdisciplinary", "paradigm shift"],
  business: ["market analysis", "competitive advantage", "stakeholders", "ROI", "value proposition", "scaling", "sustainability"],
  politics: ["policy", "governance", "legislation", "public opinion", "power dynamics", "reform", "accountability"],
  health: ["epidemiology", "treatment", "prevention", "public health", "clinical trials", "outcomes", "disparities"],
  education: ["pedagogy", "curriculum", "learning outcomes", "assessment", "equity", "access", "innovation"],
  social: ["inequality", "justice", "community", "identity", "movement", "change", "empowerment"]
};

/**
 * Analyze a topic and extract intelligent context
 */
export function researchTopic(topic: string, useCase: string): TopicContext {
  const topicLower = topic.toLowerCase();

  // Extract key entities (proper nouns, specific terms)
  const entities = extractEntities(topicLower);

  // Identify domain
  const domain = identifyDomain(topicLower, useCase);

  // Get knowledge base context
  const knowledgeBase = getKnowledgeContext(topicLower);

  // Extract timeframe indicators
  const timeframe = extractTimeframe(topicLower);

  // Identify geographical context
  const geographicalContext = extractGeography(topicLower);

  // Suggest research angles
  const suggestedAngles = generateResearchAngles(topic, domain, useCase);

  // Get related concepts
  const relatedConcepts = getRelatedConcepts(topicLower, domain);

  return {
    mainSubject: extractMainSubject(topic),
    domain,
    timeframe,
    keyEntities: entities,
    relatedConcepts,
    geographicalContext,
    culturalContext: getCulturalContext(topicLower),
    suggestedAngles,
    knowledgeBase
  };
}

function extractMainSubject(topic: string): string {
  // Extract the core subject from the topic
  const cleaned = topic.replace(/^(write|create|make|generate|research|analyze|study|explore)\s+(me\s+)?(a\s+)?(on\s+)?(about\s+)?(the\s+)?/i, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function extractEntities(text: string): string[] {
  const entities: string[] = [];

  // Music-related entities
  if (/afro(beat|beats|pop|fusion)|african music|fela kuti|burna boy|wizkid|davido/i.test(text)) {
    entities.push("Afrobeats", "West African music", "Global music industry");
    if (/fela kuti|tony allen/i.test(text)) entities.push("Fela Kuti", "Afrobeat pioneers");
    if (/burna boy|wizkid|davido/i.test(text)) entities.push("Contemporary Afrobeats artists");
  }

  // AI/Tech entities
  if (/artificial intelligence|machine learning|neural network|deep learning/i.test(text)) {
    entities.push("AI/ML", "Neural networks", "Algorithmic systems");
  }

  // Geographic entities
  if (/africa|nigeria|ghana|kenya|south africa/i.test(text)) {
    const matches = text.match(/\b(africa|nigeria|ghana|kenya|south africa|ethiopia|egypt)\b/gi);
    if (matches) entities.push(...matches.map(m => m.charAt(0).toUpperCase() + m.slice(1)));
  }

  // Temporal entities
  if (/\b(19|20)\d{2}s?\b/.test(text)) {
    const decades = text.match(/\b(19|20)\d{2}s?\b/g);
    if (decades) entities.push(...decades);
  }

  return [...new Set(entities)];
}

function identifyDomain(text: string, useCase: string): string {
  // Use case hints
  if (useCase === "academic-research") return "Academic";
  if (useCase === "business-writing") return "Business";
  if (useCase === "creative-writing") return "Creative";

  // Content analysis
  if (/music|song|artist|album|genre|concert/i.test(text)) return "Music & Culture";
  if (/ai|artificial intelligence|machine learning|algorithm|neural/i.test(text)) return "Technology & AI";
  if (/climate|environment|sustainability|carbon|renewable/i.test(text)) return "Environmental Science";
  if (/health|medical|disease|treatment|pandemic/i.test(text)) return "Health & Medicine";
  if (/economy|market|business|finance|trade/i.test(text)) return "Economics & Business";
  if (/policy|government|politics|legislation|democracy/i.test(text)) return "Political Science";
  if (/education|learning|teaching|curriculum|pedagogy/i.test(text)) return "Education";
  if (/art|literature|film|theatre|culture/i.test(text)) return "Arts & Humanities";

  return "General";
}

function getKnowledgeContext(text: string): string {
  let context = "";

  // Check knowledge database for matches
  for (const [key, data] of Object.entries(knowledgeDatabase)) {
    if (text.includes(key)) {
      if (data.context) context += data.context + ". ";
      if (data.keyFigures) context += `Key figures include ${data.keyFigures.slice(0, 3).join(", ")}. `;
      if (data.timeframe) context += `Historical period: ${data.timeframe}. `;
      if (data.origins) context += `Origins: ${data.origins.join(", ")}. `;
      if (data.culturalImpact) context += `Cultural significance: ${data.culturalImpact}. `;
    }
  }

  // Pattern-based context enrichment
  if (/rise|growth|emergence|development/i.test(text)) {
    context += "This topic involves historical evolution and transformation over time. ";
  }
  if (/impact|effect|influence|consequences/i.test(text)) {
    context += "Analysis should consider causal relationships and broader implications. ";
  }
  if (/compare|contrast|versus|vs/i.test(text)) {
    context += "Comparative analysis framework recommended. ";
  }
  if (/future|forecast|prediction|trends/i.test(text)) {
    context += "Forward-looking analysis with scenario planning recommended. ";
  }

  return context.trim() || "Comprehensive analysis of the topic with evidence-based insights.";
}

function extractTimeframe(text: string): string | undefined {
  // Specific years
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) return yearMatch[0];

  // Decades
  const decadeMatch = text.match(/\b(19|20)\d{2}s\b/);
  if (decadeMatch) return decadeMatch[0];

  // Relative time
  if (/recent|modern|contemporary|current/i.test(text)) return "Contemporary (2010s-present)";
  if (/historical|past|traditional|ancient/i.test(text)) return "Historical";
  if (/future|emerging|upcoming/i.test(text)) return "Future-oriented";

  // Period indicators
  if (/20th century|twentieth century/i.test(text)) return "20th century";
  if (/21st century|twenty-first century/i.test(text)) return "21st century";

  return undefined;
}

function extractGeography(text: string): string | undefined {
  const continents = ["africa", "asia", "europe", "north america", "south america", "oceania"];
  const regions = ["west africa", "east africa", "southern africa", "north africa", "sub-saharan africa", 
                   "middle east", "southeast asia", "latin america", "caribbean"];
  const countries = ["nigeria", "ghana", "kenya", "south africa", "ethiopia", "egypt", "usa", "uk", "china", "india"];

  for (const continent of continents) {
    if (text.includes(continent)) return continent.charAt(0).toUpperCase() + continent.slice(1);
  }

  for (const region of regions) {
    if (text.includes(region)) return region.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  for (const country of countries) {
    if (text.includes(country)) return country.charAt(0).toUpperCase() + country.slice(1);
  }

  return undefined;
}

function getCulturalContext(text: string): string | undefined {
  if (/diaspora|migration|immigrant|exile/i.test(text)) return "Diaspora and migration dynamics";
  if (/identity|heritage|tradition|indigenous/i.test(text)) return "Cultural identity and heritage";
  if (/globalization|global|international|cross-cultural/i.test(text)) return "Globalization and cross-cultural exchange";
  if (/post-colonial|colonial|decoloniz/i.test(text)) return "Post-colonial perspectives";
  if (/urban|city|metropolitan/i.test(text)) return "Urban culture and dynamics";

  return undefined;
}

function getRelatedConcepts(text: string, domain: string): string[] {
  const concepts: string[] = [];

  // Domain-specific concepts
  const domainVocab = domainKeywords[domain.toLowerCase().split(' ')[0]] || [];
  concepts.push(...domainVocab.slice(0, 4));

  // Topic-specific concepts
  if (/music/i.test(text)) {
    concepts.push("cultural production", "artistic expression", "sonic identity", "genre evolution");
  }
  if (/technology|ai/i.test(text)) {
    concepts.push("innovation cycles", "adoption patterns", "technological determinism", "digital transformation");
  }
  if (/social|community/i.test(text)) {
    concepts.push("social dynamics", "community engagement", "collective action", "social capital");
  }

  return [...new Set(concepts)].slice(0, 6);
}

function generateResearchAngles(topic: string, domain: string, useCase: string): string[] {
  const angles: string[] = [];
  const topicLower = topic.toLowerCase();

  // Academic research angles
  if (useCase === "academic-research") {
    angles.push("Historical evolution and key milestones");
    angles.push("Comparative analysis with similar phenomena");
    angles.push("Socio-cultural impact and implications");
    angles.push("Methodological approaches and frameworks");
    angles.push("Future trajectories and emerging trends");
  }

  // Business angles
  if (useCase === "business-writing") {
    angles.push("Market dynamics and opportunity analysis");
    angles.push("Stakeholder perspectives and interests");
    angles.push("Risk assessment and mitigation strategies");
    angles.push("Implementation roadmap and success metrics");
  }

  // Content-specific angles
  if (/rise|growth|emergence/i.test(topicLower)) {
    angles.push("Catalysts and driving forces");
    angles.push("Key actors and institutional support");
    angles.push("Barriers overcome and challenges remaining");
  }

  if (/impact|effect|influence/i.test(topicLower)) {
    angles.push("Direct and indirect consequences");
    angles.push("Short-term vs long-term effects");
    angles.push("Intended and unintended outcomes");
  }

  if (/future|trend|forecast/i.test(topicLower)) {
    angles.push("Scenario analysis (best/worst/likely cases)");
    angles.push("Disruptive factors and wild cards");
    angles.push("Strategic implications and recommendations");
  }

  return [...new Set(angles)].slice(0, 5);
}

/**
 * Enrich a prompt with researched context
 */
export function enrichPromptWithContext(
  basePrompt: string,
  context: TopicContext,
  promptType: "basic" | "better" | "expert"
): string {
  if (promptType === "basic") {
    // Basic: Just add main subject clarity
    return basePrompt.replace(/\$\{topic\}/g, context.mainSubject);
  }

  if (promptType === "better") {
    // Better: Add domain context and key entities
    let enriched = basePrompt;

    // Inject knowledge base context
    if (context.knowledgeBase) {
      enriched += `\n\n**Context:** ${context.knowledgeBase}`;
    }

    // Add key entities
    if (context.keyEntities.length > 0) {
      enriched += `\n\n**Key Elements to Address:** ${context.keyEntities.join(", ")}`;
    }

    // Add timeframe if relevant
    if (context.timeframe) {
      enriched += `\n**Time Period:** ${context.timeframe}`;
    }

    return enriched;
  }

  if (promptType === "expert") {
    // Expert: Full context enrichment
    let enriched = basePrompt;

    // Knowledge base
    if (context.knowledgeBase) {
      enriched += `\n\n**Contextual Background:**\n${context.knowledgeBase}`;
    }

    // Research angles
    if (context.suggestedAngles.length > 0) {
      enriched += `\n\n**Recommended Research Angles:**\n${context.suggestedAngles.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
    }

    // Related concepts
    if (context.relatedConcepts.length > 0) {
      enriched += `\n\n**Related Concepts to Explore:** ${context.relatedConcepts.join(", ")}`;
    }

    // Geographical context
    if (context.geographicalContext) {
      enriched += `\n\n**Geographical Focus:** ${context.geographicalContext}`;
    }

    // Cultural context
    if (context.culturalContext) {
      enriched += `\n**Cultural Lens:** ${context.culturalContext}`;
    }

    return enriched;
  }

  return basePrompt;
}
