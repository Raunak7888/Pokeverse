// FinalResults.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import { Button, Card, Progress } from "./UiComponents";
import { scaleIn } from "@/components/utils/animation";
import { MultiplayerPlayersInRoomDto } from "@/components/utils/types";

// --- Sub-Component: LeaderboardItem ---

interface LeaderboardItemProps {
    player: MultiplayerPlayersInRoomDto;
    rank: number;
    isUser: boolean;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ player, rank, isUser }) => {
    let medalEmoji = "";
    if (rank === 1) medalEmoji = "🥇";
    else if (rank === 2) medalEmoji = "🥈";
    else if (rank === 3) medalEmoji = "🥉";

    return (
        <Card
            key={player.id ?? `${player.name}-${rank}`}
            className={`flex items-center gap-3 p-2 text-sm transition-colors duration-200 ${
                isUser ? "bg-primary/10 border-primary/30" : ""
            }`}
        >
            {/* Rank */}
            <div className="w-8 text-center font-semibold text-foreground/70">
                {medalEmoji ? (
                    <span className={rank === 1 ? "text-yellow-500" : rank === 2 ? "text-slate-400" : "text-amber-700"}>
                        {medalEmoji}
                    </span>
                ) : (
                    `#${rank}`
                )}
            </div>

            {/* Avatar */}
            <Image
                src={player.avatar}
                alt={player.name}
                width={30} // Smaller avatar
                height={30}
                className="rounded-full object-cover"
            />

            {/* Name */}
            <p className="flex-1 font-medium truncate">{player.name}</p>

            {/* Score */}
            <div className="font-bold text-primary text-sm">{player.score}</div>
        </Card>
    );
};

// --- Main Component: FinalResults ---

