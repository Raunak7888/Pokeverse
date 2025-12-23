// WaitingForOthers.tsx
import React from "react";
import { motion } from "framer-motion";
import {
    Users,
    CheckCircle2,
    XCircle,
    Clock as ClockIcon,
} from "lucide-react";
import { Badge, Card } from "./UiComponents";
import { MultiplayerPlayersInRoomDto } from "@/components/utils/types";
import { scaleIn } from "@/components/utils/animation";

export const WaitingForOthers: React.FC<{
    timeleft: number;
    isCorrect: boolean;
    players: MultiplayerPlayersInRoomDto[];
}> = ({ timeleft, isCorrect }) => {
    const statusText = isCorrect ? "text-success" : "text-destructive";

    return (
        <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="w-full max-w-md mx-auto"
        >
            <Card className="overflow-hidden">
                <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-6">
                    {/* Icon pulse */}
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.6,
                            ease: "easeInOut",
                        }}
                        aria-hidden
                    >
                        <Users className="w-16 h-16 text-primary" />
                    </motion.div>

                    {/* Heading */}
                    <h2 className="text-xl sm:text-2xl font-semibold leading-snug">
                        Waiting for other players
                    </h2>

                    {/* Subtitle */}
                    <p className="text-sm text-foreground/70 max-w-[40ch]">
                        Everyone must finish answering before the next round
                        begins.
                    </p>

                    {/* Timer + correctness chip */}
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 border border-primary/30">
                            <ClockIcon className="w-4 h-4" aria-hidden />
                            <span className="font-medium">{timeleft}s</span>
                        </div>

                        <Badge variant="outline">
                            <span
                                className={`flex items-center gap-2 ${statusText}`}
                            >
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2
                                            className="w-4 h-4"
                                            aria-hidden
                                        />
                                        Correct
                                    </>
                                ) : (
                                    <>
                                        <XCircle
                                            className="w-4 h-4"
                                            aria-hidden
                                        />
                                        Wrong
                                    </>
                                )}
                            </span>
                        </Badge>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};
