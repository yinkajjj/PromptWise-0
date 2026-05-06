import { BookOpen, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import PromptCard from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assignPromptToCollection,
  createLibraryCollection,
  deleteLibraryCollection,
  FREE_COLLECTION_LIMIT,
  removePromptFromCollection,
  renameLibraryCollection,
  useLibraryCollections,
} from "@/hooks/useLibraryCollections";
import { FREE_SAVED_PROMPT_LIMIT, useSavedPrompts } from "@/hooks/useSavedPrompts";
import { toast } from "sonner";

export default function Library() {
  const { savedPrompts, savedCount } = useSavedPrompts();
  const { collections, collectionCount } = useLibraryCollections();
  const [newCollectionName, setNewCollectionName] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState("all");
  const [draggedPromptId, setDraggedPromptId] = useState<string | null>(null);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState("");

  const savedPromptLimitLabel = String(FREE_SAVED_PROMPT_LIMIT);
  const collectionLimitLabel = String(FREE_COLLECTION_LIMIT);

  const filteredPrompts = useMemo(() => {
    if (activeCollectionId === "all") {
      return savedPrompts;
    }

    const activeCollection = collections.find((collection) => collection.id === activeCollectionId);
    if (!activeCollection) {
      return savedPrompts;
    }

    return savedPrompts.filter((prompt) => activeCollection.promptIds.includes(prompt.id));
  }, [activeCollectionId, collections, savedPrompts]);

  const handleCreateCollection = () => {
    const result = createLibraryCollection(newCollectionName);
    if (!result.ok) {
      if (result.reason === "limit") {
        toast.error("Collection limit reached for now.");
        return;
      }

      toast.error("Enter a unique collection name");
      return;
    }

    setNewCollectionName("");
    setActiveCollectionId(result.collection.id);
    toast.success(`Created collection: ${result.collection.name}`);
  };

  const handleStartRename = (collectionId: string, collectionName: string) => {
    setEditingCollectionId(collectionId);
    setEditingCollectionName(collectionName);
  };

  const handleRenameCollection = (collectionId: string) => {
    const result = renameLibraryCollection(collectionId, editingCollectionName);
    if (!result.ok) {
      toast.error("Enter a unique collection name");
      return;
    }

    setEditingCollectionId(null);
    setEditingCollectionName("");
    toast.success("Collection renamed");
  };

  const handleDeleteCollection = (collectionId: string, collectionName: string) => {
    deleteLibraryCollection(collectionId);
    if (activeCollectionId === collectionId) {
      setActiveCollectionId("all");
    }

    if (editingCollectionId === collectionId) {
      setEditingCollectionId(null);
      setEditingCollectionName("");
    }

    toast.success(`Deleted collection: ${collectionName}`);
  };

  const handleAssignCollection = (promptId: string, nextCollectionId: string) => {
    collections.forEach((collection) => {
      if (collection.promptIds.includes(promptId)) {
        removePromptFromCollection(promptId, collection.id);
      }
    });

    if (nextCollectionId !== "none") {
      assignPromptToCollection(promptId, nextCollectionId);
      const assignedCollection = collections.find((collection) => collection.id === nextCollectionId);
      if (assignedCollection) {
        toast.success(`Saved to ${assignedCollection.name}`);
      }
      return;
    }

    toast.success("Removed from custom collections");
  };

  const getPromptCollectionId = (promptId: string) => {
    const parentCollection = collections.find((collection) => collection.promptIds.includes(promptId));
    return parentCollection?.id ?? "none";
  };

  const collectionBoard = useMemo(() => {
    const unassignedPrompts = savedPrompts.filter((prompt) => getPromptCollectionId(prompt.id) === "none");

    return [
      {
        id: "none",
        name: "Unassigned",
        prompts: unassignedPrompts,
      },
      ...collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        prompts: savedPrompts.filter((prompt) => collection.promptIds.includes(prompt.id)),
      })),
    ];
  }, [collections, savedPrompts]);

  const handleDropToCollection = (targetCollectionId: string) => {
    if (!draggedPromptId) {
      return;
    }

    handleAssignCollection(draggedPromptId, targetCollectionId);
    setDraggedPromptId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container py-12">
        <section className="mb-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-primary">My Library</p>
            <h1 className="text-4xl font-bold tracking-tight">Your saved workspace</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Keep your favorite prompts, organize repeatable workflows, and return to the best ideas without hunting through the catalog again.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Current limits</div>
                <div className="text-sm text-muted-foreground">
                  Up to 25 saved prompts and 1 personal collection
                </div>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                <span>Saved prompts</span>
                <strong className="text-foreground">{savedCount}/{savedPromptLimitLabel}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                <span>Collections</span>
                <strong className="text-foreground">{collectionCount}/{collectionLimitLabel}</strong>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-2xl font-semibold">Saved prompts</h2>
            <span className="text-sm text-muted-foreground">{savedCount === 0 ? "Save from Browse or Home to build your library" : "Pinned for fast reuse"}</span>
          </div>

          <div className="mb-6 rounded-3xl border border-border bg-card/70 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Collections</h3>
            </div>

            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <Input
                value={newCollectionName}
                onChange={(event) => setNewCollectionName(event.target.value)}
                placeholder="Create a collection, e.g. Launch Copy"
                className="h-11 rounded-xl"
              />
              <Button onClick={handleCreateCollection} className="md:min-w-40">
                Create Collection
              </Button>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              Current limit supports {FREE_COLLECTION_LIMIT} collection.
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeCollectionId === "all" ? "default" : "outline"}
                className="cursor-pointer rounded-full px-3 py-1.5"
                onClick={() => setActiveCollectionId("all")}
              >
                All Saved ({savedCount})
              </Badge>
              {collections.map((collection) => (
                <Badge
                  key={collection.id}
                  variant={activeCollectionId === collection.id ? "default" : "outline"}
                  className="cursor-pointer rounded-full px-3 py-1.5"
                  onClick={() => setActiveCollectionId(collection.id)}
                >
                  {collection.name} ({collection.promptIds.length})
                </Badge>
              ))}
            </div>

            {collections.length > 0 && (
              <div className="mt-5 space-y-3">
                {collections.map((collection) => (
                  <div key={collection.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      {editingCollectionId === collection.id ? (
                        <Input
                          value={editingCollectionName}
                          onChange={(event) => setEditingCollectionName(event.target.value)}
                          className="h-10 rounded-xl"
                          placeholder="Collection name"
                        />
                      ) : (
                        <>
                          <div className="font-medium text-foreground">{collection.name}</div>
                          <div className="text-sm text-muted-foreground">{collection.promptIds.length} prompt{collection.promptIds.length === 1 ? "" : "s"}</div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {editingCollectionId === collection.id ? (
                        <>
                          <Button size="sm" onClick={() => handleRenameCollection(collection.id)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCollectionId(null);
                              setEditingCollectionName("");
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStartRename(collection.id, collection.name)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteCollection(collection.id, collection.name)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {savedCount > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Collection board</h3>
                <span className="text-sm text-muted-foreground">Drag saved prompts between columns to reorganize them</span>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                {collectionBoard.map((column) => (
                  <div
                    key={column.id}
                    className="rounded-3xl border border-border bg-card/70 p-4 shadow-sm transition-colors"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropToCollection(column.id)}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{column.name}</div>
                        <div className="text-sm text-muted-foreground">{column.prompts.length} prompt{column.prompts.length === 1 ? "" : "s"}</div>
                      </div>
                      <Badge variant="outline">{column.prompts.length}</Badge>
                    </div>

                    <div className="space-y-4">
                      {column.prompts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                          Drop a prompt here
                        </div>
                      ) : (
                        column.prompts.map((prompt) => (
                          <div
                            key={`${column.id}-${prompt.id}`}
                            draggable
                            onDragStart={() => setDraggedPromptId(prompt.id)}
                            onDragEnd={() => setDraggedPromptId(null)}
                            className={[
                              "cursor-grab active:cursor-grabbing",
                              draggedPromptId === prompt.id ? "opacity-60" : "opacity-100",
                            ].join(" ")}
                          >
                            <PromptCard prompt={prompt} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {savedCount === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Your library is empty</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Tap the heart icon on any prompt to save it here. Your saved prompts will persist locally in this browser.
              </p>
            </div>
          ) : (
            filteredPrompts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center shadow-sm">
                <h3 className="text-xl font-semibold">No prompts in this collection yet</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Save prompts first, then assign them to a collection using the picker on each card.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {filteredPrompts.map((prompt) => (
                  <div key={prompt.id} className="space-y-3">
                    <div className="rounded-2xl border border-border bg-card/60 p-3">
                      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Collection
                      </div>
                      <Select value={getPromptCollectionId(prompt.id)} onValueChange={(value) => handleAssignCollection(prompt.id, value)}>
                        <SelectTrigger className="h-10 w-full rounded-xl">
                          <SelectValue placeholder="Assign collection" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No collection</SelectItem>
                          {collections.map((collection) => (
                            <SelectItem key={collection.id} value={collection.id}>
                              {collection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <PromptCard prompt={prompt} />
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}