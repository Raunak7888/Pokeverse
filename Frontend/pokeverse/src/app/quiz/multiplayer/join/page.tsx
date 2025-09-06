"use client";

import React, { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Player } from "@/utils/types";
import backendUrl from "@/components/backendUrl";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CODE_LENGTH = 6;

const Join = () => {
  const [roomCode, setRoomCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [userData, setUserData] = useState<Player | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = Cookies.get("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserData({
        id: parsed.id,
        userId: parsed.id,
        name: parsed.name,
        profilePicUrl: parsed.profilePicUrl,
        score: parsed.score,
      });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJoin(); // ✅ Enter triggers join
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\s/g, "").slice(0, CODE_LENGTH);
    const updated = [...roomCode];
    for (let i = 0; i < CODE_LENGTH; i++) {
      updated[i] = pasted[i]?.toUpperCase() || "";
    }
    setRoomCode(updated);
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
  };

  const handleJoin = async () => {
    if (!userData) {
      toast.error("User data not found. Please log in again.");
      return;
    }

    const roomId = roomCode.join("");
    if (roomId.length !== CODE_LENGTH) {
      toast.error("Please enter a valid 6-character room code.");
      return;
    }

    const id = parseInt(roomId.replace(/^0+/, "")); // remove leading zeros
    localStorage.setItem("roomId", id.toString());

    setIsJoining(true);
    try {
      const joinResponse = await fetch(`${backendUrl}/quiz/api/rooms/join?roomId=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.userId,
          name: userData.name,
          profilePicUrl: userData.profilePicUrl,
        }),
      });

      if (!joinResponse.ok) throw new Error("Join request failed");

      const dataResponse = await fetch(`${backendUrl}/quiz/api/rooms/${id}/${userData.userId}`);
      if (!dataResponse.ok) throw new Error("Failed to fetch room data");

      const jsonData = await dataResponse.json();

      localStorage.setItem("room", JSON.stringify(jsonData.room));
      jsonData.players.forEach((player: Player) => {
        if (player.userId === userData.userId) {
          player.profilePicUrl = userData.profilePicUrl;
        }
      });
      localStorage.setItem("players", JSON.stringify(jsonData.players));

      toast.success("Joined room successfully!");
      router.push("/quiz/multiplayer/lobby");
    } catch (error: unknown) {
      console.error("Error joining room:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to join the room.");
      }
    }
    finally {
      setIsJoining(false);
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center flex-col h-full text-white font-piedra tracking-widest"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-4xl font-bold mb-10">Join Room</h1>

      <Card className="w-[400px] bg-[#1e1e1e] text-white rounded-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Enter Room Code</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 items-center">
          <div className="flex space-x-3">
            {roomCode.map((char, index) => (
              <Input
                key={index}
                type="text"
                inputMode="text"
                maxLength={1}
                value={char}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e)} // ✅ Enter triggers join
                onPaste={handlePaste}
                ref={(el) => { inputsRef.current[index] = el; }}
                className="w-12 h-12 text-xl font-bold text-center bg-[#2c2c2c] border border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400"
              />
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex  justify-center">
          <Button
            type="button"
            className="w-full rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            onClick={handleJoin} // ✅ Click works
            disabled={isJoining}
          >
            {isJoining ? "Joining..." : "Join Room"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default Join;
