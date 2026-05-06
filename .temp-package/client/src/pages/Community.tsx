import { BookOpen, MessageCircleQuestion, Keyboard, Lightbulb, Mail, Video } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const helpCategories = [
  {
    title: "Getting Started",
    description: "Learn the basics of generating and using prompts for different AI tools.",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "FAQ",
    description: "Find answers to common questions about prompt generation and usage.",
    icon: MessageCircleQuestion,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Keyboard Shortcuts",
    description: "Speed up your workflow with handy keyboard shortcuts.",
    icon: Keyboard,
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "Best Practices",
    description: "Tips and techniques for crafting better prompts and getting better results.",
    icon: Lightbulb,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step guides to master PromptWise features.",
    icon: Video,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Contact Support",
    description: "Need more help? Get in touch with our support team.",
    icon: Mail,
    color: "from-slate-500 to-gray-500",
  },
];

const faqItems = [
  {
    question: "How does prompt generation work?",
    answer: "Enter a topic or objective, and PromptWise generates tailored prompts optimized for different AI tools like ChatGPT, Claude, Midjourney, and more.",
  },
  {
    question: "Can I customize generated prompts?",
    answer: "Yes! All generated prompts can be edited, saved to your library, and adapted for your specific needs.",
  },
  {
    question: "What AI tools are supported?",
    answer: "PromptWise supports ChatGPT, Claude, Midjourney, Runway, DALL-E, Stable Diffusion, and many other popular AI tools.",
  },
  {
    question: "How many prompts can I generate?",
    answer: "You can generate up to 50 prompts per request. Generated prompts are automatically saved to your history.",
  },
  {
    question: "Can I browse prompts without generating?",
    answer: "Absolutely! Visit the Browse page to explore our catalog of pre-made prompts organized by category, tool, and tone.",
  },
];

const shortcuts = [
  { key: "Enter", description: "Generate prompts (from input field)" },
  { key: "Ctrl + K", description: "Quick search" },
  { key: "Esc", description: "Close dialogs or clear search" },
];

export default function Community() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="container py-12">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="outline" className="uppercase tracking-wider">Help Center</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              How can we <span className="text-gradient">help you</span>?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Find guides, tips, and answers to get the most out of PromptWise.
            </p>
          </section>

          {/* Help Categories Grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Browse Topics</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {helpCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card 
                    key={category.title} 
                    className="group cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30 overflow-hidden"
                  >
                    <CardHeader>
                      <div className={`mb-4 h-12 w-12 rounded-xl bg-gradient-to-br ${category.color} p-2.5 text-white`}>
                        <Icon className="h-full w-full" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl">
              {faqItems.map((item, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                      {item.question}
                      <span className="text-muted-foreground">{expandedFaq === index ? '−' : '+'}</span>
                    </CardTitle>
                  </CardHeader>
                  {expandedFaq === index && (
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {item.answer}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Keyboard Shortcuts</h2>
            <Card className="max-w-2xl">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono">{shortcut.key}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Support */}
          <section>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Still need help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                  <Button size="lg" variant="outline">
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}