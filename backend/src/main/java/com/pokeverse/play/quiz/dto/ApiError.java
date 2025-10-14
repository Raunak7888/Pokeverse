package com.pokeverse.play.quiz.dto;

import java.time.Instant;

public record ApiError(String message, Instant timestamp) {}

