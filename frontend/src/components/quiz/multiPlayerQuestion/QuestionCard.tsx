"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";
import "katex/dist/katex.min.css";
import { QuizQuestion } from "@/components/utils/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "./UiComponents"; // Assuming this is your custom Progress
import { fadeIn } from "@/components/utils/animation";
import { getDifficultyStyles, optionLetters, SmartText } from "../QuestionUtil";


const optionColors = {
    default: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-primary/50",
    selected: "border-primary bg-primary/5 ring-2 ring-primary/20 text-primary font-medium",
    disabled: "opacity-60 grayscale-[0.3] pointer-events-none",
};



export const QuestionCard: React.FC<{
    question: QuizQuestion;
    currentQuestion: number;
    totalQuestions: number;
    onAnswer: (answer: string) => void;
    timeLimit: number;
    timeLeft: number;
    disabled: boolean;
}> = ({
    question,
    currentQuestion,
    totalQuestions,
    onAnswer,
    timeLimit,
    timeLeft,
    disabled,
}) => {
    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const progress = (timeLeft / timeLimit) * 100;
    const isVeryLongQuestion = question.question.length > 180;

    // Reset local selection when question changes
    useEffect(() => {
        setLocalSelected(null);
    }, [question.questionId]);

    const handleOptionClick = (option: string) => {
        if (disabled || timeLeft <= 0) return;
        setLocalSelected(option);
        onAnswer(option);
    };

    

    return (
        <motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit" className="w-full lg:flex-1">
            <Card className={`relative w-full transition-all duration-500 border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-[2rem] overflow-visible bg-gradient-to-b from-card to-zinc-50/50 dark:to-zinc-900/50 mx-auto ${isVeryLongQuestion ? "max-w-5xl" : "max-w-3xl"}`}>
                
                {/* Floating Badge: Question Number */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-full text-sm font-black tracking-widest shadow-xl border-4 border-white dark:border-zinc-900 z-30">
                    ROUND {currentQuestion} / {totalQuestions}
                </div>

                {/* Floating Badge: Difficulty */}
                <div className={`absolute -top-3 -right-3 px-4 py-1.5 rounded-xl border-2 text-[12px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md z-20 transform rotate-3 ${getDifficultyStyles(question.difficulty)}`}>
                    {question.difficulty}
                </div>

                {/* Timer Section */}
                <div className="pt-10 px-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Time Remaining</span>
                        <motion.div 
                            className={`flex items-center gap-1 font-black ${timeLeft <= 5 ? 'text-rose-500' : 'text-primary'}`}
                            animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            <Clock className="w-4 h-4" />
                            {timeLeft}s
                        </motion.div>
                    </div>
                    <Progress value={progress} className={`h-2 rounded-full transition-all duration-1000 ${timeLeft <= 5 ? "[&>div]:bg-rose-500" : "[&>div]:bg-primary"}`} />
                </div>

                <div className={`flex flex-col ${isVeryLongQuestion ? "lg:flex-row lg:items-stretch" : ""}`}>
                    {/* Question Text */}
                    <div className={`${isVeryLongQuestion ? "lg:w-1/2 lg:border-r dark:lg:border-zinc-800" : "w-full"}`}>
                        <CardHeader className="pt-8 pb-6 px-8 lg:px-10">
                            <div className={`font-bold text-zinc-800 dark:text-zinc-100  ${isVeryLongQuestion ? "text-left text-lg sm:text-xl" : "text-center text-xl sm:text-2xl"}`}>
                                <SmartText text={question.question} />
                            </div>
                        </CardHeader>
                    </div>

                    {/* Options Grid */}
                    <div className={`${isVeryLongQuestion ? "lg:w-1/2 flex flex-col justify-center" : "w-full"}`}>
                        <CardContent className="grid gap-3 px-6 sm:px-8 py-6">
                            {question.options.map((option, idx) => (
                                <motion.button
                                    key={option}
                                    disabled={disabled || timeLeft <= 0}
                                    onClick={() => handleOptionClick(option)}
                                    whileHover={!disabled ? { x: 4 } : {}}
                                    whileTap={!disabled ? { scale: 0.98 } : {}}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between text-left group 
                                        ${localSelected === option ? optionColors.selected : optionColors.default}
                                        ${disabled && localSelected !== option ? optionColors.disabled : ""}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border-2 
                                            ${localSelected === option ? "bg-primary text-white border-primary" : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"}`}>
                                            {optionLetters[idx]}
                                        </span>
                                        <span className="text-sm sm:text-base leading-snug">
                                            <SmartText text={option} />
                                        </span>
                                    </div>
                                    {localSelected === option && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </CardContent>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};