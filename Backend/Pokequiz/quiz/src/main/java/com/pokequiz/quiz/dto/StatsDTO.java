package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Represents the statistics for a user's quiz performance, including detailed answers.")
public class StatsDTO {
    @Schema(description = "Unique identifier of the user.", example = "1")
    private Long userId;
    @Schema(description = "Username of the user.", example = "Ash Ketchum")
    private String username;
    @Schema(description = "Total points accumulated by the user across quizzes.", example = "500")
    private int totalPoints;
    @Schema(description = "A list of detailed answers for questions the user has attempted.")
    private List<DetailedAnswer> detailedAnswers; // Assuming DetailedAnswer has its own Swagger annotations
}