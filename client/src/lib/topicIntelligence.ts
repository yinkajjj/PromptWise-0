// Topic Intelligence - Analyze viral potential and market viability

export interface TopicAnalysis {
  topic: string;
  viralPotential: number; // 1-10
  saturation: "low" | "medium" | "high" | "extreme";
  difficulty: "beginner" | "intermediate" | "expert";
  trendingStatus: "declining" | "stable" | "rising" | "viral";
  recommendations: string[];
  uniqueAngles: string[];
  warnings: string[];
  bestPlatforms: string[];
  seasonality?: string;
  estimatedViews: string;
}

export interface CreatorExample {
  handle: string;
  followers: string;
  niche: string;
  whySuccessful: string;
  style: string;
}

export interface TrendingHashtag {
  tag: string;
  posts: string;
  engagement: "low" | "medium" | "high";
  trend: "rising" | "stable" | "declining";
}

// Oversaturated topics database
const oversaturatedTopics = [
  "morning routine", "what i eat in a day", "get ready with me", 
  "day in my life", "glow up", "productivity tips", "grwm",
  "gym motivation", "weight loss journey", "amazon haul"
];

// Trending niches (would be API-powered in production)
const trendingNiches = [
  "AI tools", "side hustles", "financial literacy", "mental health",
  "remote work", "sustainable living", "book recommendations",
  "career advice", "relationship psychology", "self improvement"
];

// Platform-specific strength
const platformStrengths: Record<string, string[]> = {
  "TikTok": ["trends", "challenges", "storytelling", "education", "comedy"],
  "YouTube Shorts": ["tutorials", "quick tips", "facts", "reviews"],
  "Instagram Reels": ["aesthetics", "lifestyle", "fashion", "travel", "food"]
};

