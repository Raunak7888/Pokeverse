package com.pokeverse.scribble.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data Transfer Object for Room details")
public class RoomDTO {
    @Schema(description = "The unique name of the game room", example = "MyAwesomeRoom")
    private String roomName;

    @Schema(description = "The ID of the host player creating the room", example = "101")
    private Long hostId;

    @Schema(description = "The username of the host player", example = "HostPlayer")
    private String hostUsername;

    @Schema(description = "The maximum number of players allowed in the room", example = "8")
    private int maxPlayer;

    @Schema(description = "The maximum number of rounds to be played in the game", example = "5")
    private int maxRounds;

    @Schema(description = "Indicates if the room is public (true) or private (false)", example = "true")
    private boolean isPublic;

    @Schema(description = "Password for private rooms. Can be null for public rooms.", example = "securePass123", nullable = true)
    private String password;
}
