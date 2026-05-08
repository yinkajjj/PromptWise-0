import { motion } from "framer-motion";
import { Copy, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ViralHook, ScriptSection, ThumbnailIdea } from "@/lib/contentIntelligence";

type ViralHooksDisplayProps = {
  hooks: ViralHook[];
};

export function ViralHooksDisplay({ hooks }: ViralHooksDisplayProps) {
  const handleCopy = (hook: string) => {
    navigator.clipboard.writeText(hook);
    toast.success("Hook copied!");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold">Viral Hook Options</h3>
      </div>

      {hooks.map((hook, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-card border-2 border-yellow-500/30 rounded-lg p-4 hover:border-yellow-500/50 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <Badge variant="outline" className="text-xs mb-2 capitalize">
              {hook.type}
            </Badge>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="font-bold text-green-500">{hook.effectiveness}%</span>
            </div>
          </div>

          <p className="font-semibold text-sm mb-2">{hook.hook}</p>

          <p className="text-xs text-muted-foreground italic mb-3">
            💡 {hook.reasoning}
          </p>

          <Button
            onClick={() => handleCopy(hook.hook)}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <Copy className="h-3 w-3" />
            Copy Hook
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

type VideoScriptDisplayProps = {
  script: ScriptSection[];
  topic: string;
};

export function VideoScriptDisplay({ script, topic }: VideoScriptDisplayProps) {
  const handleCopyScript = () => {
    const fullScript = script.map(s => 
      `[${s.timestamp}] ${s.section.toUpperCase()}\n${s.content}\n`
    ).join('\n');
    navigator.clipboard.writeText(fullScript);
    toast.success("Full script copied!");
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">📝 Video Script</h3>
        <Button onClick={handleCopyScript} variant="outline" size="sm" className="gap-2">
          <Copy className="h-3 w-3" />
          Copy Full Script
        </Button>
      </div>

      <div className="space-y-4">
        {script.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <Badge variant="default" className="text-xs mb-1 capitalize">
                  {section.section}
                </Badge>
                <p className="text-xs text-muted-foreground">{section.timestamp}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {section.duration}
              </Badge>
            </div>

            <p className="text-sm mb-2 whitespace-pre-wrap">{section.content}</p>

            <p className="text-xs text-muted-foreground italic">
              Purpose: {section.purpose}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

type ThumbnailIdeasDisplayProps = {
  thumbnails: ThumbnailIdea[];
};

export function ThumbnailIdeasDisplay({ thumbnails }: ThumbnailIdeasDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎨</span>
        <h3 className="text-lg font-bold">Thumbnail Concepts</h3>
      </div>

      {thumbnails.map((thumb, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.08 }}
          className="bg-card border-2 border-pink-500/30 rounded-lg p-4 hover:border-pink-500/50 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-bold text-sm">{thumb.concept}</h4>
            <Badge variant="default" className="text-xs">
              {thumb.clickabilityScore}% CTR
            </Badge>
          </div>

          <div className="space-y-2 mb-3">
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Elements:</span>
              <ul className="text-xs mt-1 space-y-1">
                {thumb.elements.map((el, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground">Color Scheme:</span>
              <p className="text-xs">{thumb.colorScheme}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground">Text Overlay:</span>
              <p className="text-xs font-bold">{thumb.textOverlay}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground">Trigger:</span>
              <p className="text-xs italic">{thumb.emotionalTrigger}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic border-t pt-2">
            💡 {thumb.reasoning}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
