"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { XCircle, CheckCircle2 } from "lucide-react";
import { Question } from "@/components/utils/types";
import { useSinglePlayerQuestionsStore } from "@/store/useSinglePlayerQuestionsStore";
import { useSinglePlayerSessionStore } from "@/store/useSinglePlayerSessionStore";
import { BACKEND_URL } from "@/components/utils/backendUrl";

const optionLetters = ["A", "B", "C", "D"];

const optionColors: Record<
  "default" | "selected" | "correct" | "wrong" | "faded",
  string
> = {
  default: "bg-background text-foreground",
  selected: "bg-yellow-400 text-foreground",
  correct: "bg-green-600 text-white",
  wrong: "bg-red-700 text-white",
  faded: "opacity-50",
};

type QuizCardProps = {
  question: Question;
  onSubmit: (isCorrect: boolean) => void;
  onNext: () => void;
};

export default function QuizCard({
  question,
  onSubmit,
  onNext,
}: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const questionRef = useRef<HTMLHeadingElement>(null);
  const [isSingleLine, setIsSingleLine] = useState(true);
  const [useSingleCol, setUseSingleCol] = useState(false);

  const { session } = useSinglePlayerSessionStore();

  useEffect(() => {
    // Check if question is single line
    if (questionRef.current) {
      const el = questionRef.current;
      setIsSingleLine(el.scrollHeight <= el.clientHeight + 2);
    }

    // Check if any option is "too big"
    const maxOptionLength = Math.max(...question.options.map((o) => o.length));
    setUseSingleCol(maxOptionLength > 30);
  }, [question]);

  const handleSubmit = async () => {
    if (!selected) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/v1/api/quiz/single-player/attempts/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            selectedAnswer: selected,
            sessionId: session?.sessionId,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit");

      const data: {
        questionId: string;
        selectedAnswer: string;
        isCorrect: boolean;
        CorrectAnswer: string; // notice the case
      } = await res.json();

      useSinglePlayerQuestionsStore.getState().updateQuestionAttempt(
        data.questionId,
        data.selectedAnswer,
        data.isCorrect,
        data.CorrectAnswer // map correctly
      );

      setSubmitted(true);

      // ✅ Call onSubmit with backend result, not local comparison
      onSubmit(data.isCorrect);
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  const getOptionColor = (option: string) => {
    if (!submitted) {
      return option === selected ? optionColors.selected : optionColors.default;
    }

    if (option === question.answer) return optionColors.correct;
    if (option === question.selectedAnswer && !question.isCorrect)
      return optionColors.wrong;

    return optionColors.faded;
  };

  return (
    <Card className="rounded-3xl w-full max-w-2xl sm:scale-110 border-foreground border-2 bg-card text-card-foreground p-6 shadow-xl relative">
      {/* Floating circle */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow">
        {question.questionNo}
      </div>

      {/* Question */}
      <CardHeader className="text-center">
        <h2
          ref={questionRef}
          className={`px-2 text-lg sm:text-xl md:text-2xl font-semibold leading-relaxed max-h-40 overflow-y-auto break-words ${
            isSingleLine ? "text-center" : "text-left"
          }`}
        >
          {question.question}
        </h2>
      </CardHeader>

      {/* Options */}
      <CardContent
        className={`grid gap-4 mt-4 ${
          useSingleCol ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {question.options.map((option, idx) => {
          const isCorrect = option === question.answer;
          const isSelected = option === question.selectedAnswer;

          return (
            <motion.div
              key={option}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                className={`w-full py-5 text-base sm:text-lg rounded-full flex border-2 border-border items-center gap-2 justify-baseline ${getOptionColor(
                  option
                )}`}
                onClick={() => !submitted && setSelected(option)}
              >
                <span className="font-bold">{optionLetters[idx]}.</span>
                {option}
                {submitted &&
                  (isCorrect ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5" />
                  ) : null)}
              </Button>
            </motion.div>
          );
        })}
      </CardContent>

      {/* Footer buttons */}
      <CardFooter className="flex justify-center mt-6">
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={!selected}
            className="w-full py-6 rounded-full text-lg font-semibold bg-primary text-primary-foreground hover:opacity-90"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="w-full py-6 rounded-full text-lg font-semibold bg-secondary text-secondary-foreground hover:opacity-90"
          >
            Next Question
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
