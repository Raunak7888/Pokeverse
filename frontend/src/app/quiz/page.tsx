"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BadgePlus, Gamepad2, Users } from "lucide-react";
import Multiplayer from "@/components/quiz/Multiplayer";
import MultiplayerUserHistory from "@/components/quiz/multiPlayerQuestion/PreviousGames";
import { useRouter } from "next/navigation";
import { Button } from "@/components/quiz/multiPlayerQuestion/UiComponents";

export default function QuizPage() {
    const [mode, setMode] = useState<"single" | "multi" | "Nothing">("Nothing");
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (containerRef.current?.contains(target)) return;
            if (
                document
                    .querySelector("[data-radix-popper-content-wrapper]")
                    ?.contains(target)
            )
                return;

            setMode("Nothing");
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (mode === "single") {
            router.push("/quiz/singleplayer/create");
        }
    }, [mode, router]);
    const cardVariants = {
        initial: { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
        hover: { scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" },
        selected: { scale: 1.05, boxShadow: "0 12px 24px rgba(0,0,0,0.2)" },
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
            {/* Header */}
            {/* Header */}
            <motion.div
                className="mb-10 text-center"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <motion.h1
                    className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-primary via-chart-1 to-chart-3 bg-clip-text text-transparent tracking-tight"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    PokeQuiz
                </motion.h1>

                <motion.p
                    className="text-muted-foreground mt-2 text-lg italic"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                >
                    Test your Pokémon knowledge and prove you’re a true master!
                </motion.p>
            </motion.div>

            {/* Cards */}
            <motion.div
                ref={containerRef}
                className="w-full max-w-4xl flex flex-col md:flex-row justify-center items-center gap-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Single Player Card */}
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    whileHover="hover"
                    animate={mode === "single" ? "selected" : "initial"}
                    onClick={() => setMode("single")}
                    className={`cursor-pointer rounded-2xl border-2 transition-colors ${
                        mode === "single"
                            ? "border-primary"
                            : "border-border hover:border-primary"
                    }`}
                >
                    <Card className="rounded-2xl border-0 w-100  shadow-none">
                        <CardHeader className="flex items-center space-x-3">
                            <motion.div
                                initial={{ rotate: -15, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Gamepad2 className="h-6 w-6 text-primary" />
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                            >
                                <CardTitle className="text-xl">
                                    Single Player
                                </CardTitle>
                            </motion.div>
                        </CardHeader>

                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Test your Pokémon knowledge with customizable
                                solo challenges.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Multiplayer Card */}
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    whileHover="hover"
                    animate={mode === "multi" ? "selected" : "initial"}
                    onClick={() => setMode("multi")}
                    className={`cursor-pointer rounded-2xl border-2 transition-colors ${
                        mode === "multi"
                            ? "border-primary"
                            : "border-border hover:border-primary"
                    }`}
                >
                    <Card className="rounded-2xl border-0 w-100 shadow-none">
                        <CardHeader className="flex items-center space-x-3">
                            <motion.div
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Users className="h-6 w-6 text-primary" />
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                            >
                                <CardTitle className="text-xl">
                                    Multiplayer
                                </CardTitle>
                            </motion.div>
                        </CardHeader>

                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Create a room and challenge your friends in real
                                time.
                            </p>

                            <AnimatePresence>
                                {mode === "multi" && (
                                    <motion.div
                                        key="multi-options"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <Multiplayer />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
            <div className="absolute top-20 right-6">
                <MultiplayerUserHistory />
            </div>
        </div>
    );
}
