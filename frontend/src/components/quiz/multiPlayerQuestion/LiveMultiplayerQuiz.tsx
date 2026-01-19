"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Trophy, X } from "lucide-react";
import { toast } from "sonner";

// Components
import { QuestionCard } from "./QuestionCard";
import { Leaderboard } from "./Leaderboard";
import { ResultCard } from "./ResultCard";
import Chat from "./Chat";
import CountdownTimer from "./CountdownTimer";

// Hooks & Stores
import { useWebSocket } from "@/components/utils/websocketprovider";
import { useMultiplayerRoomStore } from "@/store/useMultiplayerRoomStore";
import { useAuthStore } from "@/store/useAuthStore";

// Utils
import { fadeIn } from "@/components/utils/animation";
import {
    MultiplayerPlayersInRoomDto,
    QuizQuestion,
} from "@/components/utils/types";

interface RoomQuestion {
    questionId: number;
    question: string;
    options: string[];
    roundNumber: number;
    totalRounds: number;
    difficulty: string;
    topic: string;
    timeLimit: number;
}

const QuizState = {
    Initial: "Initial",
    LOADING: "LOADING",
    QUESTION: "QUESTION",
    RESULT: "RESULT",
    FINAL_RESULTS: "FINAL_RESULTS",
} as const;

type QuizState = (typeof QuizState)[keyof typeof QuizState];

