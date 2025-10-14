package com.pokeverse.play.quiz.dto;

public record AnswerValidationDto(
        Long roomId,
        Long userId,
        Long questionId,
        String selectedOption
) {}