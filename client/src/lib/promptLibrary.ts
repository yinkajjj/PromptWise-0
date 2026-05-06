// Prompt Library - Save, organize, and track prompts

export interface SavedPrompt {
  id: string;
  topic: string;
  basic: string;
  better: string;
  expert: string;
  category: string;
  platform: string;
  tone: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  lastUsed?: number;
  usageCount: number;
  performanceRating?: number; // 1-5 stars
  notes?: string;
}

const LIBRARY_KEY = "promptwise:library";
const MAX_LIBRARY_SIZE = 500;

export function savePromptToLibrary(prompt: Omit<SavedPrompt, "id" | "createdAt" | "usageCount">): SavedPrompt {
  const library = getPromptLibrary();
  const newPrompt: SavedPrompt = {
    ...prompt,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    usageCount: 0,
  };

  const updatedLibrary = [newPrompt, ...library].slice(0, MAX_LIBRARY_SIZE);

  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updatedLibrary));
    window.dispatchEvent(new Event("promptLibraryUpdated"));
    return newPrompt;
  } catch (e) {
    console.error("Failed to save prompt to library:", e);
    throw new Error("Failed to save prompt");
  }
}

export function getPromptLibrary(): SavedPrompt[] {
  try {
    const stored = localStorage.getItem(LIBRARY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load prompt library:", e);
    return [];
  }
}

export function deletePromptFromLibrary(id: string): void {
  const library = getPromptLibrary();
  const updated = library.filter((p) => p.id !== id);

  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("promptLibraryUpdated"));
  } catch (e) {
    console.error("Failed to delete prompt:", e);
  }
}

export function toggleFavoritePrompt(id: string): void {
  const library = getPromptLibrary();
  const updated = library.map((p) => 
    p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
  );

  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("promptLibraryUpdated"));
  } catch (e) {
    console.error("Failed to toggle favorite:", e);
  }
}

export function updatePromptUsage(id: string): void {
  const library = getPromptLibrary();
  const updated = library.map((p) => 
    p.id === id 
      ? { ...p, usageCount: p.usageCount + 1, lastUsed: Date.now() } 
      : p
  );

  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("promptLibraryUpdated"));
  } catch (e) {
    console.error("Failed to update usage:", e);
  }
}

export function ratePromptPerformance(id: string, rating: number): void {
  const library = getPromptLibrary();
  const updated = library.map((p) => 
    p.id === id ? { ...p, performanceRating: rating } : p
  );

  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("promptLibraryUpdated"));
  } catch (e) {
    console.error("Failed to rate prompt:", e);
  }
}

export function addTagsToPrompt(id: string, tags: string[]): void {
  const library = getPromptLibrary();
  const updated = library.map((p) => 
    p.id === id ? { ...p, tags: [...new Set([...p.tags, ...tags])] } : p
  );

  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("promptLibraryUpdated"));
  } catch (e) {
    console.error("Failed to add tags:", e);
  }
}

export function updatePromptNotes(id: string, notes: string): void {
  const library = getPromptLibrary();
  const updated = library.map((p) => 
    p.id === id ? { ...p, notes } : p
  );

  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("promptLibraryUpdated"));
  } catch (e) {
    console.error("Failed to update notes:", e);
  }
}

export function searchPromptLibrary(query: string): SavedPrompt[] {
  const library = getPromptLibrary();
  const lowerQuery = query.toLowerCase();

  return library.filter((p) => 
    p.topic.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.notes?.toLowerCase().includes(lowerQuery)
  );
}

export function filterPromptLibrary(filters: {
  category?: string;
  platform?: string;
  isFavorite?: boolean;
  minRating?: number;
}): SavedPrompt[] {
  const library = getPromptLibrary();

  return library.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.platform && p.platform !== filters.platform) return false;
    if (filters.isFavorite && !p.isFavorite) return false;
    if (filters.minRating && (!p.performanceRating || p.performanceRating < filters.minRating)) return false;
    return true;
  });
}

export function getPromptStats(): {
  total: number;
  favorites: number;
  mostUsed: SavedPrompt | null;
  topRated: SavedPrompt | null;
  byCategory: Record<string, number>;
} {
  const library = getPromptLibrary();

  const byCategory = library.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsed = library.reduce((max, p) => 
    p.usageCount > (max?.usageCount || 0) ? p : max, 
    null as SavedPrompt | null
  );

  const topRated = library.reduce((max, p) => 
    (p.performanceRating || 0) > (max?.performanceRating || 0) ? p : max, 
    null as SavedPrompt | null
  );

  return {
    total: library.length,
    favorites: library.filter(p => p.isFavorite).length,
    mostUsed,
    topRated,
    byCategory,
  };
}
