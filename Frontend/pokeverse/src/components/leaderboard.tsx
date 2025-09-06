"use client";

import React from "react";
import Image from "next/image";
import { useLeaderboardStore } from "@/store/useLeaderboardStore";

const rankColors = ["text-[#FFD700]", "text-[#C0C0C0]", "text-[#CD7F32]"];

export default function LeaderBoard() {
  // ✅ Zustand will re-render automatically when players change
  const players = useLeaderboardStore((state) => state.players);
  return (
    <div className="leaderboard-scroll font-piedra tracking-widest bg-[#1e1e1e] rounded-l-[2.5rem] p-4 max-h-[calc(100vh-7rem)] overflow-y-auto relative bottom-8 w-full sm:w-72 md:w-80 lg:w-96 xl:w-[28rem]">
      {players
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((player, index) => {
          return (
            <div key={player.id} className="flex items-center mb-3">
              {/* Rank */}
              <div
                className={`text-xl md:text-2xl font-bold w-10 md:w-12 text-center ${rankColors[index] || "text-white"
                  }`}
              >
                #{index + 1}
              </div>

              {/* Player profile */}
              <div className="flex items-center bg-[#2e2e2e] p-2 rounded-[2.5rem] shadow-inner flex-grow overflow-hidden">
                <div className="flex items-center bg-[#3c3c3c] p-2 rounded-[2.5rem] shadow-inner flex-grow overflow-hidden">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#d9d9d9] mx-2 shrink-0">
                    <Image
                      src={
                        player.profilePicUrl ||
                        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                      }
                      alt={player.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="bg-[#595959] rounded-r-[2.5rem] shadow-inner px-2 py-1 w-full overflow-hidden">
                    <div className="text-white text-xs md:text-sm leading-snug truncate">
                      <div className="font-bold truncate">{player.name}</div>
                      <div className="text-[10px] md:text-xs text-gray-300 truncate">
                        Score : {player.score}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

    </div>
  );
}
