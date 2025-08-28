package com.pokeverse.apigateway.config;

import com.pokeverse.apigateway.model.MatchedConfig;
import com.pokeverse.apigateway.model.RateLimitRule;
import com.pokeverse.apigateway.model.RateLimitScope;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger log = LoggerFactory.getLogger(RateLimitConfigLoader.class);

    public MatchedConfig getConfig(String service, String endpoint, RateLimitScope scope) {
        if (configs == null) return null;
        Map<String, Map<RateLimitScope, RateLimitRule>> serviceEndpoints = configs.get(service);
        if (serviceEndpoints != null) {
            for (Map.Entry<String, Map<RateLimitScope, RateLimitRule>> entry : serviceEndpoints.entrySet()) {
                String normalizedEndpoint = endpoint.replace("_", "/");
                String normalizedPattern = entry.getKey()
                        .replace("STAR", "**")
                        .replace("_", "/");

                if (matcher.match(normalizedPattern, normalizedEndpoint)) {
                    log.info("Matched endpoint: {} for endpoint: {}", entry.getKey(), endpoint);
                    return new MatchedConfig(entry.getKey(), entry.getValue().get(scope));
                }
            }
        }
        return null;
    }

}
