// QuestionCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Badge, Clock, Target, Zap } from "lucide-react";
import { fadeIn, optionLetters } from "./quizData";
import { QuizQuestion } from "@/components/utils/types";
import { Card, Progress } from "./UiComponents";

export const QuestionCard: React.FC<{
  question: QuizQuestion;
  currentQuestion: number;
  totalQuestions: number;
  onAnswer: (answer: string, correct: boolean) => void;
  timeLeft: number;
}> = ({ question, currentQuestion, totalQuestions, onAnswer, timeLeft }) => {
  const totalTime = 15;
  const progress = (timeLeft / totalTime) * 100;

  return (
    <motion.div
      key={question.id}
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="w-full lg:flex-1"
    >
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
            </div>
            <Badge className={"bg-background text-foreground"}>
              {timeLeft}s
              <Clock className="w-4 h-4 mr-1" />
            </Badge>
          </div>

          <Progress value={progress} className="h-2 mb-6" />

          <h2 className="text-xl font-semibold mb-8">{question.question}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((option: string, idx: number) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <motion.button
                  onClick={() => onAnswer(option, option === question.correctAnswer)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left rounded-lg border border-foreground/20 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary text-lg">
                      {optionLetters[idx]}
                    </span>
                    <span className="flex-1">{option}</span>
                    <Zap className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};