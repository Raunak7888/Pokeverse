package com.pokeverse.play.quiz.dto;

public record SinglePlayerSessionResponseDto(Long sessionId,Long userid, String region, String difficulty, Integer rounds) {
}
