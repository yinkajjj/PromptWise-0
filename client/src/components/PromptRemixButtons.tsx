import { Sparkles, Zap, FileText, Mic2, Laugh, Heart, TrendingUp, Shuffle } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import type { RemixType } from "@/lib/promptRemix";

interface PromptRemixButtonsProps {
  onRemix: (type: RemixType) => void;
  isLoading?: boolean;
}

export default function PromptRemixButtons({ onRemix, isLoading }: PromptRemixButtonsProps) {
  const remixOptions: Array<{ type: RemixType; label: string; icon: any; description: string }> = [
    {
      type: "more-viral",
      label: "Make Viral",
      icon: TrendingUp,
      description: "Add viral elements and hooks"
    },
    {
      type: "simplify",
      label: "Simplify",
      icon: Zap,
      description: "Make it easier to execute"
    },
    {
      type: "add-detail",
      label: "Add Detail",
      icon: FileText,
      description: "Include more production specs"
    },
    {
      type: "different-hook",
      label: "New Hooks",
      icon: Sparkles,
      description: "Generate alternative hooks"
    },
    {
      type: "add-humor",
      label: "Add Humor",
      icon: Laugh,
      description: "Make it funnier"
    },
    {
      type: "more-emotional",
      label: "More Emotional",
      icon: Heart,
      description: "Deepen emotional connection"
    },
    {
      type: "trending-format",
      label: "Trending Format",
      icon: Shuffle,
      description: "Use viral format templates"
    },
    {
      type: "change-tone",
      label: "Change Tone",
      icon: Mic2,
      description: "Adjust communication style"
    },
  ];

  const handleRemix = (type: RemixType, label: string) => {
    toast.info(`Remixing prompt: ${label}...`);
    onRemix(type);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="w-4 h-4" />
        <span>Quick Remix Options</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {remixOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.type}
              variant="outline"
              size="sm"
              onClick={() => handleRemix(option.type, option.label)}
              disabled={isLoading}
              className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
              title={option.description}
            >
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs">{option.label}</span>
            </Button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Click any option to instantly enhance your prompt
      </p>
    </div>
  );
}
