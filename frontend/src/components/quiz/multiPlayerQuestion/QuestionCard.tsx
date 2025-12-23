// QuestionCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Target, Zap, Clock } from "lucide-react"; // Added Clock icon
import { QuizQuestion } from "@/components/utils/types";
import { Card, Progress } from "./UiComponents";
import { fadeIn } from "@/components/utils/animation";

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
    const totalTime = timeLimit;
    const progress = (timeLeft / totalTime) * 100;

    // Helper function for button classes based on disabled state
    const buttonClasses = (isTimeUp: boolean, isDisabled: boolean) => {
        const base = "w-full p-5 text-left rounded-xl border-2 transition-all duration-300 group shadow-lg";
        
        if (isDisabled || isTimeUp) {
            // Disabled or time's up appearance (Subtle dark background)
            return `${base} border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed opacity-70`;
        } else {
            // Active appearance (More vibrant, ready for interaction)
            return `${base} border-primary/50 bg-secondary hover:bg-primary/70 hover:border-primary/80 transition-all duration-300 shadow-md hover:shadow-xl`;
        }
    };
    
    // Check if time is up, which effectively disables interactions
    const isTimeUp = timeLeft <= 0;
    const isInteractionDisabled = disabled || isTimeUp;

    // Determine progress bar color based on time remaining
    const progressBarColor = progress > 50 ? 'bg-green-500' : progress > 20 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <motion.div
            key={question.roundNumber}
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }} // Increased duration for smoother transition
            className="w-full lg:flex-1"
        >
            <Card className="shadow-2xl bg-card border border-primary/20">
                <div className="p-8 md:p-10">
                    
                    {/* Header Section: Round & Timer */}
                    <div className="flex justify-between items-center mb-8 border-b pb-4 border-border/50">
                        <div className="flex items-center gap-3 text-xl font-extrabold text-primary uppercase tracking-wider">
                            <Target className="w-6 h-6 text-accent" />
                            <span>
                                Round {currentQuestion} of{" "}
                                {totalQuestions}
                            </span>
                        </div>
                        
                        {/* Time Left Indicator - Emphasis on Red when low */}
                        <motion.div 
                            className={`flex items-center gap-2 text-2xl font-black transition-colors duration-300`}
                            animate={{ 
                                color: timeLeft <= 5 ? 'rgb(239, 68, 68)' : 'currentColor', // Tailwind red-500
                                scale: timeLeft <= 5 ? 1.05 : 1,
                            }}
                            transition={{ duration: 0.3, repeat: timeLeft <= 5 ? Infinity : 0, repeatType: "reverse" }}
                        >
                            <Clock className="w-6 h-6" />
                            {timeLeft}s
                        </motion.div>
                    </div>
                    
                    {/* Progress Bar - Dynamic color and appearance */}
                    <Progress
                        value={progress}
                        // Use dynamic color and slightly larger bar
                        className={`h-4 mb-10 shadow-inner rounded-full [&>div]:${progressBarColor} transition-colors duration-500`}
                    />

                    {/* Question Text */}
                    <h2 className="text-3xl font-bold mb-12 text-foreground leading-snug">
                        {question.question}
                    </h2>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {question.options.map((option: string, idx: number) => (
                            <motion.div
                                key={option}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + idx * 0.1 }} // Staggered entry
                            >
                                <motion.button
                                    onClick={() => onAnswer(option)}
                                    disabled={isInteractionDisabled} 
                                    whileHover={!isInteractionDisabled ? {
                                        scale: 1.02,
                                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                                    } : {}}
                                    whileTap={!isInteractionDisabled ? { scale: 0.99 } : {}}
                                    className={buttonClasses(isTimeUp, disabled)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Option Letter Badge (styled for emphasis) */}
                                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-black text-lg shadow-inner">
                                            {String.fromCharCode(idx + 65)}
                                        </span>
                                        {/* Option Text */}
                                        <span className="flex-1 text-lg text-foreground font-medium">
                                            {option}
                                        </span>
                                        {/* Interaction Indicator */}
                                        <Zap className={`w-6 h-6 transition-opacity ${!isInteractionDisabled ? 'text-accent opacity-0 group-hover:opacity-100' : 'text-gray-600 opacity-50'}`} />
                                    </div>
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};