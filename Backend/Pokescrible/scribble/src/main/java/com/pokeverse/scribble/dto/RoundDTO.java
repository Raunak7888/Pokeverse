package com.pokeverse.scribble.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Data Transfer Object for specifying the word to be guessed in a round")
public class RoundDTO {
    @Schema(description = "The ID of the user who is setting the word to guess for the round (typically the drawer)", example = "101")
    private Long userId;

    @Schema(description = "The word or phrase that needs to be guessed by other players in the round", example = "Scribble")
    private String toGuess;
}
