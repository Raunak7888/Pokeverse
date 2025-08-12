package com.pokeverse.apigateway.filter;

import com.pokeverse.apigateway.model.RateLimitScope;
import com.pokeverse.apigateway.service.TokenBucketRateLimiterService;
import com.pokeverse.apigateway.util.RateLimitFilterHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RateLimitingFilter implements GlobalFilter {
    private final TokenBucketRateLimiterService rateLimiter;
    private final RateLimitFilterHelper helper;

    public RateLimitingFilter(TokenBucketRateLimiterService rateLimiter,
                              RateLimitFilterHelper helper) {
        this.rateLimiter = rateLimiter;
        this.helper = helper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        try {
            String service = helper.resolveService(exchange);
            String endpoint = normalizePath(helper.resolveEndpoint(exchange));
            ScopeResult scopeResult = resolveScope(exchange);

            boolean allowed = rateLimiter.isAllowed(service, endpoint, scopeResult.scope, scopeResult.value);

            if (!allowed) {
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange);

        } catch (Exception e) {
            // Fallback: allow request rather than block everything on error
            return chain.filter(exchange);
        }
    }

    /**
     * Resolves the scope (API_KEY, USER, PLAN, IP) and its value from the exchange.
     */
    private ScopeResult resolveScope(ServerWebExchange exchange) {
        if (helper.hasApiKey(exchange)) {
            return new ScopeResult(RateLimitScope.API_KEY, helper.getApiKey(exchange));
        } else if (helper.isAuthenticated(exchange)) {
            return new ScopeResult(RateLimitScope.USER, helper.getUserId(exchange));
        } else if (helper.hasJwtClaim(exchange, "plan")) {
            return new ScopeResult(RateLimitScope.PLAN, helper.getJwtClaim(exchange, "plan"));
        } else {
            return new ScopeResult(RateLimitScope.IP, helper.getIp(exchange));
        }
    }

    private String normalizePath(String path) {
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        return path.replace("/", "_");
    }

    /**
         * Simple container for Scope + Value pair.
         */
        private record ScopeResult(RateLimitScope scope, String value) {
    }
}
