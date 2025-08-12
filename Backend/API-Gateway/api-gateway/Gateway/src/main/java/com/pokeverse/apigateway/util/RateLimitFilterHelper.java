package com.pokeverse.apigateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;
import java.util.Optional;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils; // Import this

@Component
public class RateLimitFilterHelper {
    private static final String API_KEY_HEADER = "X-API-Key";
    private static final String AUTHORIZATION_HEADER = HttpHeaders.AUTHORIZATION;
    private static final String BEARER_PREFIX = "Bearer ";
    private final Key signingKey;

    public RateLimitFilterHelper(@Value("${secret}") String secret) {
        if (secret == null || secret.isEmpty()) {
            throw new IllegalArgumentException("JWT secret cannot be null or empty");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** Check if API Key exists in headers or query params. */
    public boolean hasApiKey(ServerWebExchange exchange) {
        return getApiKey(exchange) != null;
    }

    /** Extract API Key from header or query param. */
    public String getApiKey(ServerWebExchange exchange) {
        List<String> headers = exchange.getRequest().getHeaders().getOrEmpty(API_KEY_HEADER);
        if (!headers.isEmpty()) {
            return headers.getFirst();
        }
        return exchange.getRequest().getQueryParams().getFirst("apiKey");
    }

    /** True if Authorization header has a valid JWT. */
    public boolean isAuthenticated(ServerWebExchange exchange) {
        return parseJwt(getJwtFromHeader(exchange)).isPresent();
    }

    /** Extract userId (subject) from JWT. */
    public String getUserId(ServerWebExchange exchange) {
        return parseJwt(getJwtFromHeader(exchange))
                .map(Claims::getSubject)
                .orElse("anonymous");
    }

    /** Check if JWT has a specific claim. */
    public boolean hasJwtClaim(ServerWebExchange exchange, String claim) {
        return parseJwt(getJwtFromHeader(exchange))
                .map(c -> c.get(claim))
                .isPresent();
    }

    /** Get a specific claim value from JWT. */
    public String getJwtClaim(ServerWebExchange exchange, String claim) {
        return parseJwt(getJwtFromHeader(exchange))
                .map(c -> String.valueOf(c.get(claim)))
                .orElse("unknown");
    }

    /** Extract the Bearer token from Authorization header. */
    public String getJwtFromHeader(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(AUTHORIZATION_HEADER);
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    /** Parse and validate JWT. */
    private Optional<Claims> parseJwt(String jwt) {
        if (jwt == null || jwt.isEmpty()) {
            return Optional.empty();
        }
        try {
            Jws<Claims> parsed = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(jwt);
            return Optional.of(parsed.getBody());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    /** Get client IP address. */
    public String getIp(ServerWebExchange exchange) {
        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        if (remoteAddress != null && remoteAddress.getAddress() != null) {
            return remoteAddress.getAddress().getHostAddress();
        }
        return "unknown";
    }

    /** Resolve service name from the matched Gateway route ID. */
    public String resolveService(ServerWebExchange exchange) {
        Route route = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);
        if (route != null) {
            return route.getId();
        }
        return "unknown-service";
    }
    /** Resolve endpoint path. */
    public String resolveEndpoint(ServerWebExchange exchange) {
        return exchange.getRequest().getPath().value();
    }
}