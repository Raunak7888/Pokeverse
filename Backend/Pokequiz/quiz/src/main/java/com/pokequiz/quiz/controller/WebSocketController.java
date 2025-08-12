package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.dto.Message;
import com.pokequiz.quiz.dto.WsAnswerValidationDTO;
import com.pokequiz.quiz.service.WebSocketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
    @Operation(summary = "Get real-time player statistics",
            description = "Retrieves real-time statistics for a specific player within a given room. " +
                    "Note: This is an HTTP endpoint, not a WebSocket channel.",
            parameters = {
                    @Parameter(name = "roomId", description = "Unique identifier of the quiz room", required = true, example = "101"),
                    @Parameter(name = "playerId", description = "Unique identifier of the player", required = true, example = "202")
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved player statistics",
                            content = @Content(schema = @Schema(implementation = ResponseEntity.class))), // Assuming it returns a generic ResponseEntity wrapped response
                    @ApiResponse(responseCode = "404", description = "Room or player not found, or stats unavailable")
            })
    public ResponseEntity<?> sendStats(@PathVariable Long roomId, @PathVariable Long playerId) {
        return wsService.sendStats(roomId,playerId);
    }


}