"use client";

import React, { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import PokeButton from "@/components/PokemonButton";
import { useRouter } from "next/navigation";
import { Player } from "@/utils/types";

const CODE_LENGTH = 6;

const Join = () => {
  const [roomCode, setRoomCode] = useState<string[]>(
    Array(CODE_LENGTH).fill("")
  );
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [userData, setUserData] = useState<Player | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = Cookies.get("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserData({ userId: parsed.id, name: parsed.name,profilePicUrl: parsed.profilePicUrl,score:parsed.score});
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
    const updatedCode = [...roomCode];
    updatedCode[index] = value.toUpperCase();
    setRoomCode(updatedCode);
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !roomCode[index] && index > 0) {
      const updatedCode = [...roomCode];
      updatedCode[index - 1] = "";
      setRoomCode(updatedCode);
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\s/g, "")
      .slice(0, CODE_LENGTH);
    const updated = [...roomCode];
    for (let i = 0; i < CODE_LENGTH; i++) {
      updated[i] = pasted[i]?.toUpperCase() || "";
    }
    setRoomCode(updated);
    inputsRef.current[pasted.length - 1]?.focus();
  };

  const handleJoin = async () => {
    if (!userData) return alert("User data not found in cookies.");

    const roomId = roomCode.join("");
    if (roomId.length !== CODE_LENGTH) return alert("Enter a valid room code.");

    const id = parseInt(roomId.replace(/^0+/, "")); // remove leading zeros
    localStorage.setItem("roomId", id.toString());

    try {
      // Step 1: Join the room
      const joinResponse = await fetch(
        `http://localhost:8083/api/rooms/join?roomId=${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData.userId,
            name: userData.name,
            profilePicUrl: userData.profilePicUrl,
          }),
        }
      );

      if (!joinResponse.ok) throw new Error("Join request failed");

      // Step 2: Fetch room and player data
      const dataResponse = await fetch(`http://localhost:8083/api/rooms/${id}/${userData.userId}`);
      if (!dataResponse.ok) throw new Error("Failed to fetch room data");

      const jsonData = await dataResponse.json();

      // Save room and players in localStorage
      localStorage.setItem("room", JSON.stringify(jsonData.room));
      jsonData.players.forEach((player: { userId: number; profilePicUrl: string; createdAt: string; id: number; name: string; score: number}) => {
        if(player.userId === userData.userId ){ // Changed from == to === for strict equality
          player.profilePicUrl = userData.profilePicUrl; // Changed from == to = for assignment
        }
      });
      localStorage.setItem("players", JSON.stringify(jsonData.players));

      // Navigate to lobby
      router.push("/quiz/multiplayer/lobby");
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join the room. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center flex-col h-full text-white font-[Piedra] tracking-widest">
      <h1 className="text-4xl font-bold mb-10">Join Room</h1>

      <div className="bg-[#1e1e1e] p-10 rounded-3xl shadow-xl w-[400px] flex flex-col items-center gap-6">
        <div className="text-3xl font-bold text-center">
          Enter The Room Code
        </div>

        <div className="flex space-x-2">
          {roomCode.map((char, index) => (
            <input
              key={index}
              type="text"
              inputMode="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              className="block w-10 h-10 text-sm font-extrabold text-center text-white bg-[#2e2e2e] border border-gray-500 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          ))}
        </div>

        <div className="w-full" onClick={handleJoin}>
          <PokeButton buttonName="Join" />
        </div>
      </div>
    </div>
  );
};

export default Join;
