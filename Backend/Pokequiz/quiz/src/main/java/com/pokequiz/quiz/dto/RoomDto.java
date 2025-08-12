package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Represents a game room where multiple players can join and participate in quizzes.")
public class RoomDto {
    @Schema(description = "Name of the room.", example = "Pokémon Masters")
    private String name;
    @Schema(description = "ID of the host player.", example = "10")
    private int hostId;
    @Schema(description = "Name of the host player.", example = "Misty")
    private String hostName;
    @Schema(description = "Maximum number of players allowed in the room.", example = "4")
    private int maxPlayers;
    @Schema(description = "Maximum number of rounds to be played in the room.", example = "5")
    private int maxRound;
    @Schema(description = "List of players currently in the room.")
    private List<PlayerDto> players; // Assuming PlayerDto has its own Swagger annotations
}