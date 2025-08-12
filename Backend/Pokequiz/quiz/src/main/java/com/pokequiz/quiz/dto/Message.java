package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Represents a real-time message exchanged in a chat or game room.")
public class Message {
    @Schema(description = "Unique identifier of the user sending the message.", example = "user123")
    private String userId;
    @Schema(description = "Username of the sender.", example = "JohnDoe")
    private String username;
    @Schema(description = "The content of the message.", example = "Hello everyone!")
    private String content;
}