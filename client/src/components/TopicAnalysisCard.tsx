import { AlertCircle, TrendingUp, TrendingDown, Minus, Star, Users, Target, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { TopicAnalysis, CreatorExample, TrendingHashtag } from "@/lib/topicIntelligence";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface TopicAnalysisCardProps {
  analysis: TopicAnalysis;
  creators: CreatorExample[];
  hashtags: TrendingHashtag[];
}

export default function TopicAnalysisCard({ analysis, creators, hashtags }: TopicAnalysisCardProps) {
  const getViralColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-orange-500";
  };

  const getSaturationColor = (saturation: string) => {
    if (saturation === "low") return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (saturation === "medium") return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    if (saturation === "high") return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "viral" || trend === "rising") return <TrendingUp className="w-4 h-4" />;
    if (trend === "declining") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Stats */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getViralColor(analysis.viralPotential)}`}>
              {analysis.viralPotential}/10
            </div>
            <div className="text-sm text-muted-foreground mt-1">Viral Potential</div>
          </div>

          <div className="text-center">
            <Badge className={getSaturationColor(analysis.saturation)}>
              {analysis.saturation.toUpperCase()}
            </Badge>
            <div className="text-sm text-muted-foreground mt-2">Saturation</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-semibold">
              {getTrendIcon(analysis.trendingStatus)}
              <span className="capitalize">{analysis.trendingStatus}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Trend Status</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold">{analysis.estimatedViews}</div>
            <div className="text-sm text-muted-foreground mt-1">Est. Views</div>
          </div>
        </div>
      </Card>

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <Card className="p-4 border-orange-500/50 bg-orange-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-orange-700 dark:text-orange-400">Important Considerations</h3>
              <ul className="space-y-1 text-sm">
                {analysis.warnings.map((warning, i) => (
                  <li key={i} className="text-muted-foreground">{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold">Recommendations</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Unique Angles */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-3 flex-1">
            <h3 className="font-semibold">Unique Angle Ideas</h3>
            <div className="grid gap-2">
              {analysis.uniqueAngles.map((angle, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer">
                  {angle}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Creator Examples */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-3 flex-1">
            <h3 className="font-semibold">Study These Creators</h3>
            <div className="grid gap-3">
              {creators.map((creator, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{creator.handle}</span>
                    <Badge variant="secondary">{creator.followers}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div><strong>Style:</strong> {creator.style}</div>
                    <div><strong>Why successful:</strong> {creator.whySuccessful}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Trending Hashtags */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-3 flex-1">
            <h3 className="font-semibold">Trending Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-sm">
                  {tag.tag}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {tag.posts}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Best Platforms */}
      <Card className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold">Best Platforms for This Topic</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.bestPlatforms.map((platform, i) => (
              <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/20">
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Seasonality */}
      {analysis.seasonality && (
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{analysis.seasonality}</span>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
