package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.dto.Message;
import com.pokequiz.quiz.dto.WsAnswerValidationDTO;
import com.pokequiz.quiz.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketService wsService;


    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId, @Payload Message msg) {
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", msg);
    }

    @MessageMapping("/start/{roomId}")
    public void startGame(@DestinationVariable Long roomId) {
        wsService.startGame(roomId);
    }

    @MessageMapping("/game/{roomId}/{hostId}")
    public void startQuestions(@DestinationVariable Long roomId, @DestinationVariable Long hostId) {
        wsService.sendQuestion(roomId, hostId);
    }

    @MessageMapping("/game/answer/validation")
    public void validateAnswer(@Payload WsAnswerValidationDTO answer) {
        wsService.validateAnswer(answer);
    }

    @GetMapping("/ws/stats/{roomId}/{playerId}")
    public ResponseEntity<?> sendStats(@PathVariable Long roomId, @PathVariable Long playerId) {
        return wsService.sendStats(roomId,playerId);
    }


}