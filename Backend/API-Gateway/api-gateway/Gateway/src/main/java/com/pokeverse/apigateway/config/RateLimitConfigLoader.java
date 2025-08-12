package com.pokeverse.apigateway.config;

import com.pokeverse.apigateway.model.RateLimitRule;
import com.pokeverse.apigateway.model.RateLimitScope;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.Map;

@Setter
@Getter
@Component
@ConfigurationProperties(prefix = "ratelimit")
public class RateLimitConfigLoader {
    private Map<String, Map<String, Map<RateLimitScope, RateLimitRule>>> configs;
    private final AntPathMatcher matcher = new AntPathMatcher();

    public RateLimitRule getConfig(String service, String endpoint, RateLimitScope scope) {
        if (configs == null) return null;
        Map<String, Map<RateLimitScope, RateLimitRule>> serviceEndpoints = configs.get(service);
        if (serviceEndpoints != null) {
            for (Map.Entry<String, Map<RateLimitScope, RateLimitRule>> entry : serviceEndpoints.entrySet()) {
                if (matcher.match(entry.getKey(), endpoint)) {
                    return entry.getValue().get(scope);
                }
            }
        }
        return null;
    }
}
