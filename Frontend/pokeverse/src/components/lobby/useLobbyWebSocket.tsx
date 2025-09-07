import { useEffect, useState, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { useRouter } from "next/navigation";
import { useMultiplayerQuestionStore } from "@/store/multiplayerQuestionStore";
import { useMultiplayerResultStore } from "@/store/mulitplayerResultStore";
import { MultiplayerQuestion, Player, WsAnswerValidationDTO } from "@/utils/types";
import backendUrl from "../backendUrl";

export const useLobbyWebSocket = (
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  roomId: string
) => {
  const router = useRouter();
  const setMultiplayerQuestion = useMultiplayerQuestionStore((state) => state.setMultiplayerQuestion);
  const addResult = useMultiplayerResultStore((state) => state.addResult);

  const currentQuestionRef = useRef<MultiplayerQuestion>(null);
  const callbacksRef = useRef({ setPlayers, setMultiplayerQuestion, addResult, router });
  useEffect(() => {
    callbacksRef.current = { setPlayers, setMultiplayerQuestion, addResult, router };
  }, [setPlayers, setMultiplayerQuestion, addResult, router]);

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Safe sendMessage function
  const sendMessage = useCallback(
    (destination: string, body: unknown) => {
      if (stompClient && stompClient.connected) {
        stompClient.publish({ destination, body: JSON.stringify(body) });
      } else {
        console.warn("[WS] Tried to send message but STOMP is not connected");
      }
    },
    [stompClient]
  );

  useEffect(() => {
    if (!roomId) return;

    const id = roomId.replace(/^0+/, "");
    const token = localStorage.getItem("token");

    const wsProtocol = backendUrl.startsWith("https") ? "wss" : "ws";
    const client = new Client({
      brokerURL: backendUrl.replace(/^https?/, wsProtocol) + "/quiz/ws/websocket",
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (str) => console.log("[WS]", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log("[WS] Connected to STOMP");

      // Subscribe to game topic
      client.subscribe(`/topic/rooms/${id}/game`, (message: IMessage) => {
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

          // Question update
          if (msg?.question && msg?.questionNumber !== undefined) {
            if (
              currentQuestionRef.current?.questionNumber === msg.questionNumber &&
              currentQuestionRef.current?.question?.id === msg.question.id
            ) return;

            const copy = JSON.parse(JSON.stringify(msg));
            currentCallbacks.setMultiplayerQuestion(copy);
            currentQuestionRef.current = copy;
            return;
          }

          // Player joined
          if (msg.userId && msg.name && !msg.question) {
            currentCallbacks.setPlayers((prev) => {
              if (prev.some((p) => p.userId === msg.userId)) return prev;
              const updatedPlayers = [...prev, msg];
              localStorage.setItem("players", JSON.stringify(updatedPlayers));
              return updatedPlayers;
            });
            return;
          }

          // Answer validation
          if (msg.correct !== undefined && msg.answer && msg.questionId && msg.userId) {
            const result: WsAnswerValidationDTO = msg;
            currentCallbacks.addResult(result);
            return;
          }
        } catch (error) {
          console.error("[WS] Error parsing message body:", error, message.body);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("[WS] STOMP Error:", frame.headers["message"], frame.body);
      setIsConnected(false);
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      console.log("[WS] STOMP disconnected");
    };

    setStompClient(client);
    client.activate();

    return () => {
      setIsConnected(false);
    };
  }, [roomId]);

  return { stompClient, isConnected, sendMessage };
};

