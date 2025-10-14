// ResultCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { scaleIn } from "./quizData";
import { QuizQuestion } from "@/components/utils/types";
import { Button, Card } from "./UiComponents";

export const ResultCard: React.FC<{
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  question: QuizQuestion;
  timeSpent: number;
  onNext: () => void;
}> = ({ isCorrect, correctAnswer, userAnswer, question, timeSpent, onNext }) => (
  <motion.div
    variants={scaleIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
    className="w-full max-w-lg"
  >
    <Card>
      <div className={`h-1 ${isCorrect ? 'bg-green-500' : 'bg-primary'}`} />
      
      <div className="p-8">
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-primary mb-4" />
            )}
          </motion.div>
          
          <h2 className="text-2xl font-bold text-center">
            {isCorrect ? "Correct!" : "Not quite right"}
          </h2>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-center text-foreground/70">{question.question}</p>
          
          <Card className={isCorrect ? "bg-green-500/10 border-green-500/30" : ""}>
            <div className="p-4">
              <p className="text-sm text-foreground/70 mb-1">Your Answer</p>
              <p className={`font-semibold ${isCorrect ? "text-green-500" : "text-foreground"}`}>
                {userAnswer}
              </p>
            </div>
          </Card>
          
          {!isCorrect && (
            <Card className="bg-primary/10 border-primary/30">
              <div className="p-4">
                <p className="text-sm text-foreground/70 mb-1">Correct Answer</p>
                <p className="font-semibold text-primary">{correctAnswer}</p>
              </div>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 text-foreground/70">
          <Clock className="w-5 h-5" />
          <p className="text-sm">
            Answered in <span className="font-bold text-foreground">{timeSpent}s</span>
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onNext} className="w-full">
            Next Question
            <Zap className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </Card>
  </motion.div>
);