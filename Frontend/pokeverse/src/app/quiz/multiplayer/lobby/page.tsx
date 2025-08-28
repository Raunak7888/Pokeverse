"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  parseUserCookie,
  parseLocalStorage,
  fetchRoomFromServer,
  enrichPlayers,
} from "@/components/lobby/lobbyUtils";
import { useLobbyWebSocket } from "@/components/lobby/useLobbyWebSocket";
import PlayerList from "@/components/lobby/PlayerList";
import ChatComponent from "@/components/chatcomponent";
import { MessagesSquare, Copy, Loader2, Play } from "lucide-react";
import { Player, Room } from "@/utils/types";
import { Client } from "@stomp/stompjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Lobby = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const failedProfilePics = useRef<Set<string>>(new Set());
  const [room, setRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("000000");
  const [showChat, setShowChat] = useState(false);
  const [starting, setStarting] = useState(false);

  const router = useRouter();
  const { stompClient, isConnected } = useLobbyWebSocket(setPlayers, roomId);

  // Init room and players
  useEffect(() => {
    const user = parseUserCookie();
    if (user) {
      setUserId(user.id);
      setUsername(user.name);
    }

    const storedRoom = parseLocalStorage("room");
    const storedPlayers = parseLocalStorage("players");
    const storedRoomId = localStorage.getItem("roomId");

    if (storedRoom) setRoom(storedRoom);
    if (storedPlayers) setPlayers(storedPlayers);
    if (storedRoomId) setRoomId(storedRoomId.padStart(6, "0"));
  }, []);

  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      const id = localStorage.getItem("roomId");
      if (!room && id) {
        try {
          const data = await fetchRoomFromServer(id, userId);
          setRoom(data.room);
          setPlayers(
            data.players.map((p: any, idx: number) => ({
              id: p.id ?? idx,
              userId: p.userId,
              name: p.name,
              profilePicUrl: p.profilePicUrl,
              score: p.score,
            }))
          );
          setRoomId(data.room.id.toString().padStart(6, "0"));
        } catch {
          toast.error("Failed to fetch room from server.");
        }
      }

      if (players.length > 0) {
        const playersNeedingPics = players.filter(
          (p) =>
            !p.profilePicUrl?.trim() &&
            !failedProfilePics.current.has(`${p.userId}`)
        );

        if (playersNeedingPics.length > 0) {
          try {
            const enriched = await enrichPlayers(
              playersNeedingPics,
              failedProfilePics.current
            );
            const merged = players.map(
              (p) => enriched.find((e) => e.userId === p.userId) || p
            );
            setPlayers(merged);
            localStorage.setItem("players", JSON.stringify(merged));
          } catch (e) {
            console.error("Error enriching players:", e);
          }
        }
      }
    };

    init();
  }, [userId, room, players]);

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room code copied!");
  };

  const handleStartGame = () => {
    if (!room || !stompClient || !isConnected) {
      toast.error("Cannot start game. WebSocket not ready.");
      return;
    }

    setStarting(true);
    console.group("🎮 Game Start Flow");

    stompClient.publish({
      destination: `/app/start/${room.id}`,
      body: JSON.stringify({ roomId: room.id, action: "start" }),
    });

    setTimeout(() => {
      stompClient.publish({
        destination: `/app/game/${room.id}/${room.hostId}`,
        body: JSON.stringify({ action: "initiate" }),
      });
      console.groupEnd();
      setStarting(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-white font-[Piedra]">
      <Card className="w-[90%] max-w-4xl rounded-2xl shadow-2xl border-none p-6">
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-3xl font-bold">
            {room?.name || "Loading Room..."}
          </CardTitle>
          <div className="flex items-center gap-2 text-lg">
            Room Code:{" "}
            <span className="font-mono text-yellow-400">{roomId}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopyRoomCode}
              className="h-8 w-8"
            >
              <Copy className="w-4 h-4 text-gray-300" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex gap-8 justify-center">
          <PlayerList
            players={players}
            room={room}
            userId={userId}
            onStartGame={handleStartGame}
          />

          {/* Chat Toggle & Panel */}
          <div className="relative">
            <Button
              onClick={() => setShowChat((prev) => !prev)}
              className="absolute top-2 left-[-60px] w-12 h-12 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] shadow-md"
            >
              <MessagesSquare className="w-6 h-6" />
            </Button>

            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-[350px] bg-[#111] rounded-xl shadow-lg p-2"
                >
                  <ChatComponent stompClient={stompClient as Client | null} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Lobby;
