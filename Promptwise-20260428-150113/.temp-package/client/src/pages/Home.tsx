import { useState, useMemo, useEffect } from "react";
import { Search, Sparkles, Wand2, Filter, BrainCircuit, Pin, PinOff, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import PromptCard from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { mockPrompts, categories, tools, tones } from "@/data/mockPrompts";
import { clearRecentSearchIntents, describeSmartSearch, getRecentSearchIntents, getSmartSearchSuggestions, interpretSearchIntent, saveRecentSearchIntent, togglePinRecentSearchIntent, type SearchIntent, smartSearchPresets, sortPromptsBySmartSearch } from "@/lib/promptSearch";
import { saveToHistory } from "@/lib/promptHistory";
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
  const [generationCount, setGenerationCount] = useState(6);
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allPromptsExpanded, setAllPromptsExpanded] = useState(false);

  useEffect(() => {
    setRecentIntents(getRecentSearchIntents());
  }, []);

  const handleGenerate = async () => {
    const topic = generationTopic.trim();
    if (!topic) {
      toast.error("Enter a topic first");
      return;
    }

    // Save to history
    saveToHistory(topic);

    try {
      setIsGenerating(true);
      setGeneratedPrompts([]); // Clear previous results

      // Popular AI tools: ChatGPT, Claude, Midjourney, Runway, Gemini, DALL-E
      const toolsForGeneration = selectedTool === "all" 
        ? ["chatgpt", "claude", "midjourney", "runway", "gemini", "dalle"] 
        : [selectedTool];
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
      toast.success("Generation started! Watch the progress below.");
    } catch (error: any) {
      console.error("Generation error:", error);
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

        // Show preview prompts immediately as they're generated
        if (Array.isArray(data.previewPrompts) && data.previewPrompts.length > 0) {
          setGeneratedPrompts(data.previewPrompts);
        }

        if (data.status === "completed") {
          const limit = Math.min(Number(data.totalCount || generationCount), 300);
          const resultsResponse = await fetch(`/api/prompts/jobs/${activeJobId}/results?offset=0&limit=${limit}`);
          const results = await resultsResponse.json();
          if (resultsResponse.ok && !cancelled) {
            const prompts = Array.isArray(results?.prompts) ? results.prompts : [];
            setGeneratedPrompts(prompts);
            toast.success(`Generated ${Number(data.generatedCount || prompts.length)} prompts`);

            // Scroll to generated prompts section
            setTimeout(() => {
              const generatedSection = document.querySelector('[data-section="generated-prompts"]');
              if (generatedSection) {
                generatedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
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
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Hero Section */}
        <section className="container py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Ideas on tap for{" "}
                <span className="text-gradient">any topic</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
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
                <div className="space-y-3">
                  <Textarea
                    placeholder="Enter your topic or objective, e.g. e-commerce product launches, content marketing strategies..."
                    value={generationTopic}
                    onChange={(e) => {
                      setGenerationTopic(e.target.value);
                      // Auto-resize textarea up to 5 lines
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      const lineHeight = 24; // approximate line height in pixels
                      const maxHeight = lineHeight * 5;
                      const newHeight = Math.min(target.scrollHeight, maxHeight);
                      target.style.height = `${newHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      const isComposing = (e.nativeEvent as any).isComposing;
                      if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    rows={1}
                    className="resize-none overflow-y-auto"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleGenerate} 
                      disabled={isGenerating} 
                      size="lg"
                      className="hover:scale-105 transition-all"
                    >
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>
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
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all"
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
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all"
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
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all"
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

        {/* Generated Prompts Section - MOVED TO TOP */}
        {(activeJobId || generatedPrompts.length > 0) && (
          <section className="container py-16" data-section="generated-prompts">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold">
                  {activeJobId ? "Generating Prompts..." : `Generated Prompts (${generatedPrompts.length})`}
                </h3>
                {activeJobId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {jobGeneratedCount}/{jobTotalCount} prompts ({jobProgress}%)
                  </p>
                )}
              </div>
            </div>

            {generatedPrompts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            ) : (
              <div className="text-center py-12">
                <div className="animate-pulse space-y-4">
                  <div className="text-4xl">⏳</div>
                  <p className="text-muted-foreground">Generating your prompts...</p>
                  <p className="text-sm text-muted-foreground">This may take a few moments</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Highlights - Featured & Trending - NOW IN MIDDLE */}
        {searchQuery === "" && selectedCategory === "all" && (
          <section className="container py-16">
            <div className="flex items-center gap-3 mb-8 group">
              <Sparkles className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold">Highlights</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...featuredPrompts, ...trendingPrompts].slice(0, 6).map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} searchQuery={searchQuery} />
              ))}
            </div>
          </section>
        )}

        {/* All Prompts Section - NOW AT BOTTOM, COLLAPSED BY DEFAULT */}
        <section className="container py-16">
          <div 
            className="flex items-center justify-between mb-8 cursor-pointer group"
            onClick={() => setAllPromptsExpanded(!allPromptsExpanded)}
            title="Click to expand/collapse"
          >
            <h3 className="text-2xl font-semibold">
              {searchQuery || selectedCategory !== "all" || selectedTool !== "all" || selectedTone !== "All Tones"
                ? `Search Results (${filteredPrompts.length})`
                : "All Prompts"}
            </h3>
            <Button 
              variant="ghost" 
              size="icon"
              className="opacity-60 group-hover:opacity-100 transition-opacity"
              title={allPromptsExpanded ? "Click to collapse" : "Click to expand"}
            >
              {allPromptsExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>

          <AnimatePresence>
            {allPromptsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
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
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    <AnimatePresence>
                      {filteredPrompts.map((prompt) => (
                        <PromptCard key={prompt.id} prompt={prompt} searchQuery={searchQuery} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* CTA Section */}
        <section className="container py-16">
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12 text-center border border-border">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">
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

        {/* Footer */}
        <footer className="border-t py-8 mt-16">
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
      </main>
    </div>
  );
}

