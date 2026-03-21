import type { Prompt } from "@/data/mockPrompts";

export type SearchSuggestion = {
  label: string;
  value: string;
  kind: "title" | "tag" | "tool" | "category" | "tone";
  score: number;
};

export type SearchMatchReason = {
  label: string;
  kind: "title" | "tag" | "tool" | "category" | "tone" | "intent";
};

export type SearchIntent = {
  id?: string;
  query: string;
  category: string;
  tool: string;
  tone: string;
  explanation: string;
  chips: string[];
  createdAt?: string;
  pinned?: boolean;
};

const RECENT_INTENTS_STORAGE_KEY = "promptwise:recent-intents";
const MAX_RECENT_INTENTS = 6;
const isBrowser = typeof window !== "undefined";

const sortRecentIntents = (intents: SearchIntent[]) => {
  return [...intents].sort((left, right) => {
    if ((right.pinned ? 1 : 0) !== (left.pinned ? 1 : 0)) {
      return (right.pinned ? 1 : 0) - (left.pinned ? 1 : 0);
    }

    const leftTime = new Date(left.createdAt ?? 0).getTime();
    const rightTime = new Date(right.createdAt ?? 0).getTime();
    return rightTime - leftTime;
  });
};

const normalizeRecentIntent = (intent: SearchIntent): SearchIntent => ({
  ...intent,
  id: intent.id ?? `intent-${Math.random().toString(36).slice(2)}-${Date.now()}`,
  createdAt: intent.createdAt ?? new Date().toISOString(),
  pinned: Boolean(intent.pinned),
});

const TOOL_KEYWORDS = [
  { value: "chatgpt", terms: ["chatgpt", "gpt", "openai"] },
  { value: "claude", terms: ["claude", "anthropic"] },
  { value: "midjourney", terms: ["midjourney", "image", "photo", "photography", "render", "art", "visual"] },
  { value: "runway", terms: ["runway", "video editing", "motion"] },
];

const CATEGORY_KEYWORDS = [
  { value: "writing", terms: ["write", "writing", "blog", "article", "copy", "email", "seo", "headline"] },
  { value: "image", terms: ["image", "photo", "photography", "visual", "render", "art", "design"] },
  { value: "business", terms: ["business", "marketing", "launch", "strategy", "customer", "brand", "campaign", "persona"] },
  { value: "video", terms: ["video", "youtube", "script", "storyboard", "reel", "tutorial"] },
];

const TONE_KEYWORDS = [
  { value: "Professional", terms: ["professional", "formal", "executive"] },
  { value: "Creative", terms: ["creative", "bold", "inventive"] },
  { value: "Conversational", terms: ["conversational", "friendly", "casual"] },
  { value: "Playful", terms: ["playful", "fun", "witty"] },
  { value: "Inspirational", terms: ["inspirational", "motivational", "uplifting"] },
  { value: "Technical", terms: ["technical", "detailed", "engineering"] },
];

const STOP_WORDS = new Set([
  "a", "an", "and", "best", "build", "create", "for", "help", "i", "ideas", "me", "need", "of", "on", "prompt", "prompts", "show", "some", "the", "to", "with",
]);

const normalize = (value: string) => value.trim().toLowerCase();

const tokenize = (value: string) =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const includesTerm = (value: string, term: string) => normalize(value).includes(term);

export const searchPromptScore = (prompt: Prompt, query: string) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return 0;
  }

  const queryTerms = tokenize(query);
  const haystacks = {
    title: normalize(prompt.title),
    description: normalize(prompt.description),
    prompt: normalize(prompt.prompt),
    category: normalize(prompt.category),
    tool: normalize(prompt.tool),
    tone: normalize(prompt.tone),
    tags: prompt.tags.map((tag) => normalize(tag)),
  };

  let score = 0;

  if (haystacks.title.includes(normalizedQuery)) score += 160;
  if (haystacks.description.includes(normalizedQuery)) score += 90;
  if (haystacks.prompt.includes(normalizedQuery)) score += 60;
  if (haystacks.category.includes(normalizedQuery)) score += 70;
  if (haystacks.tool.includes(normalizedQuery)) score += 80;
  if (haystacks.tone.includes(normalizedQuery)) score += 60;
  if (haystacks.tags.some((tag) => tag.includes(normalizedQuery))) score += 120;

  for (const term of queryTerms) {
    if (haystacks.title.includes(term)) score += 36;
    if (haystacks.description.includes(term)) score += 20;
    if (haystacks.prompt.includes(term)) score += 8;
    if (haystacks.category.includes(term)) score += 28;
    if (haystacks.tool.includes(term)) score += 30;
    if (haystacks.tone.includes(term)) score += 18;
    if (haystacks.tags.some((tag) => tag.includes(term))) score += 32;
  }

  return score;
};

