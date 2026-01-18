"use client";

import React from "react";
import { motion } from "framer-motion";
import { MultiplayerPlayersInRoomDto } from "@/components/utils/types";
import Image from "next/image";
import { Crown } from "lucide-react";

export const PlayerCard: React.FC<{
    player: MultiplayerPlayersInRoomDto;
    index: number;
    isHighlighted?: boolean;
}> = ({ player, index, isHighlighted = false }) => {
    
    // Styling for Top 3
    const isTopThree = index < 3;
    const rankColors = [
        "bg-yellow-500 border-yellow-400 shadow-yellow-500/20", // Gold
        "bg-zinc-400 border-zinc-300 shadow-zinc-400/20",      // Silver
        "bg-orange-600 border-orange-500 shadow-orange-600/20" // Bronze
    ];

    return (
        <motion.div
            layout // This makes the card slide smoothly when the rank changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`relative group flex items-center p-3 rounded-2xl border-2 transition-all duration-300
                ${isHighlighted 
                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)] z-10" 
                    : "bg-white dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }
            `}
        >
            {/* Rank Badge */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-b-4 
                ${isTopThree ? `${rankColors[index]} text-white` : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"}
            `}>
                {index === 0 ? <Crown className="w-5 h-5" /> : index + 1}
            </div>
            
            {/* Avatar with Status Ring */}
            <div className="relative mx-3">
                <div className={`absolute -inset-1 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${isHighlighted ? 'bg-primary/50' : 'bg-zinc-400'}`} />
                <Image
                    src={player.avatar || '/Avatarpokeball.png'}
                    alt={player.name}
                    width={40}
                    height={40}
                    className="relative rounded-full border-2 border-white dark:border-zinc-900 object-cover"
                />
            </div>

            {/* Name & Label */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm truncate ${isHighlighted ? "text-primary" : "text-zinc-700 dark:text-zinc-200"}`}>
                        {player.name}
                    </p>
                    {isHighlighted && (
                        <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md font-black uppercase">YOU</span>
                    )}
                </div>
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Player</p>
            </div>

            {/* Score Badge */}
            <motion.div
                key={player.score}
                initial={{ scale: 1.2, color: "#3b82f6" }}
                animate={{ scale: 1, color: "inherit" }}
                className={`ml-2 px-3 py-1.5 rounded-xl font-black text-sm shadow-inner
                    ${isHighlighted ? "bg-primary text-primary-foreground" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}
                `}
            >
                {player.score.toLocaleString()}
            </motion.div>
        </motion.div>
    );
};