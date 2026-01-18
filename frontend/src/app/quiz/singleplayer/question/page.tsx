"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Intro from "@/components/quiz/singlePlayerQuestion/Intro";
import QuizCard from "@/components/quiz/singlePlayerQuestion/QuestionComponent";
import { useSinglePlayerQuestionsStore } from "@/store/useSinglePlayerQuestionsStore";

export default function SinglePlayerQuestionPage() {
    const [showIntro, setShowIntro] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });
    const router = useRouter();
    const questions = useSinglePlayerQuestionsStore((state) => state.questions);

    // Show intro before each question
    useEffect(() => {
        if (showIntro) {
            const timer = setTimeout(() => setShowIntro(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [showIntro]);

    const handleAnswer = (isCorrect: boolean) => {
        setStats((prev) => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            wrong: prev.wrong + (isCorrect ? 0 : 1),
        }));
    };

    const handleNext = () => {
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex((prev) => prev + 1);
            setShowIntro(true);
        } else {
            // Save stats in localStorage
            localStorage.setItem(
                "quizResult",
                JSON.stringify({
                    total: questions.length,
                    correct: stats.correct,
                    wrong: stats.wrong,
                })
            );
            router.push("/quiz/singleplayer/result");
        }
    };

    return (
        <div className="flex items-center pt-20 justify-center w-screen h-screen bg-background">
            <AnimatePresence mode="wait">
                {showIntro ? (
                    <Intro key={`intro-${currentIndex}`} />
                ) : (
                    <QuizCard
                        key={`quiz-${currentIndex}`}
                        question={questions[currentIndex]}
                        onSubmit={handleAnswer}
                        onNext={handleNext}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
