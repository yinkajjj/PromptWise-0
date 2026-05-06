import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Lightbulb, 
  Home, 
  Library, 
  HelpCircle, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Trash2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getHistory, clearHistory as clearHistoryUtil } from "@/lib/promptHistory";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface PromptHistory {
  id: string;
  text: string;
  timestamp: number;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const [history, setHistory] = useState<PromptHistory[]>([]);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    loadHistory();

    // Listen for history updates
    window.addEventListener("promptHistoryUpdated", loadHistory);
    return () => {
      window.removeEventListener("promptHistoryUpdated", loadHistory);
    };
  }, []);

  const handleClearHistory = () => {
    clearHistoryUtil();
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: Library },
    { href: "/library", label: "My Library", icon: Library },
    { href: "/community", label: "Help", icon: HelpCircle },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-card border-r border-border transition-all duration-300",
          isOpen ? "w-64" : "w-0 lg:w-16"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {isOpen && (
              <Link href="/">
                <a className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center">
                    <Lightbulb className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold">PromptWise</span>
                </a>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(!isOpen && "mx-auto")}
            >
              {isOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="p-2 border-b border-border">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* History Section */}
          {isOpen && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Recent</span>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 px-2">
                {history.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No history yet. Start generating prompts!
                  </div>
                ) : (
                  <div className="space-y-1 py-2">
                    {history.slice(0, 50).map((item) => (
                      <div
                        key={item.id}
                        className="px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <p className="text-sm line-clamp-2">{item.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* New Chat Button (when sidebar is closed) */}
          {!isOpen && (
            <div className="p-2 mt-auto border-t border-border">
              <Link href="/">
                <a>
                  <Button variant="ghost" size="icon" className="w-full">
                    <Plus className="h-5 w-5" />
                  </Button>
                </a>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Toggle button for when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="fixed top-4 left-4 z-30 lg:hidden"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
