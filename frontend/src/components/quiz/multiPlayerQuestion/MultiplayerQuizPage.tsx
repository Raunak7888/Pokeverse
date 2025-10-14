// MultiplayerQuizPage.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initialPlayers, quizQuestions, fadeIn } from "./quizData";
import { QuestionCard } from "./QuestionCard";
import { Leaderboard } from "./Leaderboard";
import { WaitingForOthers } from "./WaitingForOthers";
import { ResultCard } from "./ResultCard";
import { FinalResults } from "./FinalResults";
import { Player } from "@/components/utils/types";
import { useRouter } from "next/navigation";
import Chat from "./Chat";

export default function MultiplayerQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showResult, setShowResult] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const router = useRouter();

  const handleTimeout = useCallback(() => {
    setTimeSpent(15);
    setUserAnswer(null);
    setIsCorrect(false);
    simulateOtherPlayers(false);
    setShowWaiting(true);

    setTimeout(() => {
      setShowWaiting(false);
      setShowResult(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (!showResult && !showWaiting && !showFinalResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showResult, showWaiting, showFinalResults, handleTimeout]);

  const simulateOtherPlayers = (isUserCorrect: boolean) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.name === "You") {
          return {
            ...player,
            score: isUserCorrect ? player.score + 1 : player.score,
          };
        }
        const otherPlayerCorrect = Math.random() > 0.3;
        return {
          ...player,
          score: otherPlayerCorrect ? player.score + 1 : player.score,
        };
      })
    );
  };

  const handleAnswer = (answer: string, correct: boolean) => {
    const spent = 15 - timeLeft;
    setTimeSpent(spent);
    setUserAnswer(answer);
    setIsCorrect(correct);
    simulateOtherPlayers(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setShowWaiting(true);
  };

  return (
    <>
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          <AnimatePresence mode="wait">
            {!showResult && !showWaiting && !showFinalResults && (
              <motion.div
                key="quiz"
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col lg:flex-row gap-6 items-start justify-center"
              >
                <QuestionCard
                  question={quizQuestions[currentQuestion]}
                  currentQuestion={currentQuestion}
                  totalQuestions={quizQuestions.length}
                  onAnswer={handleAnswer}
                  timeLeft={timeLeft}
                />
                <Leaderboard players={players} />
              </motion.div>
            )}

            {showResult && (
              <div
                key="result"
                className="flex flex-col lg:flex-row gap-6 justify-center"
              >
                <ResultCard
                  isCorrect={isCorrect}
                  correctAnswer={quizQuestions[currentQuestion].correctAnswer}
                  userAnswer={userAnswer || "No answer"}
                  question={quizQuestions[currentQuestion]}
                  timeSpent={timeSpent}
                  onNext={handleNext}
                />
                <Leaderboard players={players} />
              </div>
            )}

            {showWaiting && (
              <div
                key="waiting"
                className="flex flex-col lg:flex-row gap-6 justify-center"
              >
                <WaitingForOthers
                  timeleft={timeLeft}
                  isCorrect={isCorrect}
                  players={players}
                />
                <Leaderboard players={players} />
              </div>
            )}

            {showFinalResults && (
              <div key="final" className="flex justify-center">
                <FinalResults
                  players={players}
                  onRestart={() => {
                    router.push("/quiz");
                  }}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Chat />
    </>
  );
}
