// Leaderboard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { MultiplayerPlayersInRoomDto } from "@/components/utils/types";
import { PlayerCard } from "./PlayerCard";
import { Card } from "./UiComponents";

export const Leaderboard: React.FC<{ players: MultiplayerPlayersInRoomDto[] }> = ({ players }) => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full lg:w-96"
        >
            <Card className="h-full">
                <div className="p-4 border-b border-foreground/10">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Leaderboard</h3>
                    </div>
                </div>
                <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
                    {sortedPlayers.map((player, index) => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            index={index}
                            isHighlighted={player.name === "You"}
                        />
                    ))}
                </div>
            </Card>
        </motion.div>
    );
};
