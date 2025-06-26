package com.pokeverse.scribble.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Data Transfer Object for a player's answer submission in a round")
public class AnswerDTO {
    @Schema(description = "The ID of the user submitting the answer", example = "201")
    private Long userId;

    @Schema(description = "The player's guessed answer for the round's word/phrase", example = "Elephant")
    private String answer;

    @Schema(description = "The time (in seconds) it took the player to submit the answer", example = "30")
    private int time;
}
