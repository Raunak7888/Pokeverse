"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionComponent from "@/components/questionComponent";
import MutiplayerResult from "@/components/mutiplayerResult";
import Pokeball from "@/components/pokeball";
import Cookies from "js-cookie";
import Leaderboard from "@/components/leaderboard";
import { ClockProvider } from "@/components/GameClockContext";
import { useMultiplayerQuestionStore } from "@/store/multiplayerQuestionStore";
import { useLobbyWebSocket } from "@/components/lobby/useLobbyWebSocket";
import { useSendAnswerValidation } from "@/lib/hooks/useSendAnswerValidation";
import { useMultiplayerResultStore } from "@/store/mulitplayerResultStore";
import { useLeaderboardStore } from "@/store/useLeaderboardStore";
import { Player, WsAnswerValidationDTO } from "@/utils/types";

const QUESTION_DURATION = 30; // ⏳ Configurable per game

const Question = () => {
  const { multiplayerQuestion } = useMultiplayerQuestionStore();
  const { applyAnswerResult, setPlayers, setRoom } = useLeaderboardStore();

  const [stage, setStage] = useState<"intro" | "question" | "result">("intro");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startClock, setStartClock] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const [answerResult, setAnswerResult] = useState<WsAnswerValidationDTO | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [players, setPlayersLocal] = useState<Player[]>([]);

  const { stompClient } = useLobbyWebSocket(setPlayersLocal, roomId ? String(roomId) : "");
  const sendAnswer = useSendAnswerValidation(stompClient);

  /** 🔹 Reset state whenever a new question arrives */
  useEffect(() => {
    if (multiplayerQuestion) {
      setStage("intro");
      setSelectedOption(null);
      setStartClock(false);
      setQuestionKey((prev) => prev + 1);

    }
  }, [multiplayerQuestion]);

  /** 🔹 Handle intro → question transition */
  const handleStart = useCallback(() => {
    setTimeout(() => {
      setStage("question");
      setStartClock(true);
    }, 100);
  }, []);

  /** 🔹 Initialize player + room info from cookies/localStorage */
  useEffect(() => {
    try {
      const user = Cookies.get("user");
      const storedRoomId = localStorage.getItem("roomId");
      const rawPlayers = localStorage.getItem("players");
      const storedRoom = localStorage.getItem("room");

      if (user) {
        const { id: userId } = JSON.parse(user);
        if (rawPlayers) {
          const players = JSON.parse(rawPlayers);
          const matchedPlayer = players.find((p: Player) => p.userId === userId);
          if (matchedPlayer?.id) {
            setPlayerId(matchedPlayer.id);
          } else {
            console.warn("⚠️ No matching player found for userId:", userId);
          }
        } else {
          console.warn("⚠️ No players found in localStorage");
        }
      } else {
        console.warn("⚠️ No user cookie found");
      }


      if (storedRoomId) setRoomId(Number(storedRoomId));

      if (rawPlayers) {
        setPlayers(JSON.parse(rawPlayers));
      }
      if (storedRoom) {
        setRoom(JSON.parse(storedRoom));
      }
    } catch (err) {
      console.error("⚠️ Error initializing player/room:", err);
    }
  }, [setPlayers, setRoom]); // Added setPlayers and setRoom to dependencies

  /** 🔹 Sync ALL answer results from multiplayer store */
  /** 🔹 Sync ALL answer results from multiplayer store */
  useEffect(() => {
    if (!multiplayerQuestion) return;

    const unsubscribe = useMultiplayerResultStore.subscribe((state) => {
      const relevantResults = state.results.filter(
        (r) => r.questionId === multiplayerQuestion.question.id
      );

      relevantResults.forEach((res) => {
        applyAnswerResult(String(res.userId), res.score);
        if (res.userId === playerId) {
          setAnswerResult({
            userId: res.userId,
            questionId: res.questionId,
            correct: res.correct,
            roomId: roomId ?? 0,
            answer: res.answer ?? "",
            score: res.score ?? 0,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [multiplayerQuestion, applyAnswerResult, playerId, roomId]);



  /** 🔹 Option select */
  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  /** 🔹 Answer submit */
  const handleSubmit = () => {
    if (!selectedOption || !multiplayerQuestion || !playerId || !roomId) {
      console.warn("❌ Missing data, cannot submit", {
        selectedOption,
        multiplayerQuestion,
        playerId,
        roomId,
      });
      return;
    }

    const payload = {
      roomId,
      userId: playerId, // ✅ send correct player id
      questionId: multiplayerQuestion.question.id,
      answer: selectedOption,
      score: 0, // Provide a default score, update as needed
    };

    sendAnswer(payload);
    setStage("result");
  };


  return (
    <ClockProvider duration={QUESTION_DURATION} start={startClock}>
      <div className="min-h-screen bg-black flex items-center justify-between px-4 relative overflow-hidden gap-[1vw]">
        <div className="flex-1 flex justify-center rounded-[40px] items-center relative bottom-8">
          {/* 🔹 Intro Stage */}
          <AnimatePresence>
            {stage === "intro" && (
              <motion.div
                key={`intro-${questionKey}`}
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
                    Text={`${multiplayerQuestion?.questionNumber ?? "?"}`}
                    size={300}
                    css="left-[9rem] bottom-[-4rem]"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🔹 Question Stage */}
          <AnimatePresence>
            {stage === "question" && multiplayerQuestion && (
              <motion.div
                key={`question-${questionKey}`}
                initial={{ y: -500, opacity: 0, scale: 1.2 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.2 }}
                className="z-10"
              >
                <QuestionComponent
                  questionNumber={multiplayerQuestion.questionNumber}
                  questionText={multiplayerQuestion.question.question}
                  optionsText={{
                    A: multiplayerQuestion.question.options[0],
                    B: multiplayerQuestion.question.options[1],
                    C: multiplayerQuestion.question.options[2],
                    D: multiplayerQuestion.question.options[3],
                  }}
                  selectedOption={selectedOption}
                  onSelect={handleSelect}
                  onSubmit={handleSubmit}
                  isTimebound={true}
                  startTime={Date.now()}
                  endTime={multiplayerQuestion.questionEndTime}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🔹 Result Stage */}
          <AnimatePresence>
            {stage === "result" && multiplayerQuestion && (
              <motion.div
                key={`result-${questionKey}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <MutiplayerResult
                  endTime={multiplayerQuestion.questionEndTime} // ⬅️ pass endTime instead of duration
                  correct={answerResult?.correct}
                />              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leaderboard */}
        <div>
          <Leaderboard />
        </div>
      </div>
    </ClockProvider>
  );
};

export default Question;