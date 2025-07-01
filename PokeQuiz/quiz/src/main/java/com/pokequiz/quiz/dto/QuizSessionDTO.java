package com.pokequiz.quiz.dto;

import com.pokequiz.quiz.model.QuizSession.SessionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Represents a quiz session, tracking user progress and quiz parameters.")
public class QuizSessionDTO {
    @Schema(description = "User identifier associated with this session.", example = "1")
    private Long userId;           // User identifier
    @Schema(description = "Difficulty level of the quiz.", example = "Medium", allowableValues = {"Easy", "Medium", "Hard"})
    private String difficulty;       // Difficulty level
    @Schema(description = "Region of the quiz questions.", example = "Johto")
    private String region;           // Region of the quiz
    @Schema(description = "Type of quiz.", example = "Battle")
    private String quizType;         // Type of quiz (e.g., trivia, battle, etc.)
    @Schema(description = "Total number of questions in this session.", example = "10")
    private int totalQuestions;      // Total number of questions
    @Schema(description = "Timestamp when the quiz session started.", example = "2023-10-27T09:00:00")
    private LocalDateTime startTime; // Session start time
    @Schema(description = "Timestamp when the quiz session ended (null if in progress).", example = "2023-10-27T09:30:00")
    private LocalDateTime endTime;   // Session end time (nullable if in progress)
    @Schema(description = "Current status of the quiz session.", example = "IN_PROGRESS", allowableValues = {"IN_PROGRESS", "COMPLETED", "ABANDONED"})
    private SessionStatus status;    // IN_PROGRESS, COMPLETED, ABANDONED
}