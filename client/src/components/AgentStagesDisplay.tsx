import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { AgentStage } from "@/lib/agenticWorkflow";

type AgentStagesDisplayProps = {
  stages: AgentStage[];
};

export default function AgentStagesDisplay({ stages }: AgentStagesDisplayProps) {
  return (
    <div className="mt-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h4 className="font-bold text-sm">6-Agent Intelligence Pipeline</h4>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => (
          <motion.div
            key={stage.stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
              stage.status === "complete"
                ? "bg-green-500/10 border-green-500/30"
                : stage.status === "processing"
                ? "bg-blue-500/10 border-blue-500/30 animate-pulse"
                : "bg-muted/30 border-border/30"
            }`}
          >
            {/* Status Icon */}
            <div className="mt-0.5">
              {stage.status === "complete" ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : stage.status === "processing" ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
              )}
            </div>

            {/* Stage Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-muted-foreground">
                  Stage {stage.stage}
                </span>
                <h5 className="text-sm font-bold">{stage.name}</h5>
              </div>

              <p className="text-xs text-muted-foreground mb-2">
                {stage.description}
              </p>

              {stage.reasoning && stage.status === "complete" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs bg-card/50 rounded p-2 mt-2 border"
                >
                  <span className="font-semibold">✓ </span>
                  {stage.reasoning}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {stages.every(s => s.status === "complete") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
        >
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            ✨ All agents completed successfully!
          </p>
        </motion.div>
      )}
    </div>
  );
}
