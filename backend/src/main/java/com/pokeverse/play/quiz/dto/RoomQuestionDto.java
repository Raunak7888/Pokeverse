package com.pokeverse.play.quiz.dto;

import com.pokeverse.play.model.MultiplayerQuestion;
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
) {
    public static RoomQuestionDto from(MultiplayerQuestion mpq) {
        return RoomQuestionDto.builder()
                .questionId(mpq.getId())
                .question(mpq.getQuestion().getQuestion())
                .options(mpq.getQuestion().getOptions())
                .roundNumber(mpq.getRoundNumber())
                .totalRounds(mpq.getRoom().getTotalRounds())
                .timeLimit(30) // must match Redis TTL
                .build();
    }

}