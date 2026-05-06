import { useState, useMemo, useEffect } from "react";
import { Search, Sparkles, Wand2, Filter, BrainCircuit, Pin, PinOff, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import PromptCard from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockPrompts, categories, tools, tones } from "@/data/mockPrompts";
import { clearRecentSearchIntents, describeSmartSearch, getRecentSearchIntents, getSmartSearchSuggestions, interpretSearchIntent, saveRecentSearchIntent, togglePinRecentSearchIntent, type SearchIntent, smartSearchPresets, sortPromptsBySmartSearch } from "@/lib/promptSearch";
import { toast } from "sonner";

type GeneratedPrompt = {
  title: string;
  description: string;
  prompt: string;
  category: string;
  tool: string;
  tone: string;
  tags: string[];
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [generationTopic, setGenerationTopic] = useState("");
  const [generationCount, setGenerationCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobGeneratedCount, setJobGeneratedCount] = useState(0);
  const [jobTotalCount, setJobTotalCount] = useState(0);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTool, setSelectedTool] = useState("all");
  const [selectedTone, setSelectedTone] = useState("All Tones");
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchIntent, setSearchIntent] = useState<SearchIntent | null>(null);
  const [recentIntents, setRecentIntents] = useState<SearchIntent[]>([]);
  const [showPinnedIntentsOnly, setShowPinnedIntentsOnly] = useState(false);

  useEffect(() => {
    setRecentIntents(getRecentSearchIntents());
  }, []);

  const handleGenerate = async () => {
    const topic = generationTopic.trim();
    if (!topic) {
      toast.error("Enter a topic first");
      return;
    }

    try {
      setIsGenerating(true);

      const toolsForGeneration = selectedTool === "all" ? ["chatgpt", "claude", "midjourney", "runway"] : [selectedTool];
      const tonesForGeneration = selectedTone === "All Tones"
        ? ["professional", "conversational", "creative"]
        : [selectedTone.toLowerCase()];

      const response = await fetch("/api/prompts/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          count: generationCount,
          chunkSize: Math.min(generationCount, 50),
          tools: toolsForGeneration,
          tones: tonesForGeneration,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || data?.error || "Generation failed");
      }

      setGeneratedPrompts([]);
      setActiveJobId(String(data.jobId));
      setJobStatus(String(data.status || "queued"));
      setJobProgress(0);
      setJobGeneratedCount(0);
      setJobTotalCount(Number(data.totalCount || generationCount));
      toast.success("Generation job started");
    } catch (error: any) {
      toast.error(String(error?.message || "Failed to generate prompts"));
    } finally {
      // Generation button is released after job submission; progress is tracked by polling.
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = async () => {
    if (!activeJobId) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts/jobs/${activeJobId}/cancel`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to cancel job");
      }

      toast.success("Generation job cancelled");
      setJobStatus("cancelled");
      setActiveJobId(null);
    } catch (error: any) {
      toast.error(String(error?.message || "Failed to cancel generation job"));
    }
  };

  useEffect(() => {
    if (!activeJobId) {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/prompts/jobs/${activeJobId}`);
        const data = await response.json();
        if (!response.ok || cancelled) {
          return;
        }

        setJobStatus(String(data.status || "queued"));
        setJobProgress(Number(data.progress || 0));
        setJobGeneratedCount(Number(data.generatedCount || 0));
        setJobTotalCount(Number(data.totalCount || 0));

        if (data.status === "completed") {
          const limit = Math.min(Number(data.totalCount || generationCount), 300);
          const resultsResponse = await fetch(`/api/prompts/jobs/${activeJobId}/results?offset=0&limit=${limit}`);
          const results = await resultsResponse.json();
          if (resultsResponse.ok && !cancelled) {
            const prompts = Array.isArray(results?.prompts) ? results.prompts : [];
            setGeneratedPrompts(prompts);
            toast.success(`Generated ${Number(data.generatedCount || prompts.length)} prompts`);
          }
          setActiveJobId(null);
        }

        if (data.status === "failed") {
          toast.error(String(data.error || "Generation job failed"));
          setActiveJobId(null);
        }
      } catch {
        // Ignore transient polling failures; next interval will retry.
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeJobId, generationCount]);

  // Filter prompts based on selections
  const filteredPrompts = useMemo(() => {
    const matchingPrompts = mockPrompts.filter((prompt) => {
      const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
      const matchesTool = selectedTool === "all" || prompt.tool === selectedTool;
      const matchesTone = selectedTone === "All Tones" || prompt.tone === selectedTone.toLowerCase();

      return matchesCategory && matchesTool && matchesTone;
    });

    return sortPromptsBySmartSearch(matchingPrompts, searchQuery);
  }, [searchQuery, selectedCategory, selectedTool, selectedTone]);

  const featuredPrompts = mockPrompts.filter(p => p.isFeatured).slice(0, 3);
  const trendingPrompts = mockPrompts.filter(p => p.isTrending).slice(0, 3);
  const searchSuggestions = useMemo(() => getSmartSearchSuggestions(mockPrompts, searchQuery), [searchQuery]);
  const visibleRecentIntents = useMemo(
    () => recentIntents.filter((intent) => !showPinnedIntentsOnly || intent.pinned),
    [recentIntents, showPinnedIntentsOnly],
  );

  const applySuggestion = (value: string) => {
    setSearchQuery(value);
    setSearchFocused(false);
    setActiveSuggestionIndex(-1);
    setSearchIntent(null);
  };

  const applySearchIntent = (intent: SearchIntent) => {
    setSearchIntent(intent);
    setSearchQuery(intent.query);
    setSelectedCategory(intent.category);
    setSelectedTool(intent.tool);
    setSelectedTone(intent.tone);
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
    if (!searchQuery.trim()) {
      toast.error("Enter a search request first");
      return;
    }

    const interpretation = interpretSearchIntent(searchQuery);
    applySearchIntent(interpretation);
    setRecentIntents(saveRecentSearchIntent(interpretation));
    toast.success("AI interpreted your search request");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Ideas on tap for{" "}
                <span className="text-gradient">any topic</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Enter a simple topic. Get polished, ready-to-use prompts for ChatGPT, Midjourney, Claude, and more.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="max-w-3xl mx-auto mb-6"
            >
              <div className="bg-card border rounded-2xl p-4 md:p-5 text-left">
                <h3 className="text-lg font-semibold mb-3">Generate Real Prompts</h3>
                <div className="grid md:grid-cols-[1fr_120px_160px] gap-3">
                  <Input
                    placeholder="Topic or objective, e.g. e-commerce product launches"
                    value={generationTopic}
                    onChange={(e) => setGenerationTopic(e.target.value)}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={generationCount}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (Number.isFinite(next)) {
                        setGenerationCount(Math.max(1, Math.min(200, next)));
                      }
                    }}
                  />
                  <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This submits a background generation job and streams progress until completion.
                </p>
                {activeJobId && (
                  <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs text-primary">
                      Job {jobStatus}: {jobGeneratedCount}/{jobTotalCount} prompts ({jobProgress}%)
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelGeneration}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="rounded-[30px] border-[3px] border-primary/30 bg-card/85 p-3 shadow-[0_24px_70px_-38px_rgba(99,102,241,0.7)]">
                <div className="mb-3 flex items-center justify-between gap-3 text-left">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">PromptWise Smart Search</div>
                    <div className="text-sm text-muted-foreground">{describeSmartSearch(searchQuery)}</div>
                  </div>
                  <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary shadow-none">
                    Intent-aware
                  </Badge>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    type="text"
                    placeholder="Search prompts by topic, category, keyword, AI tool, or tone..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
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
                    className="pl-12 pr-4 h-14 text-lg rounded-2xl border-[3px] border-border/80 bg-background font-medium focus-visible:border-primary"
                  />
                </div>

                {searchFocused && searchSuggestions.length > 0 && (
                  <div className="mt-3 grid gap-2 rounded-2xl border border-border bg-background/90 p-3 text-left">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.kind}-${suggestion.value}`}
                        type="button"
                        className={[
                          "flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-muted",
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
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left">
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

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {smartSearchPresets.map((preset) => (
                  <Badge
                    key={preset}
                    variant="outline"
                    className="cursor-pointer rounded-full border-2 border-border bg-card/70 px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
                    onClick={() => setSearchQuery(preset)}
                  >
                    {preset}
                  </Badge>
                ))}
              </div>

              {recentIntents.length > 0 && (
                <div className="mt-3 rounded-2xl border border-border/70 bg-card/60 p-3">
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
                  <div className="flex flex-wrap justify-center gap-2">
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
                    <p className="mt-2 text-center text-xs text-muted-foreground">No pinned intents yet. Pin an intent to keep it in focus.</p>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInterpretSearch}
                  className="gap-2"
                >
                  <BrainCircuit className="h-4 w-4" />
                  Ask AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const randomPrompt = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
                    setSearchQuery(randomPrompt.category);
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  Random
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-4xl mx-auto mt-8 overflow-hidden"
              >
                <div className="bg-card border rounded-2xl p-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Badge
                          key={cat.key}
                          variant={selectedCategory === cat.key ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => setSelectedCategory(cat.key)}
                        >
                          {cat.label} ({cat.count})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tools */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">AI Tool</h3>
                    <div className="flex flex-wrap gap-2">
                      {tools.map((tool) => (
                        <Badge
                          key={tool.key}
                          variant={selectedTool === tool.key ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => setSelectedTool(tool.key)}
                        >
                          {tool.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tones */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Tone</h3>
                    <div className="flex flex-wrap gap-2">
                      {tones.map((tone) => (
                        <Badge
                          key={tone}
                          variant={selectedTone === tone ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => setSelectedTone(tone)}
                        >
                          {tone}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedTool("all");
                        setSelectedTone("All Tones");
                        setSearchQuery("");
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Featured Prompts */}
        {searchQuery === "" && selectedCategory === "all" && (
          <section className="container py-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Featured Prompts</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} searchQuery={searchQuery} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Prompts */}
        {searchQuery === "" && selectedCategory === "all" && (
          <section className="container py-8">
            <div className="flex items-center gap-3 mb-6">
              <Wand2 className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Trending Now</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} searchQuery={searchQuery} />
              ))}
            </div>
          </section>
        )}

        {/* All Prompts / Search Results */}
        {generatedPrompts.length > 0 && (
          <section className="container py-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Generated Prompts ({generatedPrompts.length})</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedPrompts.map((prompt, idx) => (
                <PromptCard
                  key={`${prompt.title}-${idx}`}
                  prompt={{
                    id: `generated-${idx}`,
                    title: prompt.title,
                    description: prompt.description,
                    prompt: prompt.prompt,
                    category: prompt.category,
                    tool: prompt.tool,
                    tone: prompt.tone,
                    tags: prompt.tags,
                    copies: 0,
                    rating: 5,
                    dateAdded: new Date().toISOString().slice(0, 10),
                  }}
                />
              ))}
            </div>
          </section>
        )}

        <section className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">
              {searchQuery || selectedCategory !== "all" || selectedTool !== "all" || selectedTone !== "All Tones"
                ? `Search Results (${filteredPrompts.length})`
                : "All Prompts"}
            </h3>
          </div>

          {filteredPrompts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedTool("all");
                  setSelectedTone("All Tones");
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} searchQuery={searchQuery} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* CTA Section */}
        <section className="container py-16">
          <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to supercharge your AI workflow?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who use PromptWise to unlock the full potential of AI tools.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 text-lg px-8">
              Start Exploring
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 PromptWise. Built with ❤️ for AI creators.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Docs</a>
              <a href="#" className="hover:text-primary transition-colors">Community</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

