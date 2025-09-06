"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionComponent from "@/components/questionComponent";
import Result from "@/components/result";
import Pokeball from "@/components/pokeball";
import { useRouter } from "next/navigation";
import backendUrl from "@/components/backendUrl";

type Stage = "intro" | "question" | "questionResult";

interface Question {
  id: number;
  question: string;
  optionsList: string[];
}

interface Session {
  sessionId: number;
  [key: string]: unknown;
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

  // load questions + session
  useEffect(() => {
    const questionsStr = localStorage.getItem("quizQuestions");
    const sessionStr = localStorage.getItem("session");

    if (questionsStr) {
      try {
        setQuestions(JSON.parse(questionsStr));
      } catch (err) {
        console.error("Invalid questions JSON:", err);
      }
    }

    if (sessionStr) {
      try {
        const session: Session = JSON.parse(sessionStr);
        setSessionId(session.sessionId);
      } catch (err) {
        console.error("Invalid session JSON:", err);
      }
    }
  }, []);

  // start time for each question
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
      const res = await fetch(`${backendUrl}/quiz/api/attempts/submit`, {
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
            `${backendUrl}/quiz/api/sessions/update/${sessionId}?status=COMPLETED`,
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

  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [currentIndex, questions]
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-black via-[#111] to-black text-white">
      {/* Decorative glowing orbs */}
      <div className="absolute -top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>

      <AnimatePresence>
        {stage === "intro" && (
          <motion.div
            initial={{ scale: 0, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 60, damping: 14, duration: 2.5 }}
            className="absolute"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1, opacity: 0, rotate: -360 }}
              transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
              onAnimationComplete={handleStart}
            >
              <Pokeball
                Text=""
                size={280}
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
            initial={{ y: 0, opacity: 0, scale: 1, visibility: "visible" }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 0, scale: 0, visibility: "hidden" }}
            transition={{ type: "spring", stiffness: 200, damping: 18, duration: 0.2 }}
            className="z-10 bg-[#1a1a1a]/30 px-10 h-150 rounded-2xl shadow-xl border border-yellow-400/20 backdrop-blur-xl"
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
              selectedOption={selectedOption}   // 🔥 pass parent state
              onSelect={setSelectedOption}      // 🔥 updates parent directly
              onSubmit={handleAnswerSubmit}
            />

          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Result Stage */}
      <AnimatePresence mode="wait">
        {stage === "questionResult" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }} // ⏱ faster animation
            className="z-20 fixed"
          >
            <Result isCorrect={isCurrentCorrect} onNext={handleNextQuestion} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default QuizPage;
