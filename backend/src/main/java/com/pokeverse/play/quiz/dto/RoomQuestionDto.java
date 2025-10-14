package com.pokeverse.play.quiz.dto;

import lombok.Builder;
import java.util.List;

@Builder
public record RoomQuestionDto(
        Long questionId,
        String question,
        List<String> options,
        int roundNumber,
        int totalRounds,
        int timeLimit // in seconds
) {}