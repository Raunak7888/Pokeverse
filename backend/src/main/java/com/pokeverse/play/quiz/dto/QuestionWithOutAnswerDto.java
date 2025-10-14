package com.pokeverse.play.quiz.dto;

import java.util.List;

public record QuestionWithOutAnswerDto(Long id, int questionNo, String question, List<String> options ) {}
