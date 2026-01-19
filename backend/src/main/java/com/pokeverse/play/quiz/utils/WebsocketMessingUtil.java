package com.pokeverse.play.quiz.utils;

import com.pokeverse.play.quiz.dto.ApiError;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class WebsocketMessingUtil {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyRoom(Long roomId, String destination, Object payload) {
        messagingTemplate.convertAndSend("/topic/room/" + roomId + destination, payload);
    }



    public void sendError(Long userId, String message) {
        messagingTemplate.convertAndSend("/topic/player/" + userId + "/error",
                error(message));
    }

    private ApiError error(String message){
        return new ApiError(message, Instant.now());
    }
}
