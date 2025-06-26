package com.pokequiz.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetailedAnswer {
    private Long questionId;
    private String question;
    private String correctAnswer;
    private boolean isCorrect;
    private String selectedOption;
    private int timeTaken; // in seconds


}
