package com.pokeverse.play.quiz.controller.websocket;


import com.pokeverse.play.model.ChatMessage;
import com.pokeverse.play.quiz.dto.MessageDto;
import com.pokeverse.play.quiz.utils.ErrorUtil;
import com.pokeverse.play.quiz.utils.WebsocketMessingUtil;
import com.pokeverse.play.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ErrorUtil errorUtil;
    private final WebsocketMessingUtil websocketMessingUtil;

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId, @Payload MessageDto msg) {
        if(msg.msg().isBlank() && msg.msg().isEmpty()){
            messagingTemplate.convertAndSend("/topic/player/" + msg.userId()+"/error",errorUtil.badRequest("Message can not be empty"));
        }
        if(roomId <= 0){
            messagingTemplate.convertAndSend("/topic/player/" + msg.userId()+"/error",errorUtil.badRequest("Room ID cannot be negative or zero"));
        }
        if(msg.userId() <= 0){
            messagingTemplate.convertAndSend("/topic/player/" + msg.userId()+"/error",errorUtil.badRequest("User ID cannot be negative or zero"));
        }
        if(msg.tempId()<= 0){
            websocketMessingUtil.sendError(msg.userId(),"TempId is not present");
        }
        ChatMessage chatMessage = ChatMessage.builder()
                .userId(msg.userId())
                .roomId(roomId)
                .msg(msg.msg())
                .build();
        chatMessageRepository.save(chatMessage);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", msg);
    }

}
