package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Represents a player in the game, including their details and current score.")
public class PlayerDto {
    @Schema(description = "Unique identifier of the user associated with this player.", example = "1")
    private Long userId;
    @Schema(description = "Name of the player.", example = "Ash Ketchum")
    private String name;
    @Schema(description = "URL to the player's profile picture.", example = "https://example.com/pic.jpg")
    private String profilePicUrl;
    @Schema(description = "Current score of the player.", example = "150")
    private int score;
    @Schema(description = "Unique identifier of the room the player is in.", example = "roomId123")
    private Long roomId;
    @Schema(description = "Timestamp when the player joined/was created.", example = "2023-10-27T10:00:00")
    private LocalDateTime createdAt;
}