"use client";

import React, { useEffect, useState } from "react";
import PokeButton from "@/components/PokemonButton";
import Leaderboard from "@/components/finalLeaderboard";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Room } from "@/utils/types";
import { useMultiplayerResultStore } from "@/store/mulitplayerResultStore";

const Result = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [score, setScore] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const router = useRouter();
  const results = useMultiplayerResultStore((state) => state.results);

  // Initial setup
  useEffect(() => {
    try {
      const user = Cookies.get("user");
      const rawRoom = localStorage.getItem("room");
      const rawPlayers = localStorage.getItem("players");

      if (user && rawPlayers) {
        const { id: userId } = JSON.parse(user);
        const players = JSON.parse(rawPlayers);

        const matchedPlayer = players.find((p: any) => p.userId === userId);
        if (matchedPlayer?.id) {
          setPlayerId(matchedPlayer.id);
        }
      }

      if (rawRoom) {
        const parsedRoom: Room = JSON.parse(rawRoom);
        setRoom(parsedRoom);
        setTotal(parsedRoom.maxRound || 0);
      }
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }, []);

  // Score calculation
  useEffect(() => {
    if (!playerId) return;

    try {
      const playerResults = results.filter(
        (r) => Number(r.userId) === Number(playerId) && r.correct === true
      );
      setScore(playerResults.length);
    } catch (error) {
      console.error("Error calculating score:", error);
    }
  }, [playerId, results]);

  const handleMenuButton = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      {showLeaderboard ? (
        <Leaderboard />
      ) : (
        <div className="bg-[#1e1e1e] text-white rounded-3xl p-8 w-[71vw] h-[66vh] shadow-2xl font-[Piedra] tracking-widest">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-4xl font-bold tracking-wide font-[Piedra]">
              <span className="text-[#FF3B3B]">#</span>
              <span className="underline decoration-[#FF3B3B]">
                {String(score).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </span>
            </h1>
          </div>

          <div className="flex justify-center items-center flex-col text-center">
            <h2 className="text-7xl font-extrabold underline underline-offset-7 mb-10">
              Well Done !!!
            </h2>
            <p className="text-5xl font-bold underline underline-offset-7 mb-10">
              You Have Completed the Quiz!!!
            </p>
            <p className="text-lg">
              You Scored{" "}
              <span className="font-bold">
                {score} out of {total}
              </span>
            </p>

            <div className="flex justify-center gap-6 mt-10">
              <PokeButton
                buttonName="Leaderboard"
                onClick={() => setShowLeaderboard(true)}
              />
              <PokeButton buttonName="Menu" onClick={handleMenuButton} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;
