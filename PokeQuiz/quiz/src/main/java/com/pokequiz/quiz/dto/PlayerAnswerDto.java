package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Represents a player's answer submission for a quiz question.")
public class PlayerAnswerDto {
    @Schema(description = "Unique identifier of the player.", example = "1")
    private Long playerId;
    @Schema(description = "Unique identifier of the quiz.", example = "10")
    private Long quizId;
    @Schema(description = "The answer submitted by the player.", example = "Pikachu")
    private String answer;
    @Schema(description = "Indicates whether the submitted answer was correct.", example = "true")
    private boolean correct;
}