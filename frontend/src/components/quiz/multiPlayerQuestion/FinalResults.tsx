// FinalResults.tsx

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { scaleIn, quizQuestions } from "./quizData";
import Image from "next/image";
import { Player } from "@/components/utils/types";
import { Button, Card, Progress } from "./UiComponents";

export const FinalResults: React.FC<{
  players: Player[];
  onRestart: () => void;
}> = ({ players, onRestart }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const userPlayer = sortedPlayers.find((p) => p.name === "You");
  const userRank = sortedPlayers.findIndex((p) => p.name === "You") + 1;

  const getMotivationalMessage = () => {
    if (userRank === 1) return "Champion! You're unstoppable!";
    if (userRank === 2) return "So close! One more try for gold!";
    if (userRank === 3) return "Great effort! You can do better!";
    return "Keep practicing! You'll get there!";
  };

  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg"
    >
      <Card>
        <div className="h-1 bg-gradient-to-r from-primary via-green-500 to-primary" />

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="w-20 h-20 text-primary mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          </div>

          {userPlayer && (
            <Card className="bg-primary/5 border-primary/30 mb-6">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <img
                    src={userPlayer.avatarUrl}
                    alt={userPlayer.name}
                    width={64} // w-16 = 64px in tailwind
                    height={64} // h-16 = 64px in tailwind
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-bold text-lg">You</p>
                    <p className="text-sm text-foreground/70">
                      Rank #{userRank}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="text-4xl  font-bold text-primary">
                  {userPlayer.score}/{quizQuestions.length}
                </div>
                <Progress
                  value={(userPlayer.score / quizQuestions.length) * 100}
                  className="h-3  mb-4"
                />
                <p className="text-center pl-5 font-medium text-primary">
                  {getMotivationalMessage()}
                </p>
              </div>
            </Card>
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={onRestart} className="w-full">
              <Star className="w-5 h-5" />
              Play Again
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