export const sortPromptsBySmartSearch = (prompts: Prompt[], query: string) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [...prompts].sort((left, right) => {
      if ((right.isFeatured ? 1 : 0) !== (left.isFeatured ? 1 : 0)) {
        return (right.isFeatured ? 1 : 0) - (left.isFeatured ? 1 : 0);
      }

      if ((right.isTrending ? 1 : 0) !== (left.isTrending ? 1 : 0)) {
        return (right.isTrending ? 1 : 0) - (left.isTrending ? 1 : 0);
      }

      if (right.rating !== left.rating) {
        return right.rating - left.rating;
      }

      return right.copies - left.copies;
    });
  }

  return prompts
    .map((prompt) => ({ prompt, score: searchPromptScore(prompt, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.prompt.rating !== left.prompt.rating) {
        return right.prompt.rating - left.prompt.rating;
      }

      return right.prompt.copies - left.prompt.copies;
    })
    .map((entry) => entry.prompt);
};

export const describeSmartSearch = (query: string) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return "Search understands titles, tags, tools, tone, and prompt intent.";
  }

  const hints: string[] = [];

  if (includesTerm(query, "chatgpt") || includesTerm(query, "claude") || includesTerm(query, "midjourney") || includesTerm(query, "runway")) {
    hints.push("tool-aware");
  }

  if (includesTerm(query, "professional") || includesTerm(query, "creative") || includesTerm(query, "conversational")) {
    hints.push("tone-aware");
  }

  if (includesTerm(query, "writing") || includesTerm(query, "image") || includesTerm(query, "video") || includesTerm(query, "business")) {
    hints.push("category-aware");
  }

  if (hints.length === 0) {
    return "Ranking results by title match, tags, tool fit, and prompt relevance.";
  }

  return `Smart search is ${hints.join(", ")} for this query.`;
};

export const smartSearchPresets = [
  "chatgpt launch copy",
  "midjourney product photography",
  "professional business strategy",
  "creative youtube hooks",
];

export const getSmartSearchSuggestions = (prompts: Prompt[], query: string) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return smartSearchPresets.map((preset, index) => ({
      label: preset,
      value: preset,
      kind: "title" as const,
      score: 100 - index,
    }));
  }

  const suggestions = new Map<string, SearchSuggestion>();

  const upsertSuggestion = (suggestion: SearchSuggestion) => {
    const existing = suggestions.get(suggestion.value);
    if (!existing || existing.score < suggestion.score) {
      suggestions.set(suggestion.value, suggestion);
    }
  };

  for (const prompt of prompts) {
    const promptScore = searchPromptScore(prompt, query);
    if (promptScore <= 0) {
      continue;
    }

    if (includesTerm(prompt.title, normalizedQuery)) {
      upsertSuggestion({ label: prompt.title, value: prompt.title, kind: "title", score: promptScore + 40 });
    }

    if (includesTerm(prompt.category, normalizedQuery)) {
      upsertSuggestion({ label: prompt.category, value: prompt.category, kind: "category", score: promptScore + 30 });
    }

    if (includesTerm(prompt.tool, normalizedQuery)) {
      upsertSuggestion({ label: prompt.tool, value: prompt.tool, kind: "tool", score: promptScore + 20 });
    }

    if (includesTerm(prompt.tone, normalizedQuery)) {
      upsertSuggestion({ label: prompt.tone, value: prompt.tone, kind: "tone", score: promptScore + 10 });
    }

    for (const tag of prompt.tags) {
      if (includesTerm(tag, normalizedQuery)) {
        upsertSuggestion({ label: tag, value: tag, kind: "tag", score: promptScore + 15 });
      }
    }
  }

  return Array.from(suggestions.values())
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label))
    .slice(0, 6);
};

