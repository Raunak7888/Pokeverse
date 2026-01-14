package com.pokeverse.play.quiz.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisRoomAndQuestionService {

    private final StringRedisTemplate redis;

    private static final Duration ROOM_TTL = Duration.ofMinutes(10);
    private static final Duration QUESTION_TTL = Duration.ofSeconds(30);
    private static final Duration LOCK_TTL = Duration.ofSeconds(5);

    /* ---------------- KEYS ---------------- */

    private String activeQuestionKey(Long roomId) {
        return "quiz:room:" + roomId + ":activeQuestion";
    }

    private String questionStartKey(Long roomId) {
        return "quiz:room:" + roomId + ":questionStart";
    }

    private String answeredKey(Long roomId) {
        return "quiz:room:" + roomId + ":answeredCount";
    }

    private String totalPlayersKey(Long roomId) {
        return "quiz:room:" + roomId + ":totalPlayers";
    }

    private String roundKey(Long roomId) {
        return "quiz:room:" + roomId + ":round";
    }

    private String lockKey(Long roomId) {
        return "quiz:room:" + roomId + ":lock";
    }

    /* ---------------- LOCK ---------------- */

    public boolean acquireLock(Long roomId) {
        Boolean ok = redis.opsForValue()
                .setIfAbsent(lockKey(roomId), "1", LOCK_TTL);
        return Boolean.TRUE.equals(ok);
    }

    public void releaseLock(Long roomId) {
        redis.delete(lockKey(roomId));
    }

    /* ---------------- ACTIVE QUESTION ---------------- */

    public void setActiveQuestion(Long roomId, Long questionId) {
        redis.opsForValue().set(
                activeQuestionKey(roomId),
                questionId.toString(),
                QUESTION_TTL
        );
    }

    public void setActiveQuestionStart(Long roomId) {
        redis.opsForValue().set(
                questionStartKey(roomId),
                String.valueOf(System.currentTimeMillis()),
                QUESTION_TTL
        );
    }

    public Long getActiveQuestion(Long roomId) {
        String v = redis.opsForValue().get(activeQuestionKey(roomId));
        return v == null ? null : Long.parseLong(v);
    }

    public boolean hasActiveQuestion(Long roomId) {
        return Boolean.TRUE.equals(redis.hasKey(activeQuestionKey(roomId)));
    }

    public Long getActiveQuestionStart(Long roomId) {
        String v = redis.opsForValue().get(questionStartKey(roomId));
        return v == null ? 0L : Long.parseLong(v);
    }

    public void clearActiveQuestion(Long roomId) {
        redis.delete(activeQuestionKey(roomId));
        redis.delete(questionStartKey(roomId));
        redis.delete(answeredKey(roomId));
        redis.delete(totalPlayersKey(roomId));
    }

    /* ---------------- PLAYER ANSWER STATE ---------------- */

    public void initPlayerAnswerState(Long roomId, int totalPlayers) {
        redis.opsForValue().set(answeredKey(roomId), "0", QUESTION_TTL);
        redis.opsForValue().set(totalPlayersKey(roomId), String.valueOf(totalPlayers), QUESTION_TTL);
    }

    public long incrementAnswered(Long roomId) {
        Long result = redis.opsForValue().increment(answeredKey(roomId));
        if (result == null) {
            throw new IllegalStateException(
                    "Redis INCR returned null for roomId=" + roomId
            );
        }
        return result;
    }

    public long getAnsweredCount(Long roomId) {
        String v = redis.opsForValue().get(answeredKey(roomId));
        return v == null ? 0L : Long.parseLong(v);
    }

    public int getTotalPlayers(Long roomId) {
        String v = redis.opsForValue().get(totalPlayersKey(roomId));
        return v == null ? 0 : Integer.parseInt(v);
    }

    /* ---------------- ROUND ---------------- */

    public int getRound(Long roomId) {
        String v = redis.opsForValue().get(roundKey(roomId));
        return v == null ? 1 : Integer.parseInt(v);
    }

    public void incrementRound(Long roomId) {
        redis.opsForValue().increment(roundKey(roomId));
        redis.expire(roundKey(roomId), ROOM_TTL);
    }

    /* ---------------- FULL CLEANUP ---------------- */

    public void clearRoom(Long roomId) {
        redis.delete(activeQuestionKey(roomId));
        redis.delete(questionStartKey(roomId));
        redis.delete(answeredKey(roomId));
        redis.delete(totalPlayersKey(roomId));
        redis.delete(roundKey(roomId));
        redis.delete(lockKey(roomId));
        log.info("Cleared ALL Redis state for room {}", roomId);
    }
}
