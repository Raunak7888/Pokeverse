package com.pokeverse.apigateway.service;

import com.pokeverse.apigateway.config.RateLimitConfigLoader;
import com.pokeverse.apigateway.model.MatchedConfig;
import com.pokeverse.apigateway.model.RateLimitRule;
import com.pokeverse.apigateway.model.RateLimitScope;
import com.pokeverse.apigateway.model.TokenBucket;
import com.pokeverse.apigateway.redis.RedisRateLimiterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TokenBucketRateLimiterService {
    private static final Logger log = LoggerFactory.getLogger(TokenBucketRateLimiterService.class);

    private final RedisRateLimiterRepository redisRepository;
    private final RateLimitConfigLoader configLoader;

    public TokenBucketRateLimiterService(RedisRateLimiterRepository redisRepository,
                                         RateLimitConfigLoader configLoader) {
        this.redisRepository = redisRepository;
        this.configLoader = configLoader;
    }

    public boolean isAllowed(String service, String endpoint, RateLimitScope scope, String value) {
        MatchedConfig matched = configLoader.getConfig(service, endpoint, scope);

        // Removed unnecessary print statements
        if (matched == null || matched.getRule() == null) {
            log.info("Is config null? true");
            return true;
        }
        RateLimitRule config = matched.getRule();

        String key = String.format("ratelimit:%s:%s:%s:%s", service, matched.getMatchedPattern(), scope, value);
        TokenBucket bucket = redisRepository.getBucket(key, config.getCapacity(), config.getRefillRatePerSecond());

        if (bucket.getTokens() < 1) {
            return false;
        }

        bucket.setTokens(bucket.getTokens() - 1);
        redisRepository.saveBucket(key, bucket);
        log.info("Request allowed. Remaining tokens for key {}: {}", key, bucket.getTokens());
        return true;
    }
}