package com.pokeverse.scribble.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Data Transfer Object for Player details when joining a room")
public class PlayerDTO {
    @Schema(description = "The ID of the room the player wants to join", example = "1")
    private Long roomId;

    @Schema(description = "The unique ID of the player", example = "201")
    private Long playerId;

    @Schema(description = "The username of the player", example = "JoiningPlayer")
    private String username;

    @Schema(description = "The password for the room if it's private. Can be null for public rooms.", example = "roomPassword", nullable = true)
    private String password;
}
