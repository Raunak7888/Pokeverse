// hooks/useSendAnswerValidation.ts
import { useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { WsAnswerValidationDTO } from "@/utils/types";

export const useSendAnswerValidation = (stompClient: Client | null) => {
  const sendAnswerValidation = useCallback(
    (answerData: Omit<WsAnswerValidationDTO, "correct">) => {
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: "/app/game/answer/validation",
          body: JSON.stringify(answerData),
        });
      } else {
        console.warn("[WS] Cannot send answer — WebSocket not connected");
      }
    },
    [stompClient]
  );

  return sendAnswerValidation;
};
