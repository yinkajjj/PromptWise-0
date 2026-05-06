import { useEffect, useState } from "react";
import type { Prompt } from "@/data/mockPrompts";

const STORAGE_KEY = "promptwise:saved-prompts";
const LIBRARY_UPDATED_EVENT = "promptwise-library-updated";
export const FREE_SAVED_PROMPT_LIMIT = 25;

const isBrowser = typeof window !== "undefined";

const readSavedPrompts = (): Prompt[] => {
  if (!isBrowser) {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSavedPrompts = (prompts: Prompt[]) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  window.dispatchEvent(new Event(LIBRARY_UPDATED_EVENT));
};

export const isPromptSaved = (promptId: string) => {
  return readSavedPrompts().some((prompt) => prompt.id === promptId);
};

export const savePrompt = (prompt: Prompt) => {
  const existingPrompts = readSavedPrompts();
  if (existingPrompts.some((item) => item.id === prompt.id)) {
    return { ok: true as const, reason: "already-saved" as const };
  }

  if (existingPrompts.length >= FREE_SAVED_PROMPT_LIMIT) {
    return { ok: false as const, reason: "limit" as const };
  }

  writeSavedPrompts([prompt, ...existingPrompts]);
  return { ok: true as const, reason: "saved" as const };
};

export const removeSavedPrompt = (promptId: string) => {
  const nextPrompts = readSavedPrompts().filter((prompt) => prompt.id !== promptId);
  writeSavedPrompts(nextPrompts);
};

export function useSavedPrompts() {
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const sync = () => {
      setSavedPrompts(readSavedPrompts());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(LIBRARY_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(LIBRARY_UPDATED_EVENT, sync);
    };
  }, []);

  return {
    savedPrompts,
    savedCount: savedPrompts.length,
  };
}