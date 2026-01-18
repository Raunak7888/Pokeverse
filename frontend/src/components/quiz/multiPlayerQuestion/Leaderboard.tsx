"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import { MultiplayerPlayersInRoomDto } from "@/components/utils/types";
import { PlayerCard } from "./PlayerCard";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";

export const Leaderboard: React.FC<{ players: MultiplayerPlayersInRoomDto[] }> = ({ players }) => {
    const currentUserId = useAuthStore().user?.id;
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 xl:w-96 flex flex-col gap-4"
        >
            <Card className="relative overflow-visible border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-[2rem] bg-gradient-to-b from-card to-zinc-50/50 dark:to-zinc-900/50">
                
                {/* Floating Header Badge */}
                <div className="absolute -top-4 left-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest shadow-lg border-2 border-white dark:border-zinc-900 z-30 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                    STANDINGS
                </div>

                {/* Header Stats */}
                <div className="p-6 pb-2 pt-8 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Leaderboard</h3>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold">{players.length} Players</span>
                    </div>
                </div>

                {/* Player List */}
                <div className="p-4 space-y-3 max-h-[400px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {sortedPlayers.map((player, index) => (
                            <PlayerCard
                                key={player.userId} // Use userId for stable keys during re-orders
                                player={player}
                                index={index}
                                isHighlighted={player.userId === currentUserId}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Footer hint for mobile */}
                <div className="p-3 text-center border-t border-zinc-100 dark:border-zinc-800 lg:hidden">
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">Scroll to see all players</p>
                </div>
            </Card>
        </motion.div>
    );
};