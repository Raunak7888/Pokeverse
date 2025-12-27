// ResultCard.tsx
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { QuizQuestion } from "@/components/utils/types";
import { Card } from "./UiComponents";
import { scaleIn } from "@/components/utils/animation";

/**
 * ResultCard
 * - Uses semantic theme tokens (success / destructive / primary / foreground)
 * - Responsive: adjusts sizes & spacing for small → large screens
 * - Clean layout: centered header, responsive grid for answer blocks
 * - Accessible: icon has aria-hidden, status region uses aria-live
 */
export const ResultCard: React.FC<{
    isCorrect: boolean;
    correctAnswer: string;
    userAnswer: string;
    question: QuizQuestion;
    timeSpent: number;
    // onNext: () => void;
}> = ({
    isCorrect,
    correctAnswer,
    userAnswer,
    question,
    timeSpent,
    // onNext,
}) => {
    // Semantic tokens used so we don't pick arbitrary colors
    const successText = "text-foreground"; // e.g. green via theme
    const successBg = " border-green-600";
    const failText = "text-primary"; // e.g. red/primary via theme
    const neutralBg = "bg-primary/10 border-primary/30";

    return (
        <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="w-full max-w-xl mx-auto"
        >
            <Card className="overflow-hidden">
                {/* top thin indicator */}
                <div
                    className={`mt-3 h-2 w-full ${
                        isCorrect ? "bg-green-600" : "bg-primary"
                    } rounded-t`}
                    aria-hidden
                />

                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 220,
                                damping: 18,
                            }}
                            className="mb-4"
                            aria-hidden
                        >
                            {isCorrect ? (
                                <CheckCircle2
                                    className={`text-green-600 w-16 h-16 sm:w-20 sm:h-20`}
                                />
                            ) : (
                                <XCircle
                                    className={`${failText} w-16 h-16 sm:w-20 sm:h-20`}
                                />
                            )}
                        </motion.div>

                        <h2 className="text-lg sm:text-2xl font-semibold leading-tight">
                            {isCorrect ? "Correct!" : "Not quite right"}
                        </h2>

                        <p className="mt-2 text-sm sm:text-base text-foreground/70 max-w-prose">
                            {question.question}
                        </p>
                    </div>

                    {/* Answers area: responsive grid */}
                    <div className={`grid gap-4 mb-6  ${isCorrect ? "grid-cols-1" : "grid-cols-2"}`}>
                        <Card
                            className={`p-3 sm:p-4 rounded-md border ${
                                isCorrect ? successBg : failText
                            }`}
                        >
                            <p className="text-xs text-foreground/70 mb-1">
                                Your answer
                            </p>
                            <p
                                className={`${
                                    isCorrect ? successText : "text-foreground"
                                } font-medium break-words`}
                            >
                                {userAnswer || "—"}
                            </p>
                        </Card>

                        {/* show correct answer only when incorrect; on wide screens it sits next to user answer */}
                        {!isCorrect ? (
                            <Card
                                className={`p-3 sm:p-4 rounded-md border ${neutralBg}`}
                            >
                                <p className="text-xs text-foreground/70 mb-1">
                                    Correct answer
                                </p>
                                <p
                                    className={`${"text-green-600"} font-medium break-words`}
                                >
                                    {correctAnswer}
                                </p>
                            </Card>
                        ) : (
                            // keep an empty placeholder on small screens for consistent height if desired
                            <div className="hidden sm:block" />
                        )}
                    </div>

                    {/* meta row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 text-foreground/70">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" aria-hidden />
                            <p className="text-sm">
                                Answered in{" "}
                                <span className="font-medium text-foreground">
                                    {timeSpent}s
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* action */}
                    {/* <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Button
                            onClick={onNext}
                            className="w-full flex items-center justify-center gap-3"
                            aria-label="Next question"
                        >
                            <span className="font-medium">Next Question</span>
                            <Zap className="w-4 h-4" aria-hidden />
                        </Button>
                    </motion.div> */}
                </div>
            </Card>

            {/* live region for screenreaders describing result */}
            <div className="sr-only" role="status" aria-live="polite">
                {isCorrect
                    ? "You answered correctly."
                    : `Incorrect. Correct answer is: ${correctAnswer}`}
            </div>
        </motion.div>
    );
};