export default function LiveMultiplayerQuiz() {
    const router = useRouter();
    const { subscribe, send } = useWebSocket();

    // ---------- Global State ----------
    const room = useMultiplayerRoomStore((s) => s.room);
    const players = useMultiplayerRoomStore((s) => s.room?.players ?? []);
    const setPlayers = useMultiplayerRoomStore((s) => s.setPlayers);
    const increasePlayerScore = useMultiplayerRoomStore(
        (s) => s.IncrementPlayerScore,
    );

    const userId = useAuthStore().user?.id;
    const playerId = room?.players.find((p) => p.userId === userId)?.id;

    // ---------- Local State ----------
    const [gameState, setGameState] = useState<QuizState>(QuizState.Initial);
    const [currentQuestion, setCurrentQuestion] = useState<RoomQuestion | null>(
        null,
    );
    const [timeLeft, setTimeLeft] = useState(30);
    const [userAnswer, setUserAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);

    // ---------- WebSocket Handlers (STABLE) ----------
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onQuestion = useCallback((message: any) => {
        try {
            const question: RoomQuestion = JSON.parse(message.body);

            setUserAnswer(null);
            setIsCorrect(false);
            setTimeSpent(0);
            setCurrentQuestion(question);
            setTimeLeft(question.timeLimit);
            setGameState(QuizState.QUESTION);

            toast.success(`Round ${question.roundNumber} started`);
        } catch (e) {
            console.error("Failed to parse question", e);
        }
    }, []);

    const onAnswer = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (message: any) => {
            try {
                const data = JSON.parse(message.body);

                if (data.playerId === playerId) {
                    setIsCorrect(data.isCorrect);
                }

                if (data.isCorrect) {
                    increasePlayerScore(data.playerId, data.score);
                }
            } catch (e) {
                console.error("Failed to parse answer", e);
            }
        },
        [playerId, increasePlayerScore],
    );

    const onEnd = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (message: any) => {
            try {
                const data = JSON.parse(message.body);

                const leaderboard = data.leaderboard.map(
                    (p: MultiplayerPlayersInRoomDto) => ({
                        id: p.userId,
                        name: p.name,
                        score: p.score,
                        avatar: p.avatar,
                        userId: p.userId,
                    }),
                );

                setPlayers(leaderboard);
                setGameState(QuizState.FINAL_RESULTS);
                router.push(`/quiz/multiplayer/result/${room?.code}`);
            } catch (e) {
                console.error("Failed to parse end game", e);
            }
        },
        [router, setPlayers, room?.code],
    );

    // ---------- WebSocket Subscriptions (CORRECT LIFECYCLE) ----------
    useEffect(() => {
        if (!room?.id || !playerId) return;

        const unsubQuestion = subscribe(
            `/topic/room/${room.id}/game/question`,
            onQuestion,
        );
        const unsubAnswer = subscribe(
            `/topic/room/${room.id}/game/answer`,
            onAnswer,
        );
        const unsubEnd = subscribe(`/topic/room/${room.id}/game/end`, onEnd);

        return () => {
            unsubQuestion();
            unsubAnswer();
            unsubEnd();
        };
    }, [room?.id, playerId, subscribe, onQuestion, onAnswer, onEnd]);

    // ---------- Timer ----------
    const handleTimeout = useCallback(() => {
        if (!userAnswer && gameState === QuizState.QUESTION) {
            setGameState(QuizState.RESULT);
        }
    }, [userAnswer, gameState]);

    useEffect(() => {
        if (gameState !== QuizState.QUESTION || !currentQuestion) return;

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
    }, [gameState, currentQuestion, handleTimeout]);

    // ---------- Answer ----------
    const handleAnswer = (answer: string) => {
        if (!currentQuestion || !room || userAnswer) return;

        const spent = currentQuestion.timeLimit - timeLeft;
        setTimeSpent(spent);
        setUserAnswer(answer);
        setGameState(QuizState.RESULT);

        send(`/app/game/answer`, {
            roomId: room.id,
            userId,
            questionId: currentQuestion.questionId,
            selectedOption: answer,
        });
    };

    const renderContent = () => {
        const questionForCard: QuizQuestion = {
            questionId: currentQuestion?.questionId ?? 0,
            question: currentQuestion?.question ?? "N/A",
            roundNumber: currentQuestion?.roundNumber ?? 0,
            totalRounds: currentQuestion?.totalRounds ?? 0,
            difficulty: currentQuestion?.difficulty ?? "",
            options: currentQuestion?.options ?? [],
            timeLimit: currentQuestion?.timeLimit ?? 30,
            topic: currentQuestion?.topic ?? "",
        };

        switch (gameState) {
            case QuizState.Initial:
                return (
                    <div className="flex flex-col items-center justify-center p-12 h-screen">
                        <CountdownTimer
                            secondsBeforeStart={5}
                            onExpire={() => {
                                if (!currentQuestion)
                                    setGameState(QuizState.LOADING);
                            }}
                        />
                    </div>
                );

            case QuizState.QUESTION:
                return (
                    <motion.div
                        key="quiz"
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full"
                    >
                        <QuestionCard
                            question={questionForCard}
                            currentQuestion={questionForCard.roundNumber}
                            totalQuestions={questionForCard.totalRounds}
                            onAnswer={handleAnswer}
                            timeLeft={timeLeft}
                            timeLimit={questionForCard.timeLimit}
                            disabled={!!userAnswer}
                        />
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
                        className="w-full"
                    >
                        <ResultCard
                            isCorrect={isCorrect}
                            userAnswer={userAnswer || "Time Out"}
                            question={questionForCard}
                            timeSpent={timeSpent}
                        />
                    </motion.div>
                );

            case QuizState.LOADING:
                return (
                    <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4" />
                        <p className="text-zinc-400 font-medium">
                            Waiting for Quiz Master...
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30">
            {/* Main Wrapper */}
            <div className="max-w-[1600px] mx-auto px-4 lg:px-10 pt-24 lg:pt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-16 items-start">
                    {/* LEFT: MAIN QUIZ AREA (Larger weight) */}
                    <main className="w-full lg:flex-[1.8] xl:flex-[2.2] min-w-0">
                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </main>

                    {/* RIGHT: LEADERBOARD (Fixed width) */}
                    <aside className="hidden lg:block w-[360px] xl:w-[420px] sticky top-32 shrink-0">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/20 to-purple-500/0 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl ">
                                <Leaderboard players={players} />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* CHAT LAYER */}
            <Chat />

            {/* MOBILE LEADERBOARD OVERLAY */}
            <AnimatePresence>
                {isLeaderboardOpen && (
                    <div className="fixed inset-0 z-[100] lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setIsLeaderboardOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 200,
                            }}
                            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">
                                    Standings
                                </h2>
                                <button
                                    onClick={() => setIsLeaderboardOpen(false)}
                                    className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <Leaderboard players={players} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MOBILE FLOATING BUTTON */}
            {!isLeaderboardOpen && (
                <button
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="fixed bottom-8 right-8 lg:hidden bg-blue-600 text-white h-16 w-16 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all z-50"
                >
                    <Trophy size={28} />
                </button>
            )}
        </div>
    );
}
