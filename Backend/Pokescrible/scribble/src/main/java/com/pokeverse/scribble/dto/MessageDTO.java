package com.pokeverse.scribble.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Data Transfer Object for chat messages")
public class MessageDTO {
    @Schema(description = "The username of the sender", example = "ChattyPlayer")
    private String username;

    @Schema(description = "The content of the chat message", example = "Great drawing!")
    private String message;
}
