"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/hooks/useUser";
import { useCreateRoom } from "@/lib/hooks/useCreateRoom";
import { motion } from "framer-motion";
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const CreatePage = () => {
  const user = useUser();
  const { createRoom, isLoading, error, setError } = useCreateRoom();

  const [roomName, setRoomName] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [rounds, setRounds] = useState(5);

  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error, { style: { background: "#ff4d4f", color: "#fff" } });
      setError(null);
    }
  }, [error, setError]);

  const handlePlayerCountChange = (delta: number) => {
    setPlayerCount((prev) => Math.min(4, Math.max(2, prev + delta)));
  };

  // ✅ rounds stepper: step = 5, clamp = 5..20
  const handleRoundsChange = (delta: number) => {
    setRounds((prev) => {
      const next = prev + delta * 5;
      return Math.min(20, Math.max(5, next));
    });
  };

  const handleCreateClick = () => {
    if (!user) {
      setError("You must be logged in to create a room.");
      return;
    }
    if (!roomName.trim()) {
      setError("Room name cannot be empty.");
      return;
    }
    createRoom({ roomName, playerCount, rounds, user });
    toast.success("Creating room... 🎉", {
      style: { background: "#facc15", color: "#000", fontWeight: "bold" },
    });
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#1e1e1e] to-[#2a2a2a] text-white font-[Piedra]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className="text-5xl font-extrabold mb-12 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-lg flex items-center gap-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Create Room
      </motion.h1>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
        <Card className="w-[420px] bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <CardHeader>
            <CardTitle className="text-center text-2xl tracking-widest">Room Settings</CardTitle>
          </CardHeader>

          {/* ✅ Form wrapper so Enter works */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateClick();
            }}
          >
            <CardContent className="flex flex-col gap-8">
              {/* Room Name */}
              <div>
                <Label className="mb-2 block text-lg">Room Name</Label>
                <input
                  placeholder="Enter a fun name..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-yellow-400/40 focus:ring-2 focus:ring-yellow-400 rounded-xl outline-none"
                />
              </div>

              {/* Player Count */}
              <div>
                <Label className="mb-2 block text-lg">Players</Label>
                <div className="flex items-center justify-center gap-6">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={playerCount <= 2}
                    onClick={() => handlePlayerCountChange(-1)}
                    className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all"
                  >
                    <Minus />
                  </Button>

                  <motion.span
                    key={playerCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl font-extrabold text-yellow-400"
                  >
                    {playerCount}
                  </motion.span>

                  <Button
                  type="button"
                    size="icon"
                    variant="outline"
                    disabled={playerCount >= 4}
                    onClick={() => handlePlayerCountChange(1)}
                    className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all"

                  >
                    <Plus />
                  </Button>
                </div>
              </div>

              {/* Rounds — stepper (5 → 20 in steps of 5) */}
              <div>
                <Label className="mb-2 block text-lg">Rounds</Label>
                <div className="flex items-center justify-center gap-6">
                  <Button
                  type="button"
                    size="icon"
                    variant="outline"
                    disabled={rounds <= 5}
                    onClick={() => handleRoundsChange(-1)}
                    className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all"
                  >
                    <Minus />
                  </Button>

                  <motion.span
                    key={rounds}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl font-extrabold text-yellow-400"
                  >
                    {rounds}
                  </motion.span>

                  <Button
                  type="button"
                    size="icon"
                    variant="outline"
                    disabled={rounds >= 20}
                    onClick={() => handleRoundsChange(1)}
                    className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all"
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex mt-8 justify-center">
              <Button
                type="submit" // ✅ Enter works
                disabled={isLoading}
                onClick={handleCreateClick} // ✅ Click works
                className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-bold shadow-lg hover:shadow-yellow-500/50 transition-all"
              >
                {isLoading ? "⚡ Creating..." : "Create Room"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CreatePage;
