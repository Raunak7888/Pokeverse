"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "./quizData";
import { QuestionCard } from "./QuestionCard";
import { Leaderboard } from "./Leaderboard";
import { WaitingForOthers } from "./WaitingForOthers";
import { ResultCard } from "./ResultCard";
import { FinalResults } from "./FinalResults";
import { Player } from "@/components/utils/types";
import { useRouter } from "next/navigation";
import Chat from "./Chat";
import { useWebSocket } from "@/components/utils/websocketprovider";
import { useMultiplayerRoomStore } from "@/store/useMultiplayerRoomStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface RoomQuestion {
  questionId: number;
  question: string;
  options: string[];
  roundNumber: number;
  totalRounds: number;
  timeLimit: number;
}

export default function LiveMultiplayerQuiz() {
  const router = useRouter();
  const { subscribe, send } = useWebSocket();
  const room = useMultiplayerRoomStore((state) => state.room);
  const userId = useAuthStore().user?.id;

  const [currentQuestion, setCurrentQuestion] = useState<RoomQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [showWaiting, setShowWaiting] = useState(true);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  useEffect(() => {
    if (!room) {
      toast.error("Room not found");
      router.push("/quiz/multiplayer");
      return;
    }

    const questionTopic = `/topic/room/${room.id}/game/question`;
    const answerTopic = `/topic/player/${userId}/game/answer`;
    const resultsTopic = `/topic/room/${room.id}/game/results`;
    const endTopic = `/topic/room/${room.id}/game/end`;

    const unsubscribe1 = subscribe(questionTopic, (message) => {
      try {
        const question: RoomQuestion = JSON.parse(message.body);
        console.log("📝 New question received:", question);

        setCurrentQuestion(question);
        setTimeLeft(question.timeLimit);
        setShowWaiting(false);
        setShowResult(false);
        setUserAnswer(null);
        setIsCorrect(false);
        setCorrectAnswer("");

        toast.info(`Round ${question.roundNumber}/${question.totalRounds}`);
      } catch (err) {
        console.error("❌ Failed to parse question:", err);
      }
    });

    const unsubscribe2 = subscribe(answerTopic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("✅ Answer response:", data);

        setIsCorrect(data.isCorrect);
        toast(data.message, {
          icon: data.isCorrect ? "✅" : "❌"
        });
      } catch (err) {
        console.error("❌ Failed to parse answer:", err);
      }
    });

    const unsubscribe3 = subscribe(resultsTopic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("📊 Round results:", data);

        setCorrectAnswer(data.correctAnswer);
        setPlayers(data.players.map((p: any) => ({
          id: p.userId,
          name: p.name,
          score: p.score,
          avatar: "",
          isOnline: true
        })));

        setShowWaiting(true);

        setTimeout(() => {
          setShowResult(false);
          setShowWaiting(true);
        }, 3000);
      } catch (err) {
        console.error("❌ Failed to parse results:", err);
      }
    });

    const unsubscribe4 = subscribe(endTopic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("🏁 Game ended:", data);

        const leaderboard = data.leaderboard.map((p: any) => ({
          id: p.userId,
          name: p.name,
          score: p.score,
          avatar: "",
          isOnline: true
        }));

        setPlayers(leaderboard);
        setShowFinalResults(true);
        toast.success(data.message);
      } catch (err) {
        console.error("❌ Failed to parse end game:", err);
      }
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  }, [room, userId, subscribe, router]);

  useEffect(() => {
    if (!showResult && !showWaiting && !showFinalResults && currentQuestion) {
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
  }, [showResult, showWaiting, showFinalResults, currentQuestion]);

  const handleTimeout = useCallback(() => {
    if (!userAnswer) {
      toast.error("Time's up!");
      setShowWaiting(true);
    }
  }, [userAnswer]);

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || !room || userAnswer) return;

    const spent = currentQuestion.timeLimit - timeLeft;
    setTimeSpent(spent);
    setUserAnswer(answer);

    const success = send(`/app/game/answer`, {
      roomId: room.id,
      userId: userId,
      questionId: currentQuestion.questionId,
      selectedOption: answer
    });

    if (success) {
      setShowResult(true);
      toast.info("Answer submitted!");
    } else {
      toast.error("Failed to submit answer");
    }
  };

  if (!room || !currentQuestion) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Waiting for game to start...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  const questionForCard: Question = {
    id: currentQuestion.questionId,
    question: currentQuestion.question,
    options: currentQuestion.options,
    correctAnswer: correctAnswer || currentQuestion.options[0]
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
                  question={questionForCard}
                  currentQuestion={currentQuestion.roundNumber - 1}
                  totalQuestions={currentQuestion.totalRounds}
                  onAnswer={(answer, _) => handleAnswer(answer)}
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
                  correctAnswer={correctAnswer || questionForCard.correctAnswer}
                  userAnswer={userAnswer || "No answer"}
                  question={questionForCard}
                  timeSpent={timeSpent}
                  onNext={() => setShowWaiting(true)}
                />
                <Leaderboard players={players} />
              </div>
            )}

            {showWaiting && !showFinalResults && (
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
