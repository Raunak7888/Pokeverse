"use client";

import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WsAnswerValidationDTO } from "@/utils/types";
import { useMultiplayerResultStore } from "@/store/mulitplayerResultStore";

interface Props {
  answerData: Omit<WsAnswerValidationDTO, "correct">; // correct comes from server
  onValidationResult: (result: WsAnswerValidationDTO) => void;
  trigger: boolean;
  resetTrigger: () => void;
}

const AnswerValidation = ({
  answerData,
  onValidationResult,
  trigger,
  resetTrigger,
}: Props) => {
  const [client, setClient] = useState<Client | null>(null);
  const addResult = useMultiplayerResultStore((state) => state.addResult);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8083/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log("AnswerValidation WebSocket connected");

      // Subscribe to answer validation response topic
      stompClient.subscribe(`/topic/rooms/${answerData.roomId}/game`, (message) => {
        try {
            console.log(message.body); 
          const result: WsAnswerValidationDTO = JSON.parse(message.body);
          console.log("Answer validated:", result);

          onValidationResult(result);
          addResult(result); // ✅ Save to multiplayer result store
        } catch (err) {
          console.error("Error parsing validation response:", err);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("WebSocket STOMP error:", frame.headers["message"]);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.deactivate();
      }
    };
  }, [onValidationResult, addResult]);

  useEffect(() => {
    if (trigger && client?.connected) {
      client.publish({
        destination: "/app/game/answer/validation",
        body: JSON.stringify(answerData),
      });
      resetTrigger(); // Reset trigger after sending
    }
  }, [trigger, client, answerData, resetTrigger]);

  return null;
};

export default AnswerValidation;
