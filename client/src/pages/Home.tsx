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

type PromptTier = {
  level: "basic" | "better" | "expert";
  title: string;
  prompt: string;
  description: string;
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

  // New state for intelligent flow
  const [showRefinement, setShowRefinement] = useState(false);
  const [tieredPrompts, setTieredPrompts] = useState<PromptTier[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [refinementPlatform, setRefinementPlatform] = useState("");
  const [refinementContentType, setRefinementContentType] = useState("");

  useEffect(() => {
    setRecentIntents(getRecentSearchIntents());
  }, []);

  const handleGenerate = async () => {
    const topic = generationTopic.trim();
    if (!topic) {
      toast.error("Enter a topic first");
      return;
    }

    // Show refinement questions first (intelligent flow)
    if (!showRefinement && tieredPrompts.length === 0) {
      setShowRefinement(true);
      return;
    }

    // If refinement is shown, generate 3-tier prompts
    if (showRefinement) {
      generate3TierPrompts(topic);
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

  const generate3TierPrompts = (topic: string) => {
    saveToHistory(topic);

    const platform = refinementPlatform || "TikTok/YouTube Shorts/Reels";
    const contentType = refinementContentType || "educational";
    const selectedCat = selectedCategory === "all" ? "general content" : selectedCategory;
    const selectedToolName = selectedTool === "all" ? "AI tools" : selectedTool;

    // Generate 3 tiers of prompts
    const basic: PromptTier = {
      level: "basic",
      title: "Basic Prompt",
      description: "Simple and easy to use",
      prompt: `Create ${selectedCat} content about: ${topic}`,
    };

    const better: PromptTier = {
      level: "better",
      title: "Better Prompt",
      description: "More detailed with context",
      prompt: `I need to create ${contentType} ${selectedCat} for ${platform}. Topic: ${topic}. Please provide engaging ideas that work well for short-form video format, with hooks to grab attention in the first 3 seconds. Include: suggested video structure, key points to cover, and a strong call-to-action.`,
    };

    const expert: PromptTier = {
      level: "expert",
      title: "Expert Prompt",
      description: "Comprehensive with role, task, format, and tone",
      prompt: `Role: You are an expert short-form video content strategist specializing in ${platform} with deep knowledge of viral trends and audience psychology.\n\nTask: Create a detailed content plan for ${contentType} ${selectedCat} about "${topic}".\n\nFormat your response with:\n1. Hook (first 3 seconds) - What will stop the scroll?\n2. Core Message - The main value or insight\n3. Visual Suggestions - What should viewers see?\n4. Script Structure - Timing breakdown for 15-60 second video\n5. Call-to-Action - How to drive engagement\n6. Hashtag Strategy - 5-7 relevant tags\n\nTone: ${selectedTone === "All Tones" ? "Engaging and authentic" : selectedTone}\n\nContext: This is for ${selectedToolName}. The content should be optimized for mobile viewing, designed to maximize watch time, and encourage comments/shares. Focus on delivering value quickly while maintaining entertainment.`,
    };

    setTieredPrompts([basic, better, expert]);
    setShowRefinement(false);
    toast.success("✨ Generated 3 prompt versions for you!");
  };

  const handleCopyPrompt = (prompt: string, level: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(level);
    toast.success(`${level} prompt copied!`);
    setTimeout(() => setCopiedPrompt(null), 2000);
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
                Better AI prompts for your short-form videos.
              </h1>

              {/* Short Subtext */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                The only prompt tool built specifically for TikTok, YouTube Shorts, and Reels creators. Turn your idea into 3 versions: Basic, Better, and Expert.
              </p>

              {/* One Big Input Box */}
              <div className="max-w-2xl mx-auto mt-10">
                <div className="space-y-6">
                  <Textarea
                    placeholder="I want to make videos about AI tools for beginners..."
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

                  {/* Beginner-Friendly Options */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Purpose/Category Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        What's your video about?
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 bg-card border-2 rounded-lg focus:border-primary transition-colors text-base"
                      >
                        <option value="all">Any topic</option>
                        <option value="tutorial">Tutorial / How-to</option>
                        <option value="education">Educational content</option>
                        <option value="entertainment">Entertainment / Comedy</option>
                        <option value="lifestyle">Lifestyle / Daily vlog</option>
                        <option value="product-review">Product review</option>
                        <option value="storytelling">Storytelling</option>
                        <option value="motivation">Motivation / Inspiration</option>
                        <option value="challenge">Challenge / Trend</option>
                        <option value="behind-the-scenes">Behind the scenes</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Tone Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        What tone do you want?
                      </label>
                      <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full p-3 bg-card border-2 rounded-lg focus:border-primary transition-colors text-base"
                      >
                        <option value="All Tones">Any tone</option>
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Simple">Simple</option>
                        <option value="Confident">Confident</option>
                        <option value="Creative">Creative</option>
                      </select>
                    </div>

                    {/* AI Tool Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Which AI tool will you use?
                      </label>
                      <select
                        value={selectedTool}
                        onChange={(e) => setSelectedTool(e.target.value)}
                        className="w-full p-3 bg-card border-2 rounded-lg focus:border-primary transition-colors text-base"
                      >
                        <option value="all">All tools</option>
                        <option value="chatgpt">ChatGPT</option>
                        <option value="claude">Claude</option>
                        <option value="gemini">Gemini</option>
                        <option value="copilot">Copilot</option>
                        <option value="midjourney">Midjourney</option>
                        <option value="dalle">DALL-E</option>
                        <option value="not-sure">Not sure</option>
                      </select>
                    </div>
                  </div>

                  {/* One Main Button */}
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleGenerate} 
                      disabled={isGenerating} 
                      size="lg"
                      className="w-full md:w-auto px-12 py-6 text-lg hover:scale-105 transition-all"
                    >
                      {isGenerating ? "Generating..." : showRefinement ? "Generate My Prompts" : "Generate Prompt"}
                    </Button>
                  </div>

                  {/* Refinement Questions - Show after first click */}
                  <AnimatePresence>
                    {showRefinement && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4"
                      >
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold mb-1">🎯 Let's refine this!</h3>
                          <p className="text-sm text-muted-foreground">
                            Answer these to get better prompts
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              What platform are you targeting?
                            </label>
                            <select
                              value={refinementPlatform}
                              onChange={(e) => setRefinementPlatform(e.target.value)}
                              className="w-full p-3 bg-background border-2 rounded-lg focus:border-primary transition-colors"
                            >
                              <option value="">TikTok/YouTube Shorts/Reels (default)</option>
                              <option value="TikTok">TikTok only</option>
                              <option value="YouTube Shorts">YouTube Shorts only</option>
                              <option value="Instagram Reels">Instagram Reels only</option>
                              <option value="All short-form platforms">All platforms</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              What type of content do you prefer?
                            </label>
                            <select
                              value={refinementContentType}
                              onChange={(e) => setRefinementContentType(e.target.value)}
                              className="w-full p-3 bg-background border-2 rounded-lg focus:border-primary transition-colors"
                            >
                              <option value="educational">Educational</option>
                              <option value="entertaining">Entertaining / Funny</option>
                              <option value="storytelling">Storytelling</option>
                              <option value="tutorial">Tutorial / How-to</option>
                              <option value="review">Review / Opinion</option>
                              <option value="motivational">Motivational</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                          💡 These details help us create prompts optimized for short-form video
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

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

                  {/* 3-Tier Prompt Cards Display */}
                  <AnimatePresence>
                    {tieredPrompts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 mt-8"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold mb-2">✨ Your 3 Prompt Versions</h3>
                          <p className="text-muted-foreground">
                            Choose the one that fits your needs. Copy and paste into your AI tool.
                          </p>
                        </div>

                        <div className="grid gap-6 max-w-4xl mx-auto">
                          {tieredPrompts.map((tier, idx) => (
                            <motion.div
                              key={tier.level}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.15 }}
                              className={`bg-card border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
                                tier.level === "expert" 
                                  ? "border-primary/50 bg-primary/5" 
                                  : "border-border"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    {tier.level === "basic" && <span className="text-2xl">📝</span>}
                                    {tier.level === "better" && <span className="text-2xl">🎯</span>}
                                    {tier.level === "expert" && <span className="text-2xl">🚀</span>}
                                    <h4 className="text-xl font-bold">{tier.title}</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                                </div>
                                <Button
                                  onClick={() => handleCopyPrompt(tier.prompt, tier.title)}
                                  variant={copiedPrompt === tier.title ? "default" : "outline"}
                                  size="sm"
                                  className="shrink-0"
                                >
                                  {copiedPrompt === tier.title ? "✓ Copied!" : "Copy"}
                                </Button>
                              </div>

                              <div className="bg-background/50 rounded-lg p-4 border">
                                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                  {tier.prompt}
                                </pre>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Follow-up Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                          <Button
                            onClick={() => {
                              setGenerationTopic("");
                              setTieredPrompts([]);
                              setRefinementPlatform("");
                              setRefinementContentType("");
                              setShowRefinement(false);
                            }}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                          >
                            <Wand2 className="h-4 w-4" />
                            Generate New Prompt
                          </Button>
                          <Button
                            onClick={() => {
                              setTieredPrompts([]);
                              setShowRefinement(true);
                            }}
                            variant="default"
                            size="lg"
                            className="gap-2"
                          >
                            <BrainCircuit className="h-4 w-4" />
                            Refine & Regenerate
                          </Button>
                        </div>

                        {/* Helpful tip */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center max-w-2xl mx-auto">
                          <p className="text-sm">
                            <strong>💡 Pro Tip:</strong> The Expert Prompt works best for detailed, high-quality content. 
                            The Basic Prompt is great for quick ideas. Try different versions to see what your AI tool produces!
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

