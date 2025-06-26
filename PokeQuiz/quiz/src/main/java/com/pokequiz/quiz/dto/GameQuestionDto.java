package com.pokequiz.quiz.dto;

import com.pokequiz.quiz.model.Question;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.concurrent.atomic.AtomicInteger;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameQuestionDto {
    Question question;
    AtomicInteger questionNumber;
}
