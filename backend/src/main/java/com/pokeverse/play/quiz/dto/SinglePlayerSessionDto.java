package com.pokeverse.play.quiz.dto;


import java.util.List;

public record SinglePlayerSessionDto(SinglePlayerSessionResponseDto session, List<QuestionWithOutAnswerDto> questions) {}
