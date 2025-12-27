"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionCard } from "./QuestionCard";
import { Leaderboard } from "./Leaderboard";
import { ResultCard } from "./ResultCard";
import {
    MultiplayerPlayersInRoomDto,
    QuizQuestion,
} from "@/components/utils/types";
import { useRouter } from "next/navigation";
import Chat from "./Chat";
import { useWebSocket } from "@/components/utils/websocketprovider";
import { useMultiplayerRoomStore } from "@/store/useMultiplayerRoomStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { fadeIn } from "@/components/utils/animation";

interface RoomQuestion {
    questionId: number;
    question: string;
    options: string[];
    roundNumber: number;
    totalRounds: number;
    timeLimit: number;
}

const QuizState = {
    LOADING: "LOADING",
    QUESTION: "QUESTION",
    RESULT: "RESULT",
    FINAL_RESULTS: "FINAL_RESULTS",
} as const;
type QuizState = (typeof QuizState)[keyof typeof QuizState];

export default function LiveMultiplayerQuiz() {
    const router = useRouter();
    const { subscribe, send } = useWebSocket();
    const room = useMultiplayerRoomStore((state) => state.room);
    const userId = useAuthStore().user?.id;

    // --- State Initialization ---
    const [gameState, setGameState] = useState<QuizState>(QuizState.LOADING);
    const [currentQuestion, setCurrentQuestion] = useState<RoomQuestion | null>(
        null
    );
    const [timeLeft, setTimeLeft] = useState(30);
    const [userAnswer, setUserAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState<string>("");
    // Store accessors
    const players = useMultiplayerRoomStore(
        (state) => state.room?.players ?? []
    );
    const setPlayers = useMultiplayerRoomStore((state) => state.setPlayers);
    const roomId = room?.id || "";

    // --- WebSocket Subscriptions Effect ---
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

        // 1. New Question Handler
        const unsubscribe1 = subscribe(questionTopic, (message) => {
            try {
                const question: RoomQuestion = JSON.parse(message.body);
                console.log("📝 New question received:", question);

                // Reset state for new question and set to QUESTION state
                setCurrentQuestion(question);
                setTimeLeft(question.timeLimit);
                setUserAnswer(null);
                setIsCorrect(false);
                setCorrectAnswer("");
                setGameState(QuizState.QUESTION); // <--- ENSURING QUESTION SCREEN IS SHOWN

                // toast.info(
                //     `Round ${question.roundNumber}/${question.totalRounds}`
                // );
            } catch (err) {
                console.error("❌ Failed to parse question:", err);
            }
        });

        // 2. Answer Confirmation Handler (Keep simple, remove redundant toasts)
        const unsubscribe2 = subscribe(answerTopic, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log("✅ Answer response:", data);
                // Update correctness state, but let ResultCard handle the visual feedback
                setIsCorrect(data.isCorrect);
                setCorrectAnswer(data.correctAnswer);
                // Removed: toast logic
            } catch (err) {
                console.error("❌ Failed to parse answer:", err);
            }
        });

        // 3. Round Results Handler (Update scores, remain in RESULT state)
        const unsubscribe3 = subscribe(resultsTopic, (message) => {
            const data = JSON.parse(message.body);
            console.log("📊 Round results:", data);
            setCorrectAnswer(data.correctAnswer);

            setPlayers(
                data.players.map((p: MultiplayerPlayersInRoomDto) => ({
                    id: p.userId,
                    name: p.name,
                    score: p.score,
                    avatar: p.avatar,
                    userId: p.userId,
                }))
            );

            // Stay in RESULT state until the next QUESTION message arrives
        });

        // 4. Game End Handler
        const unsubscribe4 = subscribe(endTopic, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log("🏁 Game ended:", data);

                const leaderboard = data.leaderboard.map(
                    (p: MultiplayerPlayersInRoomDto) => ({
                        id: p.userId,
                        name: p.name,
                        score: p.score,
                        avatar: p.avatar,
                        userId: p.userId,
                    })
                );

                setPlayers(leaderboard);
                setGameState(QuizState.FINAL_RESULTS);
                router.push(`/quiz/multiplayer/result/${room.code}`);
                // toast.success(data.message);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, userId, subscribe, router]);

    // --- Timeout Logic ---
    const handleTimeout = useCallback(() => {
        if (!userAnswer) {
            toast.error("Time's up! Waiting for results...");
            // If the user hasn't answered, transition to RESULT state prematurely
            // to show the "No answer" on the ResultCard while waiting for server results.
            setGameState(QuizState.RESULT);
        }
    }, [userAnswer]);

    // --- Question Timer Effect ---
    useEffect(() => {
        if (gameState === QuizState.QUESTION && currentQuestion) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [gameState, currentQuestion, handleTimeout]);

    // --- Answer Submission Logic ---
    const handleAnswer = (answer: string) => {
        if (!currentQuestion || !room || userAnswer) return;

        const spent = currentQuestion.timeLimit - timeLeft;
        setTimeSpent(spent);
        setUserAnswer(answer); // Disable answering
        setGameState(QuizState.RESULT); // <--- SWITCHING TO RESULT STATE IMMEDIATELY

        const success = send(`/app/game/answer`, {
            roomId: room.id,
            userId: userId,
            questionId: currentQuestion.questionId,
            selectedOption: answer,
        });

        if (success) {
            // toast.info("Answer submitted! Waiting for round results...");
        } else {
            toast.error("Failed to submit answer");
            setUserAnswer(null); // Allow retry if submission failed
            setGameState(QuizState.QUESTION); // Go back to question if failed
        }
    };

    // --- Loading/Error State Render ---
    if (!room) {
        return (
            <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">
                        Room data not found. Redirecting...
                    </h2>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
            </div>
        );
    }

    // Fallback for initial load when room is ready but question hasn't arrived
    if (!currentQuestion && gameState !== QuizState.FINAL_RESULTS) {
        return (
            <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">
                        Waiting for the quiz master to start the next round...
                    </h2>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
            </div>
        );
    }

    // --- Props Preparation for Cards ---
    const questionForCard: QuizQuestion = {
        questionId: currentQuestion?.questionId ?? 0,
        question: currentQuestion?.question ?? "N/A",
        roundNumber: currentQuestion?.roundNumber ?? 0,
        totalRounds: currentQuestion?.totalRounds ?? 0,
        options: currentQuestion?.options ?? [],
        correctAnswer: correctAnswer,
        timeLimit: currentQuestion?.timeLimit ?? 30,
    };

    // --- Main Render with State Switch ---
    const renderContent = () => {
        switch (gameState) {
            case QuizState.QUESTION:
                return (
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
                            currentQuestion={questionForCard.roundNumber}
                            totalQuestions={questionForCard.totalRounds}
                            onAnswer={handleAnswer}
                            timeLeft={timeLeft}
                            timeLimit={questionForCard.timeLimit}
                            disabled={!!userAnswer} // Disable once answered
                        />
                        <Leaderboard players={players} />
                    </motion.div>
                );

            case QuizState.RESULT:
                return (
                    <motion.div
                        key="result"
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex flex-col lg:flex-row gap-6 justify-center"
                    >
                        <ResultCard
                            isCorrect={isCorrect}
                            correctAnswer={
                                correctAnswer || questionForCard.correctAnswer
                            }
                            userAnswer={userAnswer || "No answer"}
                            question={questionForCard}
                            timeSpent={timeSpent}
                            // Server message will trigger transition to QUESTION or FINAL_RESULTS
                        />
                        <Leaderboard players={players} />
                    </motion.div>
                );

            case QuizState.FINAL_RESULTS:
                return null;

            case QuizState.LOADING:
            default:
                // If we reach here and currentQuestion is null, the early return handles the loading spinner.
                return null;
        }
    };

    return (
        <>
            <div className="min-h-screen w-full bg-background flex items-center mt-15 md:mt-0 justify-center p-4">
                <div className="w-full max-w-7xl">
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </div>
            <Chat />
        </>
    );
}
