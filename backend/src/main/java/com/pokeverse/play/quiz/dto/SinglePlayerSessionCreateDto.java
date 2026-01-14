package com.pokeverse.play.quiz.dto;

public record SinglePlayerSessionCreateDto(
        Long userId,
        String difficulty,
        String topic,
        Integer rounds
) {
}