export const FinalResults: React.FC<{
    totalScore: number;
    players: MultiplayerPlayersInRoomDto[];
    onRestart: () => void;
}> = ({ totalScore, players, onRestart }) => {
    // 1. Memoize sorting to prevent unnecessary re-sorts
    const sorted = useMemo(() => {
        return [...players].sort((a, b) => b.score - a.score);
    }, [players]);

    const user = sorted.find((p) => p.name === "You");
    const userRank = user ? sorted.findIndex((p) => p.name === "You") + 1 : null;

    // 2. Corrected progress calculation: score relative to total possible score
    const progressValue = totalScore > 0 && user?.score ? (user.score / totalScore) * 100 : 0;
    const roundedProgress = Math.round(progressValue);

    const message = useMemo(() => {
        if (!userRank) return "";
        if (userRank === 1) return "Excellent performance. You crushed the competition!";
        if (userRank === 2) return "Strong result. Keep pushing to take the top spot!";
        if (userRank === 3) return "Good effort. Review the questions and make a strong comeback.";
        return "Stay consistent. Improvement follows when you keep trying.";
    }, [userRank]);
    
    // Log statements are kept, but should be removed in a production environment
    console.log("Total Score:", totalScore);
    console.log("User Score:", user?.score);
    console.log("Progress Value:", progressValue);

    return (
        <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="w-full max-w-5xl mx-auto xl:mt-[9vh] mt-[45vh] p-4"
        >
            <Card className="overflow-hidden">
                <div className="h-1 bg-primary" aria-hidden />

                <div className="p-4 md:p-6 flex flex-col items-center gap-4 md:gap-6">
                    <div className="text-center mb-2">
                        <h2 className="text-2xl font-bold">Final Results</h2>
                        <p className="mt-1 text-xs text-foreground/60">
                            Your performance summary and the leaderboard.
                        </p>
                    </div>

                    {/* MAIN CONTENT GRID */}
                    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 md:gap-8">
                        {/* LEFT SIDE — USER SUMMARY (Optimized Layout) */}
                        {user && (
                            <Card className="relative overflow-hidden border-secondary/30">
                                {/* Blurred Background & Overlay */}
                                <div className="absolute top-0 left-0 w-full h-full">
                                    <Image
                                        src={user.avatar}
                                        alt={`${user.name}'s blurred background`}
                                        fill // Use 'fill' instead of 'layout="fill"' in Next.js 13+
                                        objectFit="cover" // Use 'objectFit="cover"' instead of 'objectFit'
                                        className="filter opacity-50 transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 bg-background/50"></div>
                                </div>

                                {/* Foreground Content */}
                                <div className="p-4 md:p-5 relative z-10 flex flex-col items-center">
                                    {/* Avatar & Title */}
                                    <div className="flex flex-col items-center mb-4">
                                        <Image
                                            src={user.avatar}
                                            alt={user.name}
                                            width={70} 
                                            height={70}
                                            className="object-cover rounded-full border-3 border-primary shadow-xl ring-1 ring-primary/50"
                                        />
                                        <p className="text-lg font-extrabold mt-2 text-foreground tracking-wide">
                                            YOUR PERFORMANCE
                                        </p>
                                    </div>

                                    <hr className="w-3/4 border-t border-secondary/50 mb-4" />

                                    {/* Metrics (Score and Rank - Side-by-Side) */}
                                    <div className="flex justify-around w-full mb-4">
                                        {/* Score Metric */}
                                        <div className="flex flex-col items-center">
                                            <p className="text-3xl font-black text-primary drop-shadow-lg">
                                                {user.score}
                                            </p>
                                            <p className="text-xs font-medium text-foreground/70 uppercase tracking-wider mt-0.5">
                                                Score
                                            </p>
                                        </div>

                                        {/* Vertical Separator */}
                                        <div className="w-px bg-secondary/70 mx-3 h-full"></div> 

                                        {/* Rank Metric */}
                                        <div className="flex flex-col items-center">
                                            <p className="text-3xl font-black text-primary drop-shadow-lg">
                                                #{userRank}
                                            </p>
                                            <p className="text-xs font-medium text-foreground/70 uppercase tracking-wider mt-0.5">
                                                Rank
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full relative h-2.5 mb-5"> {/* Increased bottom margin for text */}
                                        <Progress
                                            value={progressValue}
                                            className="h-full bg-secondary/30 rounded-full"
                                        />
                                        {/* Combined percentage display for better vertical spacing */}
                                        <p className="absolute top-full left-0 text-[10px] font-semibold text-foreground/70 mt-1">
                                            Score: **{roundedProgress}%** of maximum possible total.
                                        </p>
                                    </div>

                                    {/* Motivational Message (Bottom Accent) */}
                                    <div className="mt-8 pt-3 w-full border-t border-primary/20">
                                        <p className="text-center text-sm text-primary font-semibold italic">
                                            <span className="text-xl font-serif mr-0.5">“</span>
                                            {message}
                                            <span className="text-xl font-serif ml-0.5">”</span>
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* RIGHT SIDE — LEADERBOARD */}
                        <div className="border border-secondary rounded-xl p-4"> {/* Adjusted border/padding */}
                            <h3 className="text-md font-bold mb-3 text-center lg:text-left text-foreground">
                                Leaderboard 🏆
                            </h3>

                            <div
                                // Tailwind/Shadcn pattern for scrollbar styling
                                className="space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 max-h-[350px]" // Increased max-height
                            >
                                {sorted.map((player, index) => (
                                    <LeaderboardItem
                                        key={player.id ?? `${player.name}-${index}`}
                                        player={player}
                                        rank={index + 1}
                                        isUser={player.name === "You"}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PLAY AGAIN BUTTON */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full lg:w-1/2 mt-8" // Added more top margin for separation
                    >
                        <Button
                            className="w-full text-base font-bold" // Removed specific text-foreground and used bold
                            onClick={onRestart}
                        >
                            <Star className="w-4 h-4 mr-2" />
                            Play Again
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
};  