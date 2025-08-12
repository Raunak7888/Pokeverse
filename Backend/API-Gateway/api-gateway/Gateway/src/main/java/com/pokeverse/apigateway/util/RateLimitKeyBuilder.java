package com.pokeverse.apigateway.util;

import com.pokeverse.apigateway.model.RateLimitScope;
import org.springframework.stereotype.Component;

@Component
public class RateLimitKeyBuilder {
    public String buildKey(
            String service,
            String endpoint,
            RateLimitScope scope,
            String scopeValue
    ) {
        return String.format("ratelimit:%s:%s:%s:%s", service, endpoint, scope.name().toLowerCase(), scopeValue);
    }
}
