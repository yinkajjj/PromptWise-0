import { Copy, Heart, Share2, Star, TrendingUp } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Prompt } from "@/data/mockPrompts";
import { getPromptMatchReasons } from "@/lib/promptSearch";
import { isPromptSaved, removeSavedPrompt, savePrompt } from "@/hooks/useSavedPrompts";
import { toast } from "sonner";

interface PromptCardProps {
  prompt: Prompt;
  onClick?: () => void;
  searchQuery?: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedText = ({ text, query }: { text: string; query?: string }) => {
  const content = useMemo(() => {
    const terms = (query ?? "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length > 1);

    if (terms.length === 0) {
      return [text];
    }

    const uniqueTerms = Array.from(new Set(terms)).sort((left, right) => right.length - left.length);
    const pattern = new RegExp(`(${uniqueTerms.map(escapeRegExp).join("|")})`, "ig");
    return text.split(pattern);
  }, [query, text]);

  if ((query ?? "").trim() === "") {
    return <>{text}</>;
  }

  const loweredQuery = (query ?? "").toLowerCase();

  return (
    <>
      {content.map((part, index) => {
        const isMatch = part.toLowerCase().length > 1 && loweredQuery.includes(part.toLowerCase());
        if (!isMatch) {
          return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
        }

        return (
          <mark key={`${part}-${index}`} className="rounded bg-primary/15 px-1 py-0 text-foreground">
            {part}
          </mark>
        );
      })}
    </>
  );
};

export default function PromptCard({ prompt, onClick, searchQuery }: PromptCardProps) {
  const [isFavorited, setIsFavorited] = useState(() => isPromptSaved(prompt.id));
  const [copied, setCopied] = useState(false);
  const matchReasons = useMemo(() => getPromptMatchReasons(prompt, searchQuery ?? ""), [prompt, searchQuery]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isFavorited) {
      removeSavedPrompt(prompt.id);
      setIsFavorited(false);
      toast.success("Removed from My Library");
      return;
    }

    const result = savePrompt(prompt);
    if (!result.ok) {
      toast.error("Saved prompt limit reached for now.");
      return;
    }

    setIsFavorited(true);
    toast.success("Saved to My Library");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Share link copied!");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="h-full cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden group"
        onClick={onClick}
      >
        {/* Trending/Featured Badge */}
        {(prompt.isTrending || prompt.isFeatured) && (
          <div className="absolute top-3 right-3 z-10">
            {prompt.isTrending && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            {prompt.isFeatured && !prompt.isTrending && (
              <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">
                <HighlightedText text={prompt.title} query={searchQuery} />
              </CardTitle>
              <CardDescription className="line-clamp-2">
                <HighlightedText text={prompt.description} query={searchQuery} />
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              <HighlightedText text={prompt.tool} query={searchQuery} />
            </Badge>
            <Badge variant="outline" className="text-xs">
              <HighlightedText text={prompt.category} query={searchQuery} />
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-muted/50 rounded-lg p-3 mb-3">
            <p className="text-sm text-muted-foreground line-clamp-3 font-mono">
              {prompt.prompt}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #<HighlightedText text={tag} query={searchQuery} />
              </Badge>
            ))}
          </div>

          {matchReasons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {matchReasons.map((reason) => (
                <Badge key={`${prompt.id}-${reason.kind}`} className="border-0 bg-primary/10 text-[11px] font-medium text-primary shadow-none">
                  {reason.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{prompt.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Copy className="h-3.5 w-3.5" />
              <span>{prompt.copies}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleFavorite}
              aria-label={isFavorited ? "Remove from library" : "Save to library"}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90"
              onClick={handleCopy}
            >
              {copied ? (
                <>✓ Copied</>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

