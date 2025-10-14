// ============= MultiplayerRoomQuizController.java =============
package com.pokeverse.play.quiz.controller.websocket;

import com.pokeverse.play.quiz.dto.AnswerValidationDto;
import com.pokeverse.play.quiz.service.MultiplayerRoomQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class MultiplayerRoomQuizController {

    private final MultiplayerRoomQuizService quizService;

    @MessageMapping("/game/start/{roomId}/{hostId}")
    public void startGame(@DestinationVariable Long roomId, @DestinationVariable Long hostId) {
        quizService.startGame(roomId, hostId);
    }

    @MessageMapping("/game/answer")
    public void submitAnswer(@Payload AnswerValidationDto answer) {
        quizService.validateAnswer(answer);
    }
}