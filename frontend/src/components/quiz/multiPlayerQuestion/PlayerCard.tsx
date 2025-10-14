// PlayerCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Award } from "lucide-react";
import { Player } from "@/components/utils/types";
import { Card } from "./UiComponents";

// Player Rank Icon Component
export const PlayerRankIcon: React.FC<{ index: number }> = ({ index }) => {
  if (index === 0) return <Crown className="w-10 h-10 text-primary" />;
  if (index === 1) return <Medal className="w-10 h-10 text-primary/70" />;
  if (index === 2) return <Award className="w-10 h-10 text-primary/50" />;
  return (
    <span className=" font-bold w-10 h-10 text-2xl text-foreground/50">
      #{index + 1}
    </span>
  );
};

// Player Card Component
export const PlayerCard: React.FC<{
  player: Player;
  index: number;
  isHighlighted?: boolean;
}> = ({ player, index, isHighlighted = false }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
  >
    <Card
      className={`${
        isHighlighted
          ? "bg-primary/5 border-primary/30 flex flex-row p-3  items-center"
          : "flex flex-row items-center p-3 "
      }`}
    >
      <div className="flex items-center justify-center w-8 mx-4">
        <PlayerRankIcon index={index} />
      </div>
      <img
        src={player.avatarUrl}
        alt={player.name}
        width={30}
        height={30}
        className="rounded-full mr-4"
      />
      <p
        className={`font-medium text-sm truncate mr-auto ${
          isHighlighted ? "text-primary" : "text-foreground"
        }`}
      >
        {player.name}
      </p>

      <motion.div
        key={player.score}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="bg-primary/10 px-3 py-1 rounded-full mr-3"
      >
        <span className="font-bold text-primary text-sm">{player.score}</span>
      </motion.div>
    </Card>
  </motion.div>
);
