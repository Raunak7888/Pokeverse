package com.pokeverse.play.quiz.dto;

import lombok.Builder;

@Builder
public record ResultDto(
        Long id,
        String name,
        int score,
        double accuracy,
        int streak,
        String avatar
) {

}

