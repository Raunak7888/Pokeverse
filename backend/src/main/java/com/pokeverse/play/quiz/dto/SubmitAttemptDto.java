package com.pokeverse.play.quiz.dto;

public record SubmitAttemptDto(Long sessionId,Long questionId,String selectedAnswer) {}
