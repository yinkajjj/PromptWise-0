import { BrainCircuit, Pin, PinOff, Search, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import PromptCard from "@/components/PromptCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, mockPrompts, tools } from "@/data/mockPrompts";
import { clearRecentSearchIntents, describeSmartSearch, getRecentSearchIntents, getSmartSearchSuggestions, interpretSearchIntent, saveRecentSearchIntent, togglePinRecentSearchIntent, type SearchIntent, smartSearchPresets, sortPromptsBySmartSearch } from "@/lib/promptSearch";
import { toast } from "sonner";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchIntent, setSearchIntent] = useState<SearchIntent | null>(null);
  const [recentIntents, setRecentIntents] = useState<SearchIntent[]>([]);
  const [showPinnedIntentsOnly, setShowPinnedIntentsOnly] = useState(false);

  useEffect(() => {
    setRecentIntents(getRecentSearchIntents());
  }, []);

  const visiblePrompts = useMemo(() => {
    const matchingPrompts = mockPrompts.filter((prompt) => {
      const matchesCategory = category === "all" || prompt.category === category;

      return matchesCategory;
    });

    return sortPromptsBySmartSearch(matchingPrompts, search);
  }, [category, search]);

  const searchSuggestions = useMemo(() => getSmartSearchSuggestions(mockPrompts, search), [search]);
  const visibleRecentIntents = useMemo(
    () => recentIntents.filter((intent) => !showPinnedIntentsOnly || intent.pinned),
    [recentIntents, showPinnedIntentsOnly],
  );

  const applySuggestion = (value: string) => {
    setSearch(value);
    setSearchFocused(false);
    setActiveSuggestionIndex(-1);
    setSearchIntent(null);
  };

  const applySearchIntent = (intent: SearchIntent) => {
    setSearchIntent(intent);
    setSearch(intent.query);
    setCategory(intent.category);
  };

  const handleReuseSearchIntent = (intent: SearchIntent) => {
    applySearchIntent(intent);
    setRecentIntents(saveRecentSearchIntent(intent));
  };

  const handleTogglePinIntent = (intentId?: string) => {
    if (!intentId) {
      return;
    }

    setRecentIntents(togglePinRecentSearchIntent(intentId));
  };

  const handleClearIntentHistory = () => {
    setRecentIntents(clearRecentSearchIntents());
    toast.success("Cleared recent AI intents");
  };

  const handleInterpretSearch = () => {
    if (!search.trim()) {
      toast.error("Enter a search request first");
      return;
    }

    const interpretation = interpretSearchIntent(search);
    applySearchIntent(interpretation);
    setRecentIntents(saveRecentSearchIntent(interpretation));
    toast.success("AI interpreted your browse request");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container py-12">
        <section className="mb-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-primary">Browse</p>
            <h1 className="text-4xl font-bold tracking-tight">Explore the prompt catalog</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Browse curated prompts across writing, image, business, and video workflows. Filter fast and find reusable ideas without leaving the app.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-border bg-card/70 p-5 shadow-sm sm:grid-cols-3">
            <div>
              <div className="text-2xl font-semibold">{mockPrompts.length}</div>
              <div className="text-sm text-muted-foreground">Total prompts</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{categories.length - 1}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{tools.length - 1}</div>
              <div className="text-sm text-muted-foreground">Supported tools</div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-border bg-card/70 p-5 shadow-sm">
          <div className="mb-4 rounded-[26px] border-[3px] border-primary/25 bg-background/90 p-3 shadow-[0_20px_60px_-32px_rgba(59,130,246,0.55)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Smart Search</div>
                <div className="text-sm text-muted-foreground">{describeSmartSearch(search)}</div>
              </div>
              <Badge variant="outline" className="rounded-full border-2 border-primary/30 px-3 py-1 text-primary">
                AI-ranked
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSearchIntent(null);
                }}
                onFocus={() => {
                  setSearchFocused(true);
                  setActiveSuggestionIndex(-1);
                }}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                onKeyDown={(event) => {
                  if (!searchFocused || searchSuggestions.length === 0) {
                    return;
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveSuggestionIndex((current) => (current + 1) % searchSuggestions.length);
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveSuggestionIndex((current) => (current <= 0 ? searchSuggestions.length - 1 : current - 1));
                  }

                  if (event.key === "Enter" && activeSuggestionIndex >= 0) {
                    event.preventDefault();
                    applySuggestion(searchSuggestions[activeSuggestionIndex].value);
                  }

                  if (event.key === "Escape") {
                    setSearchFocused(false);
                    setActiveSuggestionIndex(-1);
                  }
                }}
                placeholder="Search by title, tags, AI tool, tone, or workflow"
                className="h-14 rounded-2xl border-[3px] border-border/80 bg-card pl-11 text-base font-medium shadow-sm focus-visible:border-primary"
              />
            </div>

            {searchFocused && searchSuggestions.length > 0 && (
              <div className="mt-3 grid gap-2 rounded-2xl border border-border bg-card/80 p-3">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.kind}-${suggestion.value}`}
                    type="button"
                    className={[
                      "flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted",
                      activeSuggestionIndex === index ? "bg-muted" : "",
                    ].join(" ")}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      applySuggestion(suggestion.value);
                    }}
                  >
                    <span className="font-medium text-foreground">{suggestion.label}</span>
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{suggestion.kind}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {searchIntent && (
            <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <BrainCircuit className="h-4 w-4" />
                AI interpretation
              </div>
              <p className="text-sm text-muted-foreground">{searchIntent.explanation}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {searchIntent.chips.map((chip) => (
                  <Badge key={chip} variant="outline" className="border-primary/30 bg-background/80 text-primary">
                    {chip}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {smartSearchPresets.map((preset) => (
              <Badge
                key={preset}
                variant="outline"
                className="cursor-pointer rounded-full border-2 border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
                onClick={() => setSearch(preset)}
              >
                {preset}
              </Badge>
            ))}
            <Button variant="outline" size="sm" className="gap-2 rounded-full border-2" onClick={handleInterpretSearch}>
              <BrainCircuit className="h-4 w-4" />
              Ask AI
            </Button>
          </div>

          {recentIntents.length > 0 && (
            <div className="mb-4 rounded-2xl border border-border/70 bg-card/60 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recent AI Intents</div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={showPinnedIntentsOnly ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setShowPinnedIntentsOnly((current) => !current)}
                  >
                    {showPinnedIntentsOnly ? "Pinned only" : "All intents"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleClearIntentHistory}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Clear
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleRecentIntents.map((intent, index) => (
                  <div key={`${intent.id ?? index}-${intent.query}`} className="flex items-center gap-1 rounded-full border-2 border-border bg-background px-1 py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-full px-3"
                      onClick={() => handleReuseSearchIntent(intent)}
                    >
                      {intent.query}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => handleTogglePinIntent(intent.id)}
                      aria-label={intent.pinned ? "Unpin intent" : "Pin intent"}
                    >
                      {intent.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
              {visibleRecentIntents.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">No pinned intents yet. Pin an intent to keep it in focus.</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <Badge
                key={item.key}
                variant={category === item.key ? "default" : "outline"}
                className="cursor-pointer rounded-full px-3 py-1.5 transition-colors"
                onClick={() => setCategory(item.key)}
              >
                {item.label}
              </Badge>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{visiblePrompts.length} prompts available</h2>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <Sparkles className="h-4 w-4 text-primary" />
              Updated for creators, teams, and prompt tinkerers
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visiblePrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} searchQuery={search} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}