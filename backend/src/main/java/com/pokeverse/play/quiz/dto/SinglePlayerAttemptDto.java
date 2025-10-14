package com.pokeverse.play.quiz.dto;

public record SinglePlayerAttemptDto(Long questionId, String selectedAnswer, boolean isCorrect,String CorrectAnswer) {
}
