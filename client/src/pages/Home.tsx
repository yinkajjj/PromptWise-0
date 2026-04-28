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
        <section className="container py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Clean Headline */}
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Turn your idea into a better AI prompt.
              </h1>

              {/* Short Subtext */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Describe what you want. PromptWise will help you create prompts you can use in ChatGPT, Claude, Gemini, Midjourney, and more.
              </p>

              {/* One Big Input Box */}
              <div className="max-w-2xl mx-auto mt-10">
                <div className="space-y-4">
                  <Textarea
                    placeholder="I want to write a cover letter for an IT support job in Calgary."
                    value={generationTopic}
                    onChange={(e) => {
                      setGenerationTopic(e.target.value);
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      const lineHeight = 24;
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
                    rows={2}
                    className="text-lg resize-none overflow-y-auto bg-card border-2 focus:border-primary transition-colors"
                    style={{ minHeight: '80px', maxHeight: '120px' }}
                  />

                  {/* One Main Button */}
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating} 
                    size="lg"
                    className="w-full md:w-auto px-12 py-6 text-lg hover:scale-105 transition-all"
                  >
                    {isGenerating ? "Generating..." : "Generate Prompt"}
                  </Button>

                  {/* Progress indicator - only show when generating */}
                  {activeJobId && (
                    <div className="bg-card border rounded-lg p-4 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Generating prompts...</span>
                        <span className="text-muted-foreground">{jobProgress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${jobProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-muted-foreground">{jobGeneratedCount}/{jobTotalCount} prompts</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCancelGeneration}
                          className="h-auto py-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          </section>

          {/* Generated Prompts Section */}
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

        {/* Highlights - Featured Prompts */}
        {!activeJobId && generatedPrompts.length === 0 && searchQuery === "" && selectedCategory === "all" && (
          <section className="container py-12">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-semibold">Featured Prompts</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...featuredPrompts, ...trendingPrompts].slice(0, 6).map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} searchQuery={searchQuery} />
              ))}
            </div>
          </section>
        )}

        {/* All Prompts Section - Hidden for clean homepage */}

        {/* CTA Section */}
        {!activeJobId && generatedPrompts.length === 0 && (
          <section className="container py-16">
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8 md:p-12 text-center border">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                Ready to create better prompts?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Enter your idea above and let PromptWise transform it into professional prompts for any AI tool.
              </p>
            </div>
          </section>
        )}

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

