package com.pokeverse.play.quiz.dto;

public record SinglePlayerSessionCreateDto(
        Long userId,
        String region,
        String difficulty, 
        Integer rounds
) {
}
