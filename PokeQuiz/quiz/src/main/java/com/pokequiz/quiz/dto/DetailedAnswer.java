package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Represents a detailed answer for a given question in a quiz.")
public class DetailedAnswer {
    @Schema(description = "Unique identifier of the question.", example = "101")
    private Long questionId;
    @Schema(description = "The text of the question.", example = "What is the capital of France?")
    private String question;
    @Schema(description = "The correct answer to the question.", example = "Paris")
    private String correctAnswer;
    @Schema(description = "Indicates whether the selected answer was correct.", example = "true")
    private boolean isCorrect;
    @Schema(description = "The option selected by the player.", example = "Paris")
    private String selectedOption;
    @Schema(description = "Time taken to answer the question in seconds.", example = "15")
    private int timeTaken; // in seconds
}