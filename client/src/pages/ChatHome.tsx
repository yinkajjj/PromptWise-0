import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Trash2, RotateCcw, Copy, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCases } from "@/lib/useCases";
import { generateUniversalPrompt } from "@/lib/universalPromptGenerator";
import { researchTopic, enrichPromptWithContext } from "@/lib/topicResearcher";
import { toast } from "sonner";

// Chat message types
type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  prompts?: GeneratedPrompt[];
};

type GeneratedPrompt = {
  level: "better" | "expert";
  title: string;
  description: string;
  prompt: string;
};

// Conversation memory
type ConversationMemory = {
  topics: string[];
  useCases: string[];
  preferences: {
    tone?: string;
    category?: string;
    complexity?: string;
  };
  lastGeneratedAt?: Date;
};

export default function ChatHome() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [memory, setMemory] = useState<ConversationMemory>({
    topics: [],
    useCases: [],
    preferences: {},
  });
  const [selectedUseCase, setSelectedUseCase] = useState<string>("video-content");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load memory from localStorage on mount
  useEffect(() => {
    const savedMemory = localStorage.getItem("promptwise_memory");
    const savedMessages = localStorage.getItem("promptwise_messages");

    if (savedMemory) {
      setMemory(JSON.parse(savedMemory));
    }

    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } else {
      // Welcome message
      setMessages([{
        id: "welcome",
        role: "system",
        content: "👋 Hi! I'm PromptWise. Tell me what you'd like to create and I'll generate intelligent, research-powered prompts for you.\n\nJust describe your idea in natural language - I'll figure out the rest!",
        timestamp: new Date(),
      }]);
    }
  }, []);

  // Save to localStorage whenever memory or messages change
  useEffect(() => {
    localStorage.setItem("promptwise_memory", JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem("promptwise_messages", JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Smart system prompt builder
  const buildSystemContext = (): string => {
    let context = "You are PromptWise, an AI prompt generation assistant.\n\n";

    if (memory.topics.length > 0) {
      context += `Previous topics discussed: ${memory.topics.slice(-3).join(", ")}\n`;
    }

    if (memory.preferences.tone) {
      context += `User prefers ${memory.preferences.tone} tone.\n`;
    }

    if (memory.useCases.length > 0) {
      const commonUseCase = memory.useCases[memory.useCases.length - 1];
      context += `Recent use case: ${commonUseCase}\n`;
    }

    return context;
  };

  // Parse user intent
  const parseUserIntent = (userInput: string): {
    topic: string;
    useCase: string;
    tone: string;
    requestType: "generate" | "refine" | "question";
  } => {
    const lowerInput = userInput.toLowerCase();

    // Detect request type
    let requestType: "generate" | "refine" | "question" = "generate";
    if (lowerInput.includes("better") || lowerInput.includes("improve") || lowerInput.includes("refine")) {
      requestType = "refine";
    } else if (lowerInput.includes("?") || lowerInput.includes("how") || lowerInput.includes("what")) {
      requestType = "question";
    }

    // Detect use case
    let detectedUseCase = selectedUseCase;
    if (lowerInput.includes("video") || lowerInput.includes("youtube") || lowerInput.includes("tiktok")) {
      detectedUseCase = "video-content";
    } else if (lowerInput.includes("resume") || lowerInput.includes("cv")) {
      detectedUseCase = "resume-cv";
    } else if (lowerInput.includes("research") || lowerInput.includes("thesis") || lowerInput.includes("paper")) {
      detectedUseCase = "academic-research";
    } else if (lowerInput.includes("business") || lowerInput.includes("report") || lowerInput.includes("proposal")) {
      detectedUseCase = "business-writing";
    } else if (lowerInput.includes("story") || lowerInput.includes("novel") || lowerInput.includes("creative")) {
      detectedUseCase = "creative-writing";
    } else if (lowerInput.includes("marketing") || lowerInput.includes("ad") || lowerInput.includes("campaign")) {
      detectedUseCase = "marketing-content";
    }

    // Detect tone
    let tone = "Professional";
    if (lowerInput.includes("casual") || lowerInput.includes("friendly")) tone = "Casual";
    if (lowerInput.includes("formal")) tone = "Formal";
    if (lowerInput.includes("humorous") || lowerInput.includes("funny")) tone = "Humorous";
    if (lowerInput.includes("inspiring") || lowerInput.includes("motivational")) tone = "Inspiring";

    return {
      topic: userInput,
      useCase: detectedUseCase,
      tone,
      requestType,
    };
  };

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage || isGenerating) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      // Parse intent
      const intent = parseUserIntent(userMessage);

      // Update memory
      setMemory(prev => ({
        topics: [...prev.topics, intent.topic].slice(-10), // Keep last 10
        useCases: [...prev.useCases, intent.useCase].slice(-5),
        preferences: {
          ...prev.preferences,
          tone: intent.tone,
        },
        lastGeneratedAt: new Date(),
      }));

      // If question, provide guidance
      if (intent.requestType === "question") {
        setTimeout(() => {
          const guidanceMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `I'd be happy to help! To generate the best prompts for you, please describe:\n\n• What you want to create (e.g., "a YouTube video about climate change")\n• Any specific requirements or preferences\n• Target audience or platform\n\nThen I'll generate intelligent prompts tailored to your needs! 🚀`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, guidanceMessage]);
          setIsGenerating(false);
        }, 500);
        return;
      }

      // Generate prompts
      toast.info("🔍 Researching your topic...");

      // Research topic
      const topicContext = researchTopic(intent.topic, intent.useCase);

      // Generate Better and Expert prompts
      const betterPrompt = generateUniversalPrompt(intent.useCase, "better", intent.topic, "General", intent.tone);
      const expertPrompt = generateUniversalPrompt(intent.useCase, "expert", intent.topic, "General", intent.tone);

      // Enrich with context
      const enrichedBetter = enrichPromptWithContext(
        typeof betterPrompt === "string" ? betterPrompt : betterPrompt[0],
        topicContext,
        "better"
      );

      const enrichedExpert = enrichPromptWithContext(
        typeof expertPrompt === "string" ? expertPrompt : expertPrompt[0],
        topicContext,
        "expert"
      );

      const generatedPrompts: GeneratedPrompt[] = [
        {
          level: "better",
          title: "Strategic Prompt",
          description: "Context-aware approach",
          prompt: enrichedBetter,
        },
        {
          level: "expert",
          title: "Expert Prompt",
          description: "Research-powered strategy",
          prompt: enrichedExpert,
        },
      ];

      // Add assistant message with prompts
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `✨ I've generated 2 intelligent prompts for your ${useCases.find(uc => uc.id === intent.useCase)?.name || "project"}!\n\nBased on: "${intent.topic}"\n\nChoose the one that fits your needs best:`,
        timestamp: new Date(),
        prompts: generatedPrompts,
      };

      setMessages(prev => [...prev, assistantMessage]);
      toast.success("✅ Prompts generated!");

    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate prompts");

      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    if (confirm("Clear all conversation history?")) {
      setMessages([{
        id: "welcome",
        role: "system",
        content: "👋 Hi! I'm PromptWise. Tell me what you'd like to create and I'll generate intelligent prompts for you.",
        timestamp: new Date(),
      }]);
      setMemory({
        topics: [],
        useCases: [],
        preferences: {},
      });
      toast.success("Conversation cleared");
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied!");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PromptWise</h1>
              <p className="text-xs text-muted-foreground">AI Prompt Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {memory.topics.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {memory.topics.length} topics
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={handleClear} title="Clear conversation">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-6 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[95%] ${message.role === "user" ? "ml-auto" : "mr-auto"}`}>
                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-5 py-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.role === "system"
                        ? "bg-muted/50 text-muted-foreground border border-border"
                        : "bg-card border border-border"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>

                  {/* Generated prompts */}
                  {message.prompts && message.prompts.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {message.prompts.map((promptObj, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-card border-2 border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {promptObj.level === "expert" && <span className="text-2xl">🚀</span>}
                                {promptObj.level === "better" && <span className="text-2xl">🎯</span>}
                                <h4 className="font-bold text-lg">{promptObj.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground">{promptObj.description}</p>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-lg p-4 mb-3 max-h-96 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                              {promptObj.prompt}
                            </pre>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCopyPrompt(promptObj.prompt)}
                              variant="default"
                              size="sm"
                              className="gap-2"
                            >
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`text-xs text-muted-foreground mt-2 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-muted-foreground mb-6"
            >
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              </div>
              <span className="text-sm">Generating prompts...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* Use case selector */}
          <div className="mb-3 flex gap-2 flex-wrap">
            {useCases.slice(0, 6).map((uc) => (
              <Button
                key={uc.id}
                variant={selectedUseCase === uc.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedUseCase(uc.id)}
                className="text-xs"
              >
                {uc.icon} {uc.name}
              </Button>
            ))}
          </div>

          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to create... (e.g., 'a YouTube video about climate change' or 'a resume for software engineer')"
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              size="lg"
              className="shrink-0 h-[60px] px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
