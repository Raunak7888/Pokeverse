package com.pokeverse.apigateway.redis;

import com.pokeverse.apigateway.model.TokenBucket;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Component
public class RedisRateLimiterRepository {
    private final HashOperations<String, String, String> hashOps;
    private final RedisTemplate<String, String> redisTemplate;

    public RedisRateLimiterRepository(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.hashOps = redisTemplate.opsForHash();
    }

    /**
     * Retrieves and refills the token bucket for the given key.
     *
     * @param key Redis key
     * @param capacity Maximum number of tokens
     * @param refillRatePerSecond Tokens refilled per second
     * @return Refilled TokenBucket
     */
    public synchronized TokenBucket getBucket(String key, int capacity, double refillRatePerSecond) {
        long now = Instant.now().toEpochMilli();

        try {
            Map<String, String> stored = hashOps.entries(key);

            double tokens;
            long lastRefill;

            if (stored.isEmpty()) {
                tokens = capacity;
                lastRefill = now;
            } else {
                tokens = parseDoubleOrDefault(stored.get("tokens"), capacity, key);
                lastRefill = parseLongOrDefault(stored.get("lastRefillTimestamp"), now, key);
            }

            double elapsedSeconds = (now - lastRefill) / 1000.0;
            double newTokens = Math.min(capacity, tokens + elapsedSeconds * refillRatePerSecond);


            // Save updated state back to Redis
            hashOps.put(key, "tokens", String.valueOf(newTokens));
            hashOps.put(key, "lastRefillTimestamp", String.valueOf(now));
            redisTemplate.expire(key, Duration.ofDays(1));

            return new TokenBucket(newTokens, now);

        } catch (Exception e) {
            return new TokenBucket(capacity, now);
        }
    }

    public synchronized void saveBucket(String key, TokenBucket bucket) {
        try {
            hashOps.put(key, "tokens", String.valueOf(bucket.getTokens()));
            hashOps.put(key, "lastRefillTimestamp", String.valueOf(bucket.getLastRefillTimestamp()));
            redisTemplate.expire(key, Duration.ofDays(1));
        } catch (Exception e) {
            System.out.println("⚠️ [saveBucket] Error saving bucket to Redis for key: " + key);
        }
    }

    private double parseDoubleOrDefault(String value, double defaultValue, String key) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private long parseLongOrDefault(String value, long defaultValue, String key) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
