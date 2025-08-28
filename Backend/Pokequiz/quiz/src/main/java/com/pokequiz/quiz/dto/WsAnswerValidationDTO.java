package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@Schema(description = "DTO for validating an answer submitted via WebSocket.")
public class WsAnswerValidationDTO {
    @Schema(description = "Unique identifier of the user submitting the answer.", example = "1")
    private Long userId;
    @Schema(description = "Unique identifier of the room the user is in.", example = "100")
    private Long roomId;
    @Schema(description = "Unique identifier of the question being answered.", example = "101")
    private Long questionId;
    @Schema(description = "The answer submitted by the user.", example = "Bulbasaur")
    private String answer;
    @Schema(description = "Indicates whether the submitted answer is correct (typically set by the server after validation).", example = "true")
    private boolean correct;
    private int score;
}