export const getPromptMatchReasons = (prompt: Prompt, query: string): SearchMatchReason[] => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }

  const reasons: SearchMatchReason[] = [];
  const terms = tokenize(query);
  const promptText = normalize(prompt.prompt);

  const pushReason = (reason: SearchMatchReason) => {
    if (!reasons.some((entry) => entry.kind === reason.kind && entry.label === reason.label)) {
      reasons.push(reason);
    }
  };

  if (includesTerm(prompt.title, normalizedQuery) || terms.some((term) => includesTerm(prompt.title, term))) {
    pushReason({ kind: "title", label: "Title match" });
  }

  if (prompt.tags.some((tag) => includesTerm(tag, normalizedQuery) || terms.some((term) => includesTerm(tag, term)))) {
    pushReason({ kind: "tag", label: "Tag match" });
  }

  if (includesTerm(prompt.tool, normalizedQuery) || terms.some((term) => includesTerm(prompt.tool, term))) {
    pushReason({ kind: "tool", label: "Tool fit" });
  }

  if (includesTerm(prompt.category, normalizedQuery) || terms.some((term) => includesTerm(prompt.category, term))) {
    pushReason({ kind: "category", label: "Category fit" });
  }

  if (includesTerm(prompt.tone, normalizedQuery) || terms.some((term) => includesTerm(prompt.tone, term))) {
    pushReason({ kind: "tone", label: "Tone fit" });
  }

  if (includesTerm(promptText, normalizedQuery) || terms.some((term) => includesTerm(promptText, term))) {
    pushReason({ kind: "intent", label: "Prompt intent" });
  }

  return reasons.slice(0, 3);
};

export const interpretSearchIntent = (input: string): SearchIntent => {
  const normalizedInput = normalize(input);
  const terms = tokenize(input);

  const matchedTool = TOOL_KEYWORDS.find((item) => item.terms.some((term) => normalizedInput.includes(term)));
  const matchedCategory = CATEGORY_KEYWORDS.find((item) => item.terms.some((term) => normalizedInput.includes(term)));
  const matchedTone = TONE_KEYWORDS.find((item) => item.terms.some((term) => normalizedInput.includes(term)));

  const usedTerms = new Set<string>([
    ...(matchedTool?.terms ?? []),
    ...(matchedCategory?.terms ?? []),
    ...(matchedTone?.terms ?? []),
  ]);

  const focusTerms = terms.filter((term) => !STOP_WORDS.has(term) && !usedTerms.has(term)).slice(0, 6);
  const query = focusTerms.join(" ") || input.trim();

  const chips = [
    matchedTool ? `Tool: ${matchedTool.value}` : null,
    matchedCategory ? `Category: ${matchedCategory.value}` : null,
    matchedTone ? `Tone: ${matchedTone.value}` : null,
    query ? `Focus: ${query}` : null,
  ].filter((item): item is string => Boolean(item));

  const explanationParts = [
    matchedTool ? `tool ${matchedTool.value}` : null,
    matchedCategory ? `category ${matchedCategory.value}` : null,
    matchedTone ? `tone ${matchedTone.value}` : null,
  ].filter((item): item is string => Boolean(item));

  return {
    query,
    tool: matchedTool?.value ?? "all",
    category: matchedCategory?.value ?? "all",
    tone: matchedTone?.value ?? "All Tones",
    explanation:
      explanationParts.length > 0
        ? `AI interpreted your request using ${explanationParts.join(", ")} and kept \"${query}\" as the search focus.`
        : `AI kept \"${query}\" as the main search focus and left filters broad for discovery.`,
    chips,
    createdAt: new Date().toISOString(),
  };
};

export const getRecentSearchIntents = (): SearchIntent[] => {
  if (!isBrowser) {
    return [];
  }

  const rawValue = window.localStorage.getItem(RECENT_INTENTS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortRecentIntents(parsed.map((item) => normalizeRecentIntent(item)));
  } catch {
    return [];
  }
};

export const saveRecentSearchIntent = (intent: SearchIntent): SearchIntent[] => {
  const existing = getRecentSearchIntents();
  const normalizedIntent = normalizeRecentIntent(intent);
  const deduped = existing.filter(
    (item) =>
      !(
        item.query === normalizedIntent.query &&
        item.category === normalizedIntent.category &&
        item.tool === normalizedIntent.tool &&
        item.tone === normalizedIntent.tone
      ),
  );

  const next = sortRecentIntents([
    {
      ...normalizedIntent,
      createdAt: new Date().toISOString(),
    },
    ...deduped,
  ]).slice(0, MAX_RECENT_INTENTS);

  if (isBrowser) {
    window.localStorage.setItem(RECENT_INTENTS_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
};

export const togglePinRecentSearchIntent = (intentId: string): SearchIntent[] => {
  const next = sortRecentIntents(
    getRecentSearchIntents().map((intent) => {
      if (intent.id !== intentId) {
        return intent;
      }

      return {
        ...intent,
        pinned: !intent.pinned,
      };
    }),
  );

  if (isBrowser) {
    window.localStorage.setItem(RECENT_INTENTS_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
};

export const clearRecentSearchIntents = (): SearchIntent[] => {
  if (isBrowser) {
    window.localStorage.setItem(RECENT_INTENTS_STORAGE_KEY, JSON.stringify([]));
  }

  return [];
};