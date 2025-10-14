// WaitingForOthers.tsx

import React from "react";
import { motion } from "framer-motion";
import { Users, Hourglass, CheckCircle2, XCircle, Clock } from "lucide-react";
import { scaleIn } from "./quizData";
import { Badge, Card } from "./UiComponents";
import { Player } from "@/components/utils/types";

export const WaitingForOthers: React.FC<{
  timeleft: number;
  isCorrect: boolean;
  players: Player[];
}> = ({ timeleft, isCorrect }) => (
  <motion.div
    variants={scaleIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
    className="w-full max-w-md"
  >
    <Card>
      <div className="flex flex-col items-center justify-center p-12">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Users className="w-16 h-16 text-primary mb-6" />
        </motion.div>
        
        <h2 className="text-2xl font-semibold mb-4 text-center gap-4 flex items-center ">
          Waiting for others... <span className="flex flex-row items-center gap-4 p-2 rounded-2xl bg-primary/50 w-20 justify-center"><Clock className=""/>{timeleft}</span>
         
        </h2>

        <Badge variant="default">
          {isCorrect ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Correct!</>
          ) : (
            <><XCircle className="w-4 h-4 mr-2" /> Wrong</>
          )}
        </Badge>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mt-8"
        >
          <Hourglass className="w-10 h-10 text-primary" />
        </motion.div>
      </div>
    </Card>
  </motion.div>
);