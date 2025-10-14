package com.pokeverse.play.quiz.dto;

public record CreateMultiplayerRoomDto(String name, int rounds, long hostId, int maxPlayers) {}
