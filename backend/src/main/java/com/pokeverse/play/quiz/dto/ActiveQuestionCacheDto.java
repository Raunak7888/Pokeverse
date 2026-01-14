package com.pokeverse.play.quiz.dto;

public record ActiveQuestionCacheDto(
        Long multiplayerQuestionId, // The ID of the database entity
        Long questionId,            // The ID of the actual question
        String correctAnswer,       // The expected answer string
        Long expiryTimestampMs      // Time when the question expires (for client sync/cleanup)
) {}