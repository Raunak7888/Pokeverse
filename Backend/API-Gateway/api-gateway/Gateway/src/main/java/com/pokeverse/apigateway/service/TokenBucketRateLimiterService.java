package com.pokeverse.apigateway.service;

import com.pokeverse.apigateway.config.RateLimitConfigLoader;
import com.pokeverse.apigateway.model.RateLimitRule;
import com.pokeverse.apigateway.model.RateLimitScope;
import com.pokeverse.apigateway.model.TokenBucket;
import com.pokeverse.apigateway.redis.RedisRateLimiterRepository;
import org.springframework.stereotype.Service;

@Service
public class TokenBucketRateLimiterService {

    private final RedisRateLimiterRepository redisRepository;
    private final RateLimitConfigLoader configLoader;

    public TokenBucketRateLimiterService(RedisRateLimiterRepository redisRepository,
                                         RateLimitConfigLoader configLoader) {
        this.redisRepository = redisRepository;
        this.configLoader = configLoader;
    }

    public boolean isAllowed(String service, String endpoint, RateLimitScope scope, String value) {
        RateLimitRule config = configLoader.getConfig(service, endpoint, scope);
        if (config == null) {
            return true;
        }
        String key = String.format("ratelimit:%s:%s:%s:%s", service, endpoint, scope, value);
        TokenBucket bucket = redisRepository.getBucket(key, config.getCapacity(), config.getRefillRatePerSecond());
        if (bucket.getTokens() < 1) {
            return false;
        }
        bucket.setTokens(bucket.getTokens() - 1);
        redisRepository.saveBucket(key, bucket);
        return true;
    }
}