export function analyzeTopicViability(
  topic: string, 
  category: string, 
  platform: string
): TopicAnalysis {
  const lowerTopic = topic.toLowerCase();

  // Check saturation
  const isOversaturated = oversaturatedTopics.some(ot => 
    lowerTopic.includes(ot) || ot.includes(lowerTopic)
  );

  const isTrending = trendingNiches.some(tn => 
    lowerTopic.includes(tn) || tn.includes(lowerTopic)
  );

  // Calculate viral potential (1-10)
  let viralPotential = 5; // baseline

  if (isTrending) viralPotential += 2;
  if (isOversaturated) viralPotential -= 2;
  if (lowerTopic.length < 30) viralPotential += 1; // simple topics perform better
  if (category === "entertainment" || category === "storytelling") viralPotential += 1;
  if (category === "tutorial") viralPotential += 0.5;

  // Platform match
  const platformMatch = platformStrengths[platform]?.includes(category);
  if (platformMatch) viralPotential += 1;

  viralPotential = Math.max(1, Math.min(10, viralPotential)); // clamp 1-10

  // Determine saturation
  let saturation: TopicAnalysis["saturation"] = "medium";
  if (isOversaturated) saturation = "extreme";
  else if (isTrending) saturation = "high";
  else if (trendingNiches.some(tn => lowerTopic.includes(tn.split(' ')[0]))) saturation = "medium";
  else saturation = "low";

  // Difficulty assessment
  let difficulty: TopicAnalysis["difficulty"] = "intermediate";
  if (category === "education" || category === "tutorial") difficulty = "intermediate";
  if (category === "storytelling" || category === "entertainment") difficulty = "beginner";
  if (saturation === "extreme") difficulty = "expert"; // need unique angle

  // Trending status
  let trendingStatus: TopicAnalysis["trendingStatus"] = "stable";
  if (isTrending) trendingStatus = "viral";
  else if (isOversaturated) trendingStatus = "declining";
  else if (viralPotential > 7) trendingStatus = "rising";

  // Generate recommendations
  const recommendations: string[] = [];
  const warnings: string[] = [];
  const uniqueAngles: string[] = [];

  if (isOversaturated) {
    warnings.push(`⚠️ This topic is highly saturated. You need a VERY unique angle to stand out.`);
    recommendations.push("Focus on a hyper-specific sub-niche");
    recommendations.push("Use personal storytelling to differentiate");
    recommendations.push("Combine with trending formats or challenges");
  }

  if (isTrending) {
    recommendations.push("✅ Great timing! This niche is trending right now");
    recommendations.push("Post consistently to ride the trend wave");
    recommendations.push("Study top performers and add your unique twist");
  }

  if (saturation === "low") {
    recommendations.push("💡 Low competition! You can establish authority here");
    recommendations.push("Create a series to dominate this niche");
    warnings.push("Lower search volume - may need more time to gain traction");
  }

  if (viralPotential < 5) {
    warnings.push("📉 Lower viral potential. Consider adding entertainment value");
    recommendations.push("Make it more relatable or emotional");
    recommendations.push("Add humor, surprise, or storytelling elements");
  }

  // Generate unique angles
  if (category === "education") {
    uniqueAngles.push(`"Things nobody tells you about ${topic}"`);
    uniqueAngles.push(`"The ${topic} mistake that cost me everything"`);
    uniqueAngles.push(`"I tried ${topic} for 30 days - here's what happened"`);
  } else if (category === "storytelling") {
    uniqueAngles.push(`"The day ${topic} changed my life forever"`);
    uniqueAngles.push(`"What ${topic} taught me about myself"`);
    uniqueAngles.push(`"The truth about ${topic} nobody talks about"`);
  } else if (category === "tutorial") {
    uniqueAngles.push(`"${topic} in 30 seconds (no BS)"`);
    uniqueAngles.push(`"The ONLY ${topic} tutorial you need"`);
    uniqueAngles.push(`"${topic} - the easy way vs the right way"`);
  } else {
    uniqueAngles.push(`"My unpopular opinion about ${topic}"`);
    uniqueAngles.push(`"${topic} but make it interesting"`);
    uniqueAngles.push(`"Why everyone gets ${topic} wrong"`);
  }

  // Best platforms
  const bestPlatforms: string[] = [];
  if (platformMatch) bestPlatforms.push(platform);

  if (category === "education" || category === "tutorial") {
    bestPlatforms.push("TikTok", "YouTube Shorts");
  } else if (category === "entertainment" || category === "storytelling") {
    bestPlatforms.push("TikTok", "Instagram Reels");
  } else if (category === "lifestyle" || category === "product-review") {
    bestPlatforms.push("Instagram Reels", "TikTok");
  }

  // Estimated views (rough estimate based on viral potential)
  let estimatedViews = "1K - 5K";
  if (viralPotential >= 8) estimatedViews = "50K - 500K+";
  else if (viralPotential >= 6) estimatedViews = "10K - 100K";
  else if (viralPotential >= 4) estimatedViews = "5K - 50K";

  return {
    topic,
    viralPotential: Math.round(viralPotential * 10) / 10,
    saturation,
    difficulty,
    trendingStatus,
    recommendations,
    uniqueAngles,
    warnings,
    bestPlatforms: Array.from(new Set(bestPlatforms)),
    estimatedViews,
  };
}

