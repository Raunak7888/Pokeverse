"use client";
import React, { useEffect, useState,useRef  } from "react";
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
import { MessagesSquare } from "lucide-react";
import { Player, Room } from "@/utils/types";
import { Client } from "@stomp/stompjs"; // Import Client type for ChatComponent prop

const Lobby = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const failedProfilePics = useRef<Set<string>>(new Set());

  const [room, setRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("000000");
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  const { stompClient, isConnected } = useLobbyWebSocket(setPlayers, roomId);

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
    if (!userId) {
      return;
    }

    const init = async () => {
      const id = localStorage.getItem("roomId");
      if (!room && id) {
        try {
          const data = await fetchRoomFromServer(id, userId);
          setRoom(data.room);
          setPlayers(data.players);
          setRoomId(data.room.id.toString().padStart(6, "0"));
        } catch (e) {
          // console.error("Failed to fetch room:", e); // Keep error logging if critical
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
            const enriched = await enrichPlayers(playersNeedingPics, failedProfilePics.current);
            const merged = players.map((p) => enriched.find((e) => e.userId === p.userId) || p);
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

  const handleStartGame = () => {
    if (!room) {
      return;
    }

    if (!stompClient || !isConnected) {
      // console.warn("STOMP client not connected. Cannot start game."); // Keep warning if critical for user experience
      return;
    }

    stompClient.publish({
      destination: `/app/start/${room.id}`,
      body: JSON.stringify({ roomId: room.id, action: "start" }),
    });

    setTimeout(() => {
      stompClient.publish({
        destination: `/app/game/${room.id}/${room.hostId}`,
        body: JSON.stringify({ action: "initiate" }),
      });
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-white font-[Piedra]">
      <h1 className="text-4xl font-bold mb-6">{room?.name || "Loading Room..."}</h1>
      <div className="mb-4 text-xl">Room Code: {roomId}</div>

      <div className="flex gap-8">
        <PlayerList players={players} room={room} userId={userId} onStartGame={handleStartGame} />

        {/* Chat Component Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowChat((prev) => !prev)}
            className={`absolute top-2 w-12 h-12 bg-[#1e1e1e] hover:bg-[#2a2a2a] p-3 rounded-full shadow-lg transition-all duration-300 ${showChat ? "left-104" : ""
              }`}
            style={{ boxShadow: "0 0 10px rgba(255,255,255,0.3)" }}
          >
            <MessagesSquare className="text-white w-6 h-6" />
          </button>

          {showChat && (
            <div
              className="animate-slide-in-right w-[400px]"
              style={{ animationDuration: "0.4s" }}
            >
              <ChatComponent stompClient={stompClient as Client | null} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;