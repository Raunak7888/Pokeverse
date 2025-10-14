package com.pokeverse.play.quiz.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
public class RedisCacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private static final Duration DEFAULT_TTL = Duration.ofMinutes(30);

    public <T> void set(String prefix, Long id, T object) {
        set(prefix, id, object, DEFAULT_TTL);
    }

    public <T> void set(String prefix, Long id, T object, Duration ttl) {
        String key = buildKey(prefix, id);
        try {
            redisTemplate.opsForValue().set(key, object, ttl);
        } catch (Exception e) {
            System.err.println("[RedisCacheService] Failed to set object for key: " + key + " | Error: " + e.getMessage());
        }
    }

    public void set(String prefix, Long id, Long value) {
        String key = buildKey(prefix, id);
        try {
            stringRedisTemplate.opsForValue().set(key, value.toString(), DEFAULT_TTL);
        } catch (Exception e) {
            System.err.println("[RedisCacheService] Failed to set long value for key: " + key + " | Error: " + e.getMessage());
        }
    }

    public <T> Optional<T> get(String prefix, Long id, Class<T> clazz) {
        String key = buildKey(prefix, id);
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (clazz.isInstance(value)) {
                return Optional.of(clazz.cast(value));
            }
        } catch (Exception e) {
            System.err.println("[RedisCacheService] Failed to get object for key: " + key + " | Error: " + e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Long> get(String prefix, Long id) {
        String key = buildKey(prefix, id);
        try {
            String val = stringRedisTemplate.opsForValue().get(key);
            if (val == null) return Optional.empty();
            return Optional.of(Long.parseLong(val));
        } catch (Exception e) {
            System.err.println("[RedisCacheService] Failed to get long value for key: " + key + " | Error: " + e.getMessage());
            return Optional.empty();
        }
    }

    public void delete(String prefix, Long id) {
        String key = buildKey(prefix, id);
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            System.err.println("[RedisCacheService] Failed to delete key: " + key + " | Error: " + e.getMessage());
        }
    }

    public boolean exists(String prefix, Long id) {
        String key = buildKey(prefix, id);
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            System.err.println("[RedisCacheService] Failed to check existence for key: " + key + " | Error: " + e.getMessage());
            return false;
        }
    }

    private String buildKey(String prefix, Long id) {
        return prefix + ":" + id;
    }
}
