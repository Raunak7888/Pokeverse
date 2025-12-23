// PlayerCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { MultiplayerPlayersInRoomDto } from "@/components/utils/types";
import { Card } from "./UiComponents";
import Image from "next/image";

export const PlayerRankIcon: React.FC<{ index: number }> = ({ index }) => {
    const colors = [
        "text-yellow-500",
        "text-gray-400",
        "text-orange-600",
    ];
    
    const color = colors[index] ?? "text-foreground/50";

    return (
        <span className={`font-bold text-2xl ${color}`}>
            #{index + 1}
        </span>
    );
};

// Player Card Component
export const PlayerCard: React.FC<{
    player: MultiplayerPlayersInRoomDto;
    index: number;
    isHighlighted?: boolean;
}> = ({ player, index, isHighlighted = false }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
    >
        <Card
            className={`flex flex-row items-center p-3 ${
                isHighlighted ? "bg-primary/5 border-primary/30" : ""
            }`}
        >
            {/* Rank */}
            <div className="flex items-center justify-center w-12">
                <PlayerRankIcon index={index} />
            </div>
            
            {/* Avatar */}
            <Image
                src={player.avatar || '/Avatarpokeball.png'}
                alt={player.name}
                width={36}
                height={36}
                className="rounded-full mx-3"
            />

            {/* Name */}
            <p
                className={`font-medium text-sm truncate flex-1 ${
                    isHighlighted ? "text-primary" : "text-foreground"
                }`}
            >
                {player.name}
            </p>

            {/* Score */}
            <motion.div
                key={player.score}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="bg-primary/10 px-3 py-1 rounded-full flex items-center justify-center"
            >
                <span className="font-bold text-primary text-sm">
                    {player.score}
                </span>
            </motion.div>
        </Card>
    </motion.div>
);
