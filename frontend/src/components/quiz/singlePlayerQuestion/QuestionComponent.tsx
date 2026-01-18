"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "katex/dist/katex.min.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Question } from "@/components/utils/types";
import { useSinglePlayerQuestionsStore } from "@/store/useSinglePlayerQuestionsStore";
import { useSinglePlayerSessionStore } from "@/store/useSinglePlayerSessionStore";
import api from "@/lib/axios";
import { getDifficultyStyles, optionLetters, SmartText } from "../QuestionUtil";


const optionColors = {
    default: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-primary/50",
    selected: "border-primary bg-primary/5 ring-2 ring-primary/20 text-primary font-medium",
    correct: "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200/50",
    wrong: "bg-rose-500 border-rose-600 text-white shadow-rose-200/50",
    faded: "opacity-40 grayscale-[0.5] pointer-events-none",
};


export default function QuizCard({ question, onSubmit, onNext }: { 
    question: Question; 
    onSubmit: (isCorrect: boolean) => void; 
    onNext: () => void; 
}) {
    const [selected, setSelected] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const { session } = useSinglePlayerSessionStore();

    // Logic to determine if we should split the layout
    const isVeryLongQuestion = question.question.length > 150;

    useEffect(() => {
        setSelected(null);
        setSubmitted(false);
    }, [question.id]);

    const handleSubmit = async () => {
        if (!selected || submitted) return;
        try {
            const res = await api.post("/v1/api/quiz/single-player/attempts/submit", {
                questionId: question.id,
                selectedAnswer: selected,
                sessionId: session?.sessionId,
            });
            const data = res.data;
            useSinglePlayerQuestionsStore.getState().updateQuestionAttempt(
                data.questionId, data.selectedAnswer, data.isCorrect, data.CorrectAnswer
            );
            setSubmitted(true);
            onSubmit(data.isCorrect);
        } catch (err) {
            console.error("Submit failed:", err);
        }
    };

    const getOptionStyles = (option: string) => {
        if (!submitted) return option === selected ? optionColors.selected : optionColors.default;
        if (option === question.answer) return optionColors.correct;
        if (option === selected && !question.isCorrect) return optionColors.wrong;
        return optionColors.faded;
    };

    

    return (
        <Card className={`relative w-full transition-all duration-500 border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-[2rem] overflow-visible bg-gradient-to-b from-card to-zinc-50/50 dark:to-zinc-900/50 
            ${isVeryLongQuestion ? "max-w-5xl" : "max-w-2xl"}`}>
            
            {/* Header Badges */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-full text-sm font-black tracking-widest shadow-xl border-4 border-white dark:border-zinc-900 z-30">
                QUESTION {question.questionNo}
            </div>

            <div className={`absolute -top-3 -right-3 px-4 py-1.5 rounded-xl border-2 text-[14px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md z-20 transform rotate-3 ${getDifficultyStyles(question.difficulty)}`}>
                {question.difficulty}
            </div>

            {/* Split Layout Logic */}
            <div className={`flex flex-col ${isVeryLongQuestion ? "lg:flex-row lg:items-stretch" : ""}`}>
                
                {/* Left Side: Question */}
                <div className={`${isVeryLongQuestion ? "lg:w-1/2 lg:border-r dark:lg:border-zinc-800" : "w-full"}`}>
                    <CardHeader className="pt-12 pb-6 px-8 lg:px-12">
                        <div className={`font-bold text-zinc-800 dark:text-zinc-100 leading-relaxed text-center ${isVeryLongQuestion ? "lg:text-left text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}>
                            <SmartText text={question.question} />
                        </div>
                    </CardHeader>
                </div>

                {/* Right Side: Options & Actions */}
                <div className={`${isVeryLongQuestion ? "lg:w-1/2 flex flex-col justify-center" : "w-full"}`}>
                    <CardContent className="grid gap-3 px-6 sm:px-8 py-6">
                        {question.options.map((option, idx) => {
                            const isCorrect = submitted && option === question.answer;
                            const isWrong = submitted && option === selected && !question.isCorrect;

                            return (
                                <motion.div key={option} whileHover={!submitted ? { x: 4 } : {}} whileTap={!submitted ? { scale: 0.98 } : {}}>
                                    <button
                                        disabled={submitted}
                                        onClick={() => setSelected(option)}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between text-left group ${getOptionStyles(option)}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border-2 ${selected === option ? "bg-primary text-white border-primary" : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"}`}>
                                                {optionLetters[idx]}
                                            </span>
                                            <span className="text-sm sm:text-base leading-snug">
                                                <SmartText text={option} />
                                            </span>
                                        </div>
                                        <AnimatePresence>
                                            {(isCorrect || isWrong) && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </CardContent>

                    <CardFooter className="pt-2 px-8">
                        <Button
                            onClick={submitted ? onNext : handleSubmit}
                            disabled={!selected}
                            size="lg"
                            className={`w-full py-7 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg ${submitted ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-primary text-primary-foreground"}`}
                        >
                            {submitted ? <>Continue <ArrowRight className="ml-2 w-5 h-5" /></> : "Submit Answer"}
                        </Button>
                    </CardFooter>
                </div>
            </div>
        </Card>
    );
}