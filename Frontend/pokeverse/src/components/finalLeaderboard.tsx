"use client";

import PokeButton from "@/components/PokemonButton";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useMultiplayerResultStore } from "@/store/mulitplayerResultStore";
import Review from "./review";
import Cookies from "js-cookie";

type PlayerStats = {
  name: string;
  userId: number;
  correct: number;
  incorrect: number;
  unanswered: number;
};

const calculateAccuracy = (
  correct: number,
  incorrect: number,
  unanswered: number
) => {
  const total = correct + incorrect + unanswered;
  if (total === 0) return "0.00%";
  const score = correct * 3 - incorrect;
  const maxScore = total * 3;
  const accuracy = (score / maxScore) * 100;
  return `${Math.max(0, accuracy).toFixed(2)}%`;
};

const LeaderBoard = () => {
  const router = useRouter();
  const results = useMultiplayerResultStore((state) => state.results);
  const [room, setRoom] = useState<any>(null);
  const [playersStats, setPlayersStats] = useState<PlayerStats[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    const rawRoom = localStorage.getItem("room");
    const rawPlayers = localStorage.getItem("players");
    const user = Cookies.get("user");

    if (!rawRoom || !rawPlayers || !user) return;

    try {
      const room = JSON.parse(rawRoom);
      const players = JSON.parse(rawPlayers);
      const userObj = JSON.parse(user);
      const currentPlayer = players.find(
        (p: any) => p.userId === userObj.id
      );

      if (currentPlayer) setPlayerId(currentPlayer.id);

      const maxRound = room.maxRound || 0;
      setRoom(room);

      const statsMap = new Map<number, PlayerStats>();

      players.forEach((p: any) => {
        statsMap.set(p.id, {
          name: p.name,
          userId: p.id,
          correct: 0,
          incorrect: 0,
          unanswered: 0,
        });
      });

      statsMap.forEach((playerStat, userId) => {
        const userResults = results.filter((r) => r.userId === userId);
        const correct = userResults.filter((r) => r.correct).length;
        const totalAnswered = userResults.length;
        const incorrect = totalAnswered - correct;
        const unanswered = maxRound - totalAnswered;

        statsMap.set(userId, {
          ...playerStat,
          correct,
          incorrect,
          unanswered,
        });
      });

      const sorted = Array.from(statsMap.values()).sort((a, b) => {
        const aScore = a.correct * 3 - a.incorrect;
        const bScore = b.correct * 3 - b.incorrect;
        return bScore - aScore;
      });

      setPlayersStats(sorted);
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, [results]);

  const handleMenuButton = () => {
    router.push("/");
  };

  const handleReviewButton = () => {
    setShowReview(true);
  };

  if (showReview && playerId && room?.id) {
    return (
      <div className="bg-black flex items-center justify-center px-2 sm:px-4 py-8 font-[mogra] ">
        <Review playerId={playerId} roomId={room.id} />
      </div>
    );
  }

  return (
    <div className="bg-black flex items-center justify-center px-2 sm:px-4 py-8 font-[mogra] min-h-screen">
      <div className="w-full max-w-4xl bg-[#1f1f1f] text-white rounded-3xl shadow-2xl p-4 md:p-6 flex flex-col">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide font-[Piedra] text-center md:text-left">
            <span className="text-[#FF3B3B]">#</span>
            <span className="underline decoration-[#FF3B3B]">
              {playersStats.length > 0 ? `01/${String(playersStats.length).padStart(2, "0")}` : 'N/A'}
            </span>
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold md:relative md:right-50 text-center order-first md:order-last md:text-right md:pr-14 ">
            Leader Board
          </h2>
        </div>

        <div className="hidden md:grid grid-cols-6 gap-2 font-semibold text-sm text-center mb-3">
          {["Rank", "Player", "Correct", "Incorrect", "Unanswered", "Accuracy"].map((title) => (
            <div key={title} className="bg-[#333] p-2 rounded-md uppercase tracking-wider">
              {title}
            </div>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-3">
          {playersStats.map((player, index) => {
            const isTop3 = index < 3;
            const rankColors = ["bg-[#FFD700]", "bg-[#C0C0C0]", "bg-[#CD7F32]"];
            const baseRowColor = isTop3 ? `${rankColors[index]} text-black font-semibold` : "bg-[#2a2a2a] text-white";

            return (
              <div key={player.userId} className="select-none">
                <div className={`md:hidden p-4 rounded-lg ${baseRowColor}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xl">#{index + 1}</span>
                      <p className="font-semibold truncate" title={player.name}>{player.name}</p>
                    </div>
                    <span className="font-bold text-lg">
                      {calculateAccuracy(player.correct, player.incorrect, player.unanswered)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm text-center">
                    <div className="flex flex-col"><span className="opacity-75">Correct</span><span className="text-base font-semibold">{player.correct}</span></div>
                    <div className="flex flex-col"><span className="opacity-75">Incorrect</span><span className="text-base font-semibold">{player.incorrect}</span></div>
                    <div className="flex flex-col"><span className="opacity-75">Unanswered</span><span className="text-base font-semibold">{player.unanswered}</span></div>
                  </div>
                </div>

                <div className={`hidden md:grid grid-cols-6 gap-2 text-center text-sm`}>
                  <div className={`p-2 rounded-md ${baseRowColor}`}>#{index + 1}</div>
                  <div className={`p-2 rounded-md truncate ${baseRowColor}`} title={player.name}>{player.name}</div>
                  <div className={`p-2 rounded-md ${baseRowColor}`}>{player.correct}</div>
                  <div className={`p-2 rounded-md ${baseRowColor}`}>{player.incorrect}</div>
                  <div className={`p-2 rounded-md ${baseRowColor}`}>{player.unanswered}</div>
                  <div className={`p-2 rounded-md ${baseRowColor}`}>
                    {calculateAccuracy(player.correct, player.incorrect, player.unanswered)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-evenly flex-row gap-5">
          <div className="flex justify-center mt-8">
            <PokeButton buttonName="Review" onClick={handleReviewButton} />
          </div>
          <div className="flex justify-center mt-8">
            <PokeButton buttonName="Menu" onClick={handleMenuButton} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
