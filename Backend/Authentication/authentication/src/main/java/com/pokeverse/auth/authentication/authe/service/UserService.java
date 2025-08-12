package com.pokeverse.auth.authentication.authe.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    @Value("${refresh-token.ttl-days}")
    private int refreshTokenTtlDays;

    public LocalDateTime getRefreshTokenExpiry() {
        return LocalDateTime.now().plusDays(refreshTokenTtlDays);
    }


    public String refreshToken() {
        return UUID.randomUUID().toString();
    }
}
