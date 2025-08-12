package com.pokeverse.apigateway.model;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TokenBucket {
    private double tokens;
    private long lastRefillTimestamp;
}

