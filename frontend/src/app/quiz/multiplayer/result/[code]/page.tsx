"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
    Trophy,
    Crown,
    Medal,
    Star,
    Sparkles,
    TrendingUp,
    Award,
    Zap,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useRouter } from "next/navigation";
import { useMultiplayerRStore } from "@/store/useMultiplayerResult";
import { Button } from "@/components/ui/button";

const ResultLeaderboard = () => {
    const { code } = useParams<{ code: string }>();
    const router = useRouter();
    const userId = useAuthStore((s) => s.getUser()?.id);
    const fetchResults = useMultiplayerRStore((s) => s.fetchResults);

    const roomResult = useMultiplayerRStore((s) => s.resultsByRoom[code]);

    const players = useMultiplayerRStore((s) => s.resultsByRoom[code]?.players);

    const currentUser = useMultiplayerRStore(
        (s) => s.resultsByRoom[code]?.currentUser,
    );

    const userRank = useMultiplayerRStore(
        (s) => s.resultsByRoom[code]?.userRank,
    );

    const loading = useMultiplayerRStore((s) => s.loading);

    useEffect(() => {
        if (userRank != null && userRank<3){const duration = 3 * 1000;
        const end = Date.now() + duration;
        const colors = ["#ee4035", "#ffffff", "#2b7fff"];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();}
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        if (!code || !userId) return;

        fetchResults(code, userId).catch(() => {
            toast.error("Failed to load leaderboard");
        });
    }, [code, userId, fetchResults]);

    if (!roomResult) {
        return <div>No results found</div>;
    }

    /**
     * Returns the appropriate icon based on the rank position.
     */
    const getRankIcon = (position: number) => {
        if (position === 1) {
            return (
                <Crown
                    className="w-6 h-6 text-yellow-400 animate-pulse"
                    key="crown"
                />
            );
        } else if (position === 2) {
            return (
                <Medal className="w-5 h-5 text-gray-300" key="silver-medal" />
            );
        } else if (position === 3) {
            return (
                <Medal className="w-5 h-5 text-orange-400" key="bronze-medal" />
            );
        } else {
            return (
                <span className="text-gray-500 font-bold" key="rank-num">
                    #{position}
                </span>
            );
        }
    };

    /**
     * Returns a special glow effect class for top 3 ranks.
     */
    const getRankGlow = (position: number) => {
        if (position === 1) return "shadow-[0_0_30px_rgba(250,204,21,0.4)]"; // Gold/Yellow glow
        if (position === 2) return "shadow-[0_0_20px_rgba(203,213,225,0.3)]"; // Silver/Gray glow
        if (position === 3) return "shadow-[0_0_20px_rgba(251,146,60,0.3)]"; // Bronze/Orange glow
        return "";
    };

    const getRankBorder = (position: number) => {
        if (position === 1)
            return "bg-gradient-to-r from-yellow-400/50 to-yellow-400";
        if (position === 2)
            return "bg-gradient-to-r from-gray-300/50 to-gray-300";
        if (position === 3)
            return "bg-gradient-to-r from-orange-400/50 to-orange-400";
        return "bg-gradient-to-r from-primary/50 to-primary";
    };
    // Framer Motion variants for the main list container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                // Stagger delay for children (each player item)
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    // Framer Motion variants for each list item (player)
    const itemVariants = {
        hidden: {
            opacity: 0,
            x: -20,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                type: "spring" as const, // Spring physics for a bouncier look
                stiffness: 100,
                damping: 12,
            },
        },
    };

    const onRestart = () => {
        router.push("/quiz");
    };

    // Find the current user's data for the fixed summary section

    return (
        <div
            className={
                players.length > 2
                    ? `min-h-screen mt-15 bg-background p-4 sm:p-6 lg:p-8`
                    : ` min-h-[80vh] mt-15 bg-background p-4 sm:p-6 lg:p-8`
            }
        >
            <Toaster position="top-center" richColors />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-8 sm:mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-center mb-4">
                        <motion.div
                            className="relative"
                            animate={{ scale: [1, 1.05, 1] }} // Pulsing effect
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
                            <motion.div
                                className="absolute -top-2 -right-2"
                                animate={{ rotate: 360 }} // Spinning effect
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            >
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                            </motion.div>
                        </motion.div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                        Quiz Results
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base">
                        Final standings after an epic battle of minds!
                    </p>
                </motion.div>

                {/* Leaderboard Container */}
                {loading && !roomResult ? (
                    // Loading State
                    <motion.div
                        className="flex justify-center items-center h-64"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="relative">
                            <motion.div
                                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                                animate={{ rotate: 360 }} // Spinning loader
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                            <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                        </div>
                    </motion.div>
                ) : (
                    // Loaded State
                    <>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3 sm:space-y-4 "
                        >
                            {players.map((player, index) => {
                                const position = index + 1;
                                const isCurrentUser = player.id === userId;

                                return (
                                    <motion.div
                                        key={player.id}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02, x: 10 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                                            relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6
                                            ${
                                                isCurrentUser
                                                    ? "bg-primary/10 "
                                                    : "bg-background border border-gray-200 dark:border-gray-800"
                                            }
                                            ${getRankGlow(position)}
                                            transition-all duration-300 cursor-pointer
                                        `}
                                    >
                                        {/* Animated background for current user */}
                                        {isCurrentUser && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                                                animate={{
                                                    x: ["-100%", "100%"], // Shimmer animation
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            />
                                        )}

                                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            {/* Left side - Rank and Player Info */}
                                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                                <motion.div
                                                    className="flex-shrink-0"
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{
                                                        duration: 0.5,
                                                    }}
                                                >
                                                    {getRankIcon(position)}
                                                </motion.div>

                                                <div className="flex items-center gap-3 flex-1 sm:flex-none">
                                                    <motion.div
                                                        className={`
                                                            w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base
                                                            ${
                                                                position <= 3
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-gray-200 dark:bg-gray-700"
                                                            }
                                                        `}
                                                        whileHover={{
                                                            scale: 1.1,
                                                        }}
                                                    >
                                                        <Image
                                                            src={
                                                                player.avatar ||
                                                                "/default-avatar.png"
                                                            }
                                                            alt={player.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                                        />
                                                    </motion.div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-foreground text-sm sm:text-base">
                                                                {player.name}
                                                            </p>
                                                            {isCurrentUser && (
                                                                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                                                    YOU
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Star className="w-3 h-3" />
                                                                {player.accuracy.toFixed(
                                                                    2,
                                                                )}{" "}
                                                                % accuracy
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <TrendingUp className="w-3 h-3" />
                                                                {player.streak}{" "}
                                                                streak
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side - Score */}
                                            <motion.div
                                                className="flex items-center gap-2 ml-auto sm:ml-0"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                                <span
                                                    className={`
                                                        font-bold text-xl sm:text-2xl
                                                        ${
                                                            position === 1
                                                                ? "text-yellow-400"
                                                                : position === 2
                                                                  ? "text-gray-400"
                                                                  : position ===
                                                                      3
                                                                    ? "text-orange-400"
                                                                    : "text-foreground"
                                                        }
                                                    `}
                                                >
                                                    {player.score.toLocaleString()}
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* Progress bar for top 3 */}
                                        {position <= 3 && (
                                            <motion.div
                                                className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${getRankBorder(
                                                    position,
                                                )}`}
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{
                                                    delay: 0.5 + index * 0.1, // Staggered entry for the bars
                                                    duration: 0.8,
                                                }}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Stats Summary - Fixed at the bottom for visibility */}
                        {userRank && currentUser && (
                            <motion.div
                                className="fixed bottom-0 left-0 right-0 w-full p-4 sm:p-6 bg-card border-t border-gray-200 dark:border-gray-800 shadow-2xl z-10"
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div className="max-w-4xl mx-auto">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl sm:text-3xl font-bold text-primary">
                                                {userRank}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Your Rank
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-2xl sm:text-3xl font-bold text-foreground">
                                                {players.length}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Total Players
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-2xl sm:text-3xl font-bold text-foreground ">
                                                {currentUser.accuracy.toFixed(
                                                    2,
                                                )}
                                                %
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Accuracy
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-2xl sm:text-3xl font-bold text-foreground">
                                                {currentUser?.score.toLocaleString()}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Your Score
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
            {players.length < 2 && <div className="h-32"></div>}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-40 absolute bottom-7 hidden md:block z-10 right-10 " // Added more top margin for separation
            >
                <Button
                    className="w-full p-7 text-base rounded-3xl font-bold" // Removed specific text-foreground and used bold
                    onClick={onRestart}
                >
                    <Star className="w-4 h-4 mr-2" />
                    Play Again
                </Button>
            </motion.div>
        </div>
    );
};

export default ResultLeaderboard;
