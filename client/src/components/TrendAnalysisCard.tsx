import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Clock, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrendData } from "@/lib/contentIntelligence";

type TrendAnalysisCardProps = {
  trend: TrendData;
};

export default function TrendAnalysisCard({ trend }: TrendAnalysisCardProps) {
  const getMomentumIcon = () => {
    if (trend.momentum === "rising") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend.momentum === "declining") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getMomentumColor = () => {
    if (trend.momentum === "rising") return "text-green-500";
    if (trend.momentum === "declining") return "text-red-500";
    return "text-yellow-500";
  };

  const getTrendScoreColor = () => {
    if (trend.trendScore >= 80) return "bg-green-500";
    if (trend.trendScore >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">📊 Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">Real-time content intelligence</p>
        </div>
        <Badge variant="outline" className="gap-1">
          {trend.platform.toUpperCase()}
        </Badge>
      </div>

      {/* Trend Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Trend Score</span>
          <div className="flex items-center gap-2">
            {getMomentumIcon()}
            <span className={`text-lg font-bold ${getMomentumColor()}`}>
              {trend.trendScore}/100
            </span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={`${getTrendScoreColor()} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${trend.trendScore}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          Momentum: {trend.momentum}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-lg p-3 border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Audience</span>
          </div>
          <p className="text-sm font-bold">{trend.audienceAge}</p>
        </div>

        <div className="bg-card rounded-lg p-3 border">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Peak Time</span>
          </div>
          <p className="text-sm font-bold">{trend.peakTime}</p>
        </div>
      </div>

      {/* Best Posting Times */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Best Posting Times</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trend.bestPostingTimes.map((time) => (
            <Badge key={time} variant="secondary" className="text-xs">
              {time}
            </Badge>
          ))}
        </div>
      </div>

      {/* Related Trends */}
      <div>
        <span className="text-sm font-semibold mb-2 block">Related Trends</span>
        <div className="flex flex-wrap gap-2">
          {trend.relatedTrends.map((relTrend) => (
            <Badge key={relTrend} variant="outline" className="text-xs">
              #{relTrend}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
