package com.pokeverse.apigateway.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MatchedConfig {
    private final String matchedPattern;
    private final RateLimitRule rule;
}
