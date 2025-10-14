package com.pokeverse.play.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// DTO for individual question attempts
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAttemptDto {
    private Long id;
    private int questionNo;
    private String question;
    private String selectedAnswer;
    private boolean correct;
}

