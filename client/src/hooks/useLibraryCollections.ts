import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "promptwise:collections";
const COLLECTIONS_UPDATED_EVENT = "promptwise-collections-updated";
export const FREE_COLLECTION_LIMIT = 1;

export type LibraryCollection = {
  id: string;
  name: string;
  promptIds: string[];
  createdAt: string;
};

const isBrowser = typeof window !== "undefined";

const readCollections = (): LibraryCollection[] => {
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

const writeCollections = (collections: LibraryCollection[]) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  window.dispatchEvent(new Event(COLLECTIONS_UPDATED_EVENT));
};

export const createLibraryCollection = (name: string) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const existingCollections = readCollections();
  if (existingCollections.length >= FREE_COLLECTION_LIMIT) {
    return { ok: false as const, reason: "limit" as const };
  }

  const alreadyExists = existingCollections.some(
    (collection) => collection.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (alreadyExists) {
    return { ok: false as const, reason: "duplicate" as const };
  }

  const collection: LibraryCollection = {
    id: `collection-${Date.now()}`,
    name: trimmedName,
    promptIds: [],
    createdAt: new Date().toISOString(),
  };

  writeCollections([collection, ...existingCollections]);
  return { ok: true as const, collection };
};

export const renameLibraryCollection = (collectionId: string, name: string) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const existingCollections = readCollections();
  const alreadyExists = existingCollections.some(
    (collection) => collection.id !== collectionId && collection.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (alreadyExists) {
    return { ok: false as const, reason: "duplicate" as const };
  }

  const nextCollections = existingCollections.map((collection) => {
    if (collection.id !== collectionId) {
      return collection;
    }

    return {
      ...collection,
      name: trimmedName,
    };
  });

  writeCollections(nextCollections);
  return { ok: true as const };
};

export const deleteLibraryCollection = (collectionId: string) => {
  const nextCollections = readCollections().filter((collection) => collection.id !== collectionId);
  writeCollections(nextCollections);
};

export const assignPromptToCollection = (promptId: string, collectionId: string) => {
  const nextCollections = readCollections().map((collection) => {
    if (collection.id !== collectionId) {
      return collection;
    }

    if (collection.promptIds.includes(promptId)) {
      return collection;
    }

    return {
      ...collection,
      promptIds: [...collection.promptIds, promptId],
    };
  });

  writeCollections(nextCollections);
};

export const removePromptFromCollection = (promptId: string, collectionId: string) => {
  const nextCollections = readCollections().map((collection) => {
    if (collection.id !== collectionId) {
      return collection;
    }

    return {
      ...collection,
      promptIds: collection.promptIds.filter((id) => id !== promptId),
    };
  });

  writeCollections(nextCollections);
};

export function useLibraryCollections() {
  const [collections, setCollections] = useState<LibraryCollection[]>([]);

  useEffect(() => {
    const sync = () => {
      setCollections(readCollections());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(COLLECTIONS_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(COLLECTIONS_UPDATED_EVENT, sync);
    };
  }, []);

  const collectionCount = collections.length;
  const promptAssignments = useMemo(
    () => collections.reduce((count, collection) => count + collection.promptIds.length, 0),
    [collections],
  );

  return {
    collections,
    collectionCount,
    promptAssignments,
  };
}