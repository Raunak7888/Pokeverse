package com.pokeverse.play.quiz.utils;

import com.pokeverse.play.quiz.dto.QuestionDto;
import org.springframework.stereotype.Component;

@Component
public class Validate {

    public String validateQuestionDto(QuestionDto dto) {
        if (dto.question() == null || dto.question().isBlank()) {
            return "Question cannot be empty";
        }
        if (dto.options() == null || dto.options().size() < 2) {
            return "At least two options are required";
        }
        if (dto.answer() == null || dto.answer().isBlank()) {
            return "Answer cannot be empty";
        }
        if (!dto.options().contains(dto.answer())) {
            return "Answer must be one of the options";
        }
        return null;
    }


}
