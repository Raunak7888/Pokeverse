package com.pokeverse.play.auth.dto;

import com.pokeverse.play.model.User;

public record UserDto(Long id, String username, String email, String profilePictureUrl) {
    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getProfilePictureUrl());
    }
}

