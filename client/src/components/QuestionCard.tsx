import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import type { Question } from "@/lib/aiAgents";

type QuestionCardProps = {
  question: Question;
  answer?: any;
  onAnswer: (questionId: string, answer: any) => void;
  index: number;
};

export default function QuestionCard({ question, answer, onAnswer, index }: QuestionCardProps) {
  const isAnswered = answer !== undefined && answer !== null && answer !== "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-card border-2 rounded-xl p-5 transition-all ${
        isAnswered 
          ? "border-green-500/30 bg-green-500/5" 
          : "border-primary/30 hover:border-primary/50"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-1">
          {isAnswered ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-base">{question.text}</h4>
            <Badge 
              variant={question.importance === "critical" ? "default" : "outline"}
              className="text-xs shrink-0 ml-2"
            >
              {question.importance === "critical" ? "Required" : "Optional"}
            </Badge>
          </div>

          {question.reasoning && (
            <p className="text-xs text-muted-foreground mb-4 italic">
              💡 {question.reasoning}
            </p>
          )}

          {/* Answer inputs based on question type */}
          {question.type === "choice" && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <Button
                  key={option}
                  variant={answer === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAnswer(question.id, option)}
                  className="w-full justify-start text-left h-auto py-3 px-4"
                >
                  {answer === option && <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />}
                  <span className="text-sm">{option}</span>
                </Button>
              ))}
            </div>
          )}

          {question.type === "text" && (
            <Textarea
              value={answer || ""}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              placeholder="Type your answer..."
              className="min-h-[80px]"
            />
          )}

          {question.type === "scale" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Button
                  key={num}
                  variant={answer === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAnswer(question.id, num)}
                  className="flex-1"
                >
                  {num}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
