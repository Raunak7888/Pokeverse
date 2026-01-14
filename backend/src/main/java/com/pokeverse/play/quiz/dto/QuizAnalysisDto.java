package com.pokeverse.play.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

// DTO for overall quiz analysis
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnalysisDto {
    private Long sessionId;
    private Long userId;
    private String quizType;
    private String difficulty;
    private String topic;
    private int totalQuestions;
    private int correctAnswers;
    private int wrongAnswers;
    private double accuracy;
    private long totalDuration;
    private long averageTimePerQuestion;
    private long fastestAnswerTime;
    private long slowestAnswerTime;
    private String answerSpeedRating;
    private String performanceRating;
    private List<QuestionAttemptDto> questionAttempts;
    private Instant createdAt;
}
