package com.pokeverse.play.auth.dto;

import com.pokeverse.play.model.User;

public record AuthenticatedUser(UserDto user, String accessToken, String refreshToken) {}
