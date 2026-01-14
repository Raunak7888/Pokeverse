package com.pokeverse.play.quiz.dto;

import lombok.Builder;

@Builder
public record ResultDto(
        Long id,
        String name,
        int score,
        String topic,
        double accuracy,
        int streak,
        String avatar
) {

}

