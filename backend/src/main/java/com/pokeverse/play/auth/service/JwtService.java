package com.pokeverse.play.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key key;
    private final long expirationInSec;

    public JwtService(@Value("${jwt.secret}") String secret,@Value("${jwt.expiration-in-sec:3600}") long expirationInSec) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationInSec = expirationInSec;
    }

    public String generateToken(String subject, Map<String, Object> claims ) {
        return Jwts.builder()
                .setClaims(claims != null ? claims : Map.of())
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plusSeconds(expirationInSec)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractSubject(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
