package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Records an attempt for a specific question within a quiz session.")
public class QuizAttemptDTO {
    @Schema(description = "Unique identifier of the quiz session.", example = "100")
    private Long sessionId;
    @Schema(description = "Unique identifier of the question being attempted.", example = "101")
    private Long questionId;
    @Schema(description = "The answer selected by the user for this attempt.", example = "Charmander")
    private String selectedAnswer;
    @Schema(description = "Timestamp when the user started answering this question.", example = "2023-10-27T10:05:00")
    private LocalDateTime startTime;
    @Schema(description = "Timestamp when the user submitted the answer for this question.", example = "2023-10-27T10:05:15")
    private LocalDateTime endTime;
}