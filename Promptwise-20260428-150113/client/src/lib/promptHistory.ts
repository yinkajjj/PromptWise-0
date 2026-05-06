interface PromptHistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

const HISTORY_KEY = "promptwise:history";
const MAX_HISTORY = 100;

export function saveToHistory(text: string): void {
  if (!text.trim()) return;

  const history = getHistory();
  const newItem: PromptHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: text.trim(),
    timestamp: Date.now(),
  };

  // Add to beginning and limit size
  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY);
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("promptHistoryUpdated"));
  } catch (e) {
    console.error("Failed to save history:", e);
  }
}

export function getHistory(): PromptHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load history:", e);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event("promptHistoryUpdated"));
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
}

export function deleteHistoryItem(id: string): void {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("promptHistoryUpdated"));
  } catch (e) {
    console.error("Failed to delete history item:", e);
  }
}
