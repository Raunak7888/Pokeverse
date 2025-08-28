package com.pokeverse.apigateway.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RateLimitRule {
    private int capacity;
    private double refillRatePerSecond;
}
