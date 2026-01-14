package com.pokeverse.play.quiz.dto;

import java.util.List;

public record QuestionDto(
        Long id,
        String question,
        List<String> options,
        String answer,
        String topic,
        String difficulty) {}
