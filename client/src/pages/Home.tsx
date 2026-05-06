import { useState, useMemo, useEffect } from "react";
import { Search, Sparkles, Wand2, Filter, BrainCircuit, Pin, PinOff, Trash2, ChevronDown, ChevronUp, Save, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import PromptCard from "@/components/PromptCard";
import TopicAnalysisCard from "@/components/TopicAnalysisCard";
import PromptRemixButtons from "@/components/PromptRemixButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { mockPrompts, categories, tools, tones } from "@/data/mockPrompts";
import { clearRecentSearchIntents, describeSmartSearch, getRecentSearchIntents, getSmartSearchSuggestions, interpretSearchIntent, saveRecentSearchIntent, togglePinRecentSearchIntent, type SearchIntent, smartSearchPresets, sortPromptsBySmartSearch } from "@/lib/promptSearch";
import { saveToHistory } from "@/lib/promptHistory";
import { savePromptToLibrary } from "@/lib/promptLibrary";
import { analyzeTopicViability, getSuggestedCreators, getTrendingHashtags, getSeasonalInsights, type TopicAnalysis } from "@/lib/topicIntelligence";
import { remixPrompt, type RemixType } from "@/lib/promptRemix";
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

  // New intelligence features
  const [showTopicAnalysis, setShowTopicAnalysis] = useState(false);
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis | null>(null);
  const [selectedPromptForRemix, setSelectedPromptForRemix] = useState<{tier: string, prompt: string} | null>(null);

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
    const tone = selectedTone === "All Tones" ? "Engaging" : selectedTone;

    // Platform-specific intelligence
    const platformSpecs = {
      duration: platform.includes("TikTok") ? "15-60 seconds" : platform.includes("Shorts") ? "15-60 seconds" : platform.includes("Reels") ? "15-90 seconds" : "15-60 seconds",
      aspectRatio: "9:16 vertical",
      keyFeature: platform.includes("TikTok") ? "trending sounds" : platform.includes("Shorts") ? "strong thumbnails" : platform.includes("Reels") ? "visual effects" : "mobile optimization"
    };

    // Generate 3 TRULY DIFFERENT approaches

    // BASIC: Simple, direct approach
    const basic: PromptTier = {
      level: "basic",
      title: "Basic Prompt",
      description: "Quick start for beginners",
      prompt: `Create a ${platformSpecs.duration} ${selectedCat} video about "${topic}" for ${platform}. Make it engaging and optimized for short-form video.`,
    };

    // BETTER: Multiple creative approaches to choose from
    const betterApproaches = [
      // Approach 1: Story-driven
      `I want to create a ${contentType} ${selectedCat} video about "${topic}" for ${platform}.

**Storytelling Approach:**
• Start with a personal story or relatable scenario
• Use the "But then I discovered..." structure
• Show transformation or surprising revelation
• Duration: ${platformSpecs.duration}, Format: ${platformSpecs.aspectRatio}

**Key Elements:**
- Hook: Share a common misconception or problem
- Middle: Your discovery/solution about ${topic}
- End: Result or call-to-action
- Tone: ${tone}
- Platform optimization: ${platformSpecs.keyFeature}

Make it feel authentic and conversational, not scripted.`,

      // Approach 2: List/Tips format
      `Create a ${selectedCat} video for ${platform} about "${topic}".

**Quick Tips Format:**
• "X Things About ${topic} Nobody Tells You"
• Fast-paced, 5-7 second per tip
• Text overlays for each point
• Visual examples for each tip

**Structure:**
- Hook: "If you're into ${topic}, you NEED to know this"
- Deliver 3-5 actionable tips rapid-fire
- Each tip: statement + quick visual proof
- End with: "Save this & follow for more"
- Duration: ${platformSpecs.duration}
- Tone: ${tone} and direct

Use pattern interrupts every 10 seconds to maintain attention.`,

      // Approach 3: Challenge/Experiment
      `Make a ${selectedCat} video testing/trying "${topic}" for ${platform}.

**Challenge Format:**
• "I Tried ${topic} For [X Days/Times]"
• Show the process and unexpected results
• Include failures or struggles (builds authenticity)
• Time-lapse or before/after reveals

**Flow:**
- Open: "Everyone talks about ${topic}, so I tested it"
- Middle: Show 2-3 key moments from the journey  
- Twist: Something surprising you learned
- Close: "Would you try this? Comment below"
- ${platformSpecs.duration}, ${platformSpecs.aspectRatio}
- Tone: ${tone} with genuine reactions

Focus on entertainment value, not just education.`,

      // Approach 4: Myth-busting
      `Create a ${selectedCat} myth-busting video about "${topic}" for ${platform}.

**Myth vs Reality Format:**
• Challenge common beliefs about ${topic}
• "You've been told [wrong thing], but here's the truth"
• Side-by-side comparisons

**Structure:**
- Hook: "Stop doing ${topic} wrong"
- Myth 1: [Common belief] ❌
- Reality 1: [Truth] ✅
- Myth 2: [Another misconception] ❌  
- Reality 2: [Correction] ✅
- CTA: "Share this before it's too late"
- Duration: ${platformSpecs.duration}
- Tone: ${tone} but authoritative

Use controversial angles to drive comments and shares.`
    ];

    // Pick a random approach for variety
    const selectedBetterApproach = betterApproaches[Math.floor(Math.random() * betterApproaches.length)];

    const better: PromptTier = {
      level: "better",
      title: "Better Prompt",
      description: "Creative approach with strategy",
      prompt: selectedBetterApproach,
    };

    // EXPERT: Advanced multi-angle strategy
    const expertPrompt = `Role: You are a viral ${platform} content strategist who has created 100+ videos with 1M+ views each about ${selectedCat} content.

Task: Create a complete content strategy for "${topic}" with MULTIPLE creative angles.

📱 Platform: ${platform} | Duration: ${platformSpecs.duration} | Format: ${platformSpecs.aspectRatio}

🎯 GENERATE 3 DIFFERENT VIDEO CONCEPTS (Choose the best one to produce):

**CONCEPT A: Emotional Storytelling**
- Hook: Personal vulnerability or shocking statement
- Arc: Problem → Struggle → Discovery → Transformation
- Emotion: Make viewers FEEL something about ${topic}
- Visual style: Intimate, close-ups, authentic moments
- Best for: Building deep connection and saves

**CONCEPT B: Entertainment-First Education**  
- Hook: Humor, meme format, or trending audio
- Arc: Setup joke → Deliver value → Callback to joke
- Emotion: Make viewers LAUGH while learning about ${topic}
- Visual style: Fast cuts, on-screen text, visual gags
- Best for: Shares, going viral, broad appeal

**CONCEPT C: Insider/Expert Reveal**
- Hook: "Industry secret" or "What they don't tell you"
- Arc: Controversy → Insider knowledge → Mind-blown moment
- Emotion: Make viewers feel SMART and in-the-know
- Visual style: Direct-to-camera, authority, receipts/proof
- Best for: Authority building, comment debates, niche dominance

🎬 PRODUCTION BLUEPRINT (for chosen concept):

**SECOND-BY-SECOND BREAKDOWN:**
0-3s: [Specific opening visual + exact line to say]
3-8s: [Transition + what to show + what to say]
8-15s: [Pattern interrupt moment - what happens]
15-25s: [Main value delivery - key insight about ${topic}]
25-35s: [Supporting example or proof point]
35-45s: [Build to conclusion or plot twist]
45-${platformSpecs.duration.split('-')[1]}: [CTA + memorable ending frame]

**EDITING STRATEGY:**
- Pacing: [Fast/Medium/Slow] with [X] cuts per 10 seconds
- Music: [Genre/mood] that matches [specific emotion]
- Text overlays: [When to use and what to emphasize]
- Effects: [Specific transitions, zooms, or visual tricks]
- B-roll: [What supplemental footage to show and when]

**HOOK VARIATIONS (A/B test these):**
1. Question format: "[Provocative question about ${topic}]?"
2. Shock value: "I can't believe [surprising fact about ${topic}]"
3. Relatability: "POV: You finally understand ${topic}"
4. Controversy: "Unpopular opinion about ${topic}..."
5. Urgency: "Stop [common mistake with ${topic}] immediately"

**RETENTION MECHANICS:**
- Pattern interrupt at: [specific timestamp] with [what happens]
- Open loop: "[Tease something revealed later]"
- Payoff: "[How to deliver on the promise]"
- Rewatch trigger: "[Hidden detail or easter egg]"

**ALGORITHM HACKS:**
- Target watch time: ${platformSpecs.duration === "15-60 seconds" ? "45+" : "70+"} seconds (${platformSpecs.duration === "15-60 seconds" ? "75%" : "80%"}+ completion)
- Comment bait: "[Question to ask in comments]"
- Save trigger: "[Why this is save-worthy]"
- Share angle: "[What makes this shareable]"
- Series setup: "[How this could be Part 1 of X]"

**CAPTION FORMULA:**
Line 1: [Attention-grabbing hook - 5-8 words]
Line 2-3: [Value proposition - what they'll learn]
Line 4: [Call-to-action - what to do next]
Hashtags: [5-7 strategic tags mixing viral + niche + branded]

**COMPETITOR INTEL:**
Study: [@suggested_creator_1] - [what they do well with ${topic}]
Study: [@suggested_creator_2] - [their unique angle]
Your unique differentiator: [How to stand out from competitors]

**POST-UPLOAD STRATEGY:**
- Thumbnail frame: [Which second provides best preview]
- Best time to post: [Based on ${selectedCat} audience]
- Engagement plan: [How to respond to comments for algorithm boost]
- Follow-up video: [What to create next to build momentum]

**RISK ASSESSMENT:**
- Potential controversy: [What might trigger negative response]
- Platform guidelines: [Anything to watch out for]
- Audience alignment: [Does this fit your brand?]

Tone: ${tone} | Content Strategy: Make it ${contentType} but entertaining
Context: Optimized for ${selectedToolName}, mobile viewing, maximum virality

🎯 SUCCESS METRICS TO TRACK:
- Watch time % (goal: 70%+)
- Engagement rate (goal: 5%+)  
- Share rate (goal: 2%+)
- Follower conversion (goal: 0.5%+)

Choose ONE concept and execute it perfectly. Quality over quantity always wins.`;

    const expert: PromptTier = {
      level: "expert",
      title: "Expert Prompt",
      description: "Multi-concept professional strategy",
      prompt: expertPrompt,
    };

    setTieredPrompts([basic, better, expert]);
    setShowRefinement(false);

    // Generate topic analysis
    const analysis = analyzeTopicViability(topic, selectedCat, platform);
    const seasonality = getSeasonalInsights(topic);
    if (seasonality) {
      analysis.seasonality = seasonality;
    }
    setTopicAnalysis(analysis);
    setShowTopicAnalysis(true);

    toast.success("✨ Generated 3 unique approaches!");
  };

  const handleCopyPrompt = (prompt: string, level: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(level);
    toast.success(`${level} prompt copied!`);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleSaveToLibrary = () => {
    if (tieredPrompts.length === 0) {
      toast.error("Generate prompts first");
      return;
    }

    try {
      const saved = savePromptToLibrary({
        topic: generationTopic,
        basic: tieredPrompts[0].prompt,
        better: tieredPrompts[1].prompt,
        expert: tieredPrompts[2].prompt,
        category: selectedCategory,
        platform: refinementPlatform || "TikTok/YouTube Shorts/Reels",
        tone: selectedTone,
        tags: [],
        isFavorite: false,
      });
      toast.success("💾 Saved to your library!");
    } catch (error) {
      toast.error("Failed to save prompt");
    }
  };

  const handleRemixPrompt = (type: RemixType) => {
    if (!selectedPromptForRemix) {
      toast.error("Select a prompt tier first");
      return;
    }

    const remixed = remixPrompt({
      type,
      currentPrompt: selectedPromptForRemix.prompt,
      tone: selectedTone,
      platform: refinementPlatform || "TikTok/YouTube Shorts/Reels",
      category: selectedCategory,
    });

    // Update the tiered prompts with remixed version
    const tierIndex = tieredPrompts.findIndex(t => t.level === selectedPromptForRemix.tier);
    if (tierIndex !== -1) {
      const updated = [...tieredPrompts];
      updated[tierIndex] = { ...updated[tierIndex], prompt: remixed };
      setTieredPrompts(updated);
      toast.success("✨ Prompt remixed!");
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
        <section className="container py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Clean Headline - ChatGPT style */}
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-tight">
                Better AI prompts for your short-form videos
              </h1>

              {/* Short Subtext */}
              <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl mx-auto font-light leading-relaxed">
                Built for TikTok, YouTube Shorts, and Reels creators. Turn your idea into 3 versions: Basic, Better, and Expert.
              </p>

              {/* One Big Input Box */}
              <div className="max-w-3xl mx-auto mt-12">
                <div className="space-y-8">
                  <Textarea
                    placeholder="Describe your video idea..."
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
                    className="text-lg resize-none overflow-y-auto bg-card/50 border-2 border-border/50 focus:border-primary/60 transition-all rounded-2xl px-6 py-4 shadow-sm focus:shadow-md"
                    style={{ minHeight: '80px', maxHeight: '120px' }}
                  />

                  {/* Beginner-Friendly Options */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Purpose/Category Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground/70">
                        What's your video about?
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 bg-card/50 border border-border/50 rounded-xl focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-base outline-none"
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
                      <label className="text-sm font-medium text-muted-foreground/70">
                        What tone do you want?
                      </label>
                      <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full p-3 bg-card/50 border border-border/50 rounded-xl focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-base outline-none"
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
                      <label className="text-sm font-medium text-muted-foreground/70">
                        Which AI tool will you use?
                      </label>
                      <select
                        value={selectedTool}
                        onChange={(e) => setSelectedTool(e.target.value)}
                        className="w-full p-3 bg-card/50 border border-border/50 rounded-xl focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-base outline-none"
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
                      className="w-full md:w-auto px-12 py-6 text-lg rounded-xl hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
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
                        className="mt-8"
                      >
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold mb-2">✨ Your 3 Prompt Versions</h3>
                          <p className="text-muted-foreground">
                            Choose the one that fits your needs. Copy and paste into your AI tool.
                          </p>
                        </div>

                        {/* Full-width grid layout with controlled max-width */}
                        <div className="w-full max-w-[1600px] mx-auto px-4">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {tieredPrompts.map((tier, idx) => (
                            <motion.div
                              key={tier.level}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`bg-card border-2 rounded-xl p-6 hover:shadow-lg transition-all flex flex-col ${
                                tier.level === "expert" 
                                  ? "border-primary/50 bg-primary/5" 
                                  : "border-border"
                              }`}
                            >
                              {/* Header */}
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  {tier.level === "basic" && <span className="text-2xl">📝</span>}
                                  {tier.level === "better" && <span className="text-2xl">🎯</span>}
                                  {tier.level === "expert" && <span className="text-2xl">🚀</span>}
                                  <h4 className="text-xl font-bold">{tier.title}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">{tier.description}</p>
                              </div>

                              {/* Prompt content - scrollable */}
                              <div className="bg-background/50 rounded-lg p-5 border flex-1 overflow-y-auto min-h-[400px] max-h-[600px] mb-4">
                                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                  {tier.prompt}
                                </pre>
                              </div>

                              {/* Action buttons */}
                              <div className="space-y-2">
                                <Button
                                  onClick={() => handleCopyPrompt(tier.prompt, tier.title)}
                                  variant={copiedPrompt === tier.title ? "default" : "outline"}
                                  size="lg"
                                  className="w-full"
                                >
                                  {copiedPrompt === tier.title ? "✓ Copied!" : "Copy"}
                                </Button>
                                <Button
                                  onClick={() => setSelectedPromptForRemix({ tier: tier.level, prompt: tier.prompt })}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full gap-2"
                                >
                                  <Sparkles className="h-4 w-4" />
                                  Remix
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        </div>

                        {/* Prompt Remix Section */}
                        {selectedPromptForRemix && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border-2 border-purple-500/30 rounded-xl p-6 max-w-[1600px] mx-auto mt-8 px-4"
                          >
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-purple-500" />
                              Remix Your Prompt
                            </h4>
                            <PromptRemixButtons onRemix={handleRemixPrompt} />
                          </motion.div>
                        )}

                        {/* Topic Analysis Section */}
                        {showTopicAnalysis && topicAnalysis && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-[1600px] mx-auto mt-8 px-4"
                          >
                            <div className="mb-4">
                              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <BrainCircuit className="h-6 w-6 text-primary" />
                                Topic Intelligence Report
                              </h3>
                              <p className="text-muted-foreground">
                                AI-powered analysis of your topic's viral potential and market insights
                              </p>
                            </div>
                            <TopicAnalysisCard 
                              analysis={topicAnalysis}
                              creators={getSuggestedCreators(selectedCategory, refinementPlatform || "TikTok")}
                              hashtags={getTrendingHashtags(selectedCategory, refinementPlatform || "TikTok")}
                            />
                          </motion.div>
                        )}

                        {/* Follow-up Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 max-w-[1600px] mx-auto px-4">
                          <Button
                            onClick={handleSaveToLibrary}
                            variant="default"
                            size="lg"
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save to Library
                          </Button>
                          <Button
                            onClick={() => {
                              setGenerationTopic("");
                              setTieredPrompts([]);
                              setRefinementPlatform("");
                              setRefinementContentType("");
                              setShowRefinement(false);
                              setShowTopicAnalysis(false);
                              setTopicAnalysis(null);
                              setSelectedPromptForRemix(null);
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
                              setShowTopicAnalysis(false);
                            }}
                            variant="outline"
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

