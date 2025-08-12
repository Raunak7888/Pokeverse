"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionComponent from "@/components/questionComponent";
import Result from "@/components/result";
import Pokeball from "@/components/pokeball";
import { useRouter } from "next/navigation";

type Stage = "intro" | "question" | "questionResult";

interface Question {
  id: number;
  question: string;
  optionsList: string[];
}

interface Session {
  sessionId: number;
  [key: string]: any; // include other props like difficulty, etc.
}

const QuizPage = () => {
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const questionsStr = localStorage.getItem("quizQuestions");
    const sessionStr = localStorage.getItem("session");

    if (questionsStr) {
      try {
        const parsedQuestions: Question[] = JSON.parse(questionsStr);
        setQuestions(parsedQuestions);
      } catch (err) {
        console.error("Invalid questions JSON:", err);
      }
    }

    if (sessionStr) {
      try {
        const session: Session = JSON.parse(sessionStr);
        console.log(session.sessionId);
        setSessionId(session.sessionId);
      } catch (err) {
        console.error("Invalid session JSON:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0 && stage === "question") {
      setStartTime(new Date());
    }
  }, [stage, currentIndex, questions]);

  const handleStart = () => {
    setTimeout(() => setStage("question"), 100);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedOption || !startTime || sessionId === null) return;

    const currentQuestion = questions[currentIndex];
    const endTime = new Date();

    const body = {
      sessionId,
      questionId: currentQuestion.id,
      selectedAnswer: selectedOption,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    try {
      const res = await fetch("http://localhost:8083/api/attempts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to submit attempt");

      const data = await res.json();
      const isCorrect = data.correct === true;

      setIsCurrentCorrect(isCorrect);
      if (isCorrect) setCorrectAnswersCount((prev) => prev + 1);
      setStage("questionResult");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleNextQuestion = async () => {
    const isLast = currentIndex + 1 >= questions.length;

    if (isLast) {
      try {
        if (sessionId !== null) {
          await fetch(
            `http://localhost:8083/api/sessions/update/${sessionId}?status=COMPLETED`,
            { method: "PUT" }
          );
        }
      } catch (err) {
        console.error("Failed to mark session as completed:", err);
      }

      router.push(
        `/quiz/singleplayer/result?score=${correctAnswersCount}&total=${questions.length}&sessionId=${sessionId}`
      );
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setStage("question");
    }
  };

  const currentQuestion = useMemo(() => questions[currentIndex], [
    currentIndex,
    questions,
  ]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Intro Pokeball Animation */}
      <AnimatePresence>
        {stage === "intro" && (
          <motion.div
            initial={{ scale: 0, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 50, damping: 15, duration: 3 }}
            className="absolute"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1, opacity: 0, rotate: -360 }}
              transition={{ delay: 1, duration: 3, ease: "easeInOut" }}
              onAnimationComplete={handleStart}
            >
              <Pokeball
                Text={`${currentIndex + 1}`}
                size={300}
                css="right-[5rem] bottom-[-4rem]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Stage */}
      <AnimatePresence>
        {stage === "question" && currentQuestion && (
          <motion.div
            key={currentIndex}
            initial={{ y: -500, opacity: 0, scale: 1.2 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 10, duration: 0.8 }}
            className="z-10"
          >
            <QuestionComponent
              questionNumber={currentIndex + 1}
              questionText={currentQuestion.question}
              optionsText={{
                A: currentQuestion.optionsList[0],
                B: currentQuestion.optionsList[1],
                C: currentQuestion.optionsList[2],
                D: currentQuestion.optionsList[3],
              }}
              onSubmit={handleAnswerSubmit}
              onSelect={setSelectedOption}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Result Stage */}
      <AnimatePresence>
        {stage === "questionResult" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
          >
            <Result isCorrect={isCurrentCorrect} onNext={handleNextQuestion} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizPage;