export function getSuggestedCreators(category: string, platform: string): CreatorExample[] {
  // In production, this would query a database or API
  // For now, curated list of successful creators by category

  const creatorDatabase: Record<string, CreatorExample[]> = {
    "education": [
      { handle: "@justinsung", followers: "1.2M", niche: "Learning techniques", whySuccessful: "Breaks down complex learning methods simply", style: "Educational with personality" },
      { handle: "@corporate.girly", followers: "800K", niche: "Career advice", whySuccessful: "Relatable corporate humor", style: "Comedy meets education" },
      { handle: "@goharktx", followers: "2.1M", niche: "Tech education", whySuccessful: "Makes tech accessible and fun", style: "Quick tips with personality" },
    ],
    "storytelling": [
      { handle: "@thatlittlepuff", followers: "3.2M", niche: "Personal stories", whySuccessful: "Emotional authenticity", style: "Raw, vulnerable storytelling" },
      { handle: "@zachking", followers: "70M", niche: "Magic storytelling", whySuccessful: "Mind-blowing editing", style: "Visual illusions with narrative" },
      { handle: "@khabylame", followers: "161M", niche: "Comedy storytelling", whySuccessful: "Silent humor, universal appeal", style: "Physical comedy reactions" },
    ],
    "tutorial": [
      { handle: "@learnwithjohnny", followers: "500K", niche: "Quick tutorials", whySuccessful: "30-second actionable tips", style: "Fast, no-fluff teaching" },
      { handle: "@annamcnulty", followers: "4M", niche: "Flexibility tutorials", whySuccessful: "Clear demonstrations", style: "Step-by-step visual guides" },
      { handle: "@danscratch", followers: "1.8M", niche: "Life hacks", whySuccessful: "Mind-blowing discoveries", style: "Surprise factor hooks" },
    ],
    "entertainment": [
      { handle: "@spencerx", followers: "55M", niche: "Beatboxing comedy", whySuccessful: "Unique skill + humor", style: "Musical entertainment" },
      { handle: "@brittany_broski", followers: "7.8M", niche: "Commentary", whySuccessful: "Charismatic personality", style: "Relatable humor" },
      { handle: "@kris.hc", followers: "51M", niche: "POV comedy", whySuccessful: "Relatable situations", style: "Character-based skits" },
    ],
    "lifestyle": [
      { handle: "@emmamacdonald", followers: "2.1M", niche: "College lifestyle", whySuccessful: "Authentic daily life", style: "Vlog-style candid" },
      { handle: "@jamapltd", followers: "1.5M", niche: "Aesthetic lifestyle", whySuccessful: "Beautiful cinematography", style: "Cinematic short-form" },
      { handle: "@thesorrygirls", followers: "3.4M", niche: "DIY lifestyle", whySuccessful: "Creative projects", style: "Before/after transformations" },
    ],
  };

  return creatorDatabase[category] || creatorDatabase["education"];
}

export function getTrendingHashtags(category: string, platform: string): TrendingHashtag[] {
  // In production, this would fetch live data from APIs
  const hashtagDatabase: Record<string, TrendingHashtag[]> = {
    "education": [
      { tag: "LearnOnTikTok", posts: "50B+", engagement: "high", trend: "stable" },
      { tag: "EducationalContent", posts: "5B+", engagement: "medium", trend: "stable" },
      { tag: "TikTokTutorial", posts: "8B+", engagement: "high", trend: "rising" },
      { tag: "DidYouKnow", posts: "12B+", engagement: "high", trend: "stable" },
      { tag: "QuickTips", posts: "3B+", engagement: "medium", trend: "rising" },
    ],
    "storytelling": [
      { tag: "Storytime", posts: "45B+", engagement: "high", trend: "stable" },
      { tag: "TrueStory", posts: "15B+", engagement: "high", trend: "rising" },
      { tag: "Storytelling", posts: "8B+", engagement: "medium", trend: "stable" },
      { tag: "RealTalk", posts: "10B+", engagement: "high", trend: "rising" },
      { tag: "ShareYourStory", posts: "5B+", engagement: "medium", trend: "stable" },
    ],
    "tutorial": [
      { tag: "Tutorial", posts: "35B+", engagement: "high", trend: "stable" },
      { tag: "HowTo", posts: "20B+", engagement: "high", trend: "stable" },
      { tag: "LifeHacks", posts: "18B+", engagement: "high", trend: "rising" },
      { tag: "DIY", posts: "25B+", engagement: "high", trend: "stable" },
      { tag: "LearnWithMe", posts: "7B+", engagement: "medium", trend: "rising" },
    ],
  };

  return hashtagDatabase[category] || hashtagDatabase["education"];
}

export function getSeasonalInsights(topic: string): string | null {
  const lowerTopic = topic.toLowerCase();
  const currentMonth = new Date().getMonth(); // 0-11

  // Seasonal keywords
  const seasonal: Record<string, { months: number[]; message: string }> = {
    "fitness": { months: [0, 1], message: "🔥 Peak season! New Year's fitness goals are trending" },
    "school": { months: [7, 8], message: "📚 Back to school season - high engagement" },
    "halloween": { months: [9], message: "🎃 Perfect timing for Halloween content" },
    "christmas": { months: [10, 11], message: "🎄 Holiday season - great for gift/celebration content" },
    "summer": { months: [5, 6, 7], message: "☀️ Summer vibes are trending now" },
    "valentine": { months: [1], message: "💕 Valentine's Day content performs well" },
  };

  for (const [keyword, data] of Object.entries(seasonal)) {
    if (lowerTopic.includes(keyword) && data.months.includes(currentMonth)) {
      return data.message;
    }
  }

  return null;
}
