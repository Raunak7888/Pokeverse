"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResultProps {
  isCorrect: boolean;
  onNext: () => void;
}

const Result: React.FC<ResultProps> = ({ isCorrect, onNext }) => {
  return (
    <div className="flex items-center justify-center w-full p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="w-full max-w-lg"
      >
        <Card
          className={`rounded-3xl shadow-2xl border-2 p-6 md:p-10 text-center backdrop-blur-xl
            ${isCorrect
              ? "bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-900/40 border-green-400"
              : "bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-900/40 border-red-400"}`}
        >
          <CardContent className="flex flex-col items-center space-y-8">
            {/* Icon + Title */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1.2, 1] }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="flex flex-col items-center space-y-3"
            >
              {isCorrect ? (
                <CheckCircle2 className="w-16 h-16 text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
              ) : (
                <XCircle className="w-16 h-16 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
              )}

              <h1
                className={`text-4xl md:text-5xl font-[Piedra] tracking-wide 
                  ${isCorrect
                    ? "text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                    : "text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]"}`}
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </h1>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl font-[Mogra] text-gray-200"
            >
              {isCorrect
                ? "Awesome! You nailed it 🎉"
                : "Don’t worry, you’ll crush the next one!"}
            </motion.p>

            {/* Next Button */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-full flex justify-center"
            >
              <Button
                onClick={onNext}
                size="lg"
                className={`px-10 py-6 rounded-2xl text-lg font-bold shadow-xl transition-all
                  ${isCorrect
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/40"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/40"}`}
              >
                Next
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Result;
