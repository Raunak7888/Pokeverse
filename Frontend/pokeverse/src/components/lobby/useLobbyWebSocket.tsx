import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useRouter } from "next/navigation";
import { useMultiplayerQuestionStore } from "@/store/multiplayerQuestionStore";
import { useMultiplayerResultStore } from "@/store/mulitplayerResultStore";
import { Player, WsAnswerValidationDTO } from "@/utils/types";

export const useLobbyWebSocket = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  roomId: string
) => {
  const router = useRouter();
  const setMultiplayerQuestion = useMultiplayerQuestionStore((state) => state.setMultiplayerQuestion);
  const addResult = useMultiplayerResultStore((state) => state.addResult);
  const currentQuestionRef = useRef<any>(null);

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const callbacksRef = useRef({ setPlayers, setMultiplayerQuestion, addResult, router });
  useEffect(() => {
    callbacksRef.current = { setPlayers, setMultiplayerQuestion, addResult, router };
  }, [setPlayers, setMultiplayerQuestion, addResult, router]);

  useEffect(() => {
    if (!roomId) return;

    const socket = new SockJS("http://localhost:8083/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      const id = roomId.replace(/^0+/, "");

      client.subscribe(`/topic/rooms/${id}/game`, (message) => {
        const currentCallbacks = callbacksRef.current;

        if (message.body === "Game started") {
          currentCallbacks.router.push("/quiz/multiplayer/question");
          return;
        }

        if (message.body === "Game ended") {
          currentCallbacks.router.push("/quiz/multiplayer/result");
          return;
        }

        try {
          const msg = JSON.parse(message.body);
          console.log("[WS] Received:", msg);

          // Handle question message
          if (msg?.question && msg?.questionNumber !== undefined) {
            if (
              currentQuestionRef.current?.questionNumber === msg.questionNumber &&
              currentQuestionRef.current?.question?.id === msg.question.id
            ) {
              return;
            }

            const copy = JSON.parse(JSON.stringify(msg));
            currentCallbacks.setMultiplayerQuestion(copy);
            currentQuestionRef.current = copy;
            return;
          }

          // Handle player join message
          if (msg.userId && msg.name && !msg.question) {
            currentCallbacks.setPlayers((prev) => {
              if (prev.some((p) => p.userId === msg.userId)) return prev;

              const updatedPlayers = [...prev, msg];
              localStorage.setItem("players", JSON.stringify(updatedPlayers));
              return updatedPlayers;
            });
            return;
          }

          // Handle answer validation result
          if (msg.correct !== undefined && msg.answer && msg.questionId && msg.userId) {
            const result: WsAnswerValidationDTO = msg;
            currentCallbacks.addResult(result);
            return;
          }
        } catch (error) {
          console.error("WebSocket: Error parsing message body:", error, message.body);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("[WS] STOMP Error:", frame.headers["message"]);
      setIsConnected(false);
    };

    client.onDisconnect = () => {
      console.log("[WS] Disconnected.");
      setIsConnected(false);
    };

    setStompClient(client);
    client.activate();

    return () => {
      setIsConnected(false);
      client.deactivate();
    };
  }, [roomId]);

  return { stompClient, isConnected };
};
