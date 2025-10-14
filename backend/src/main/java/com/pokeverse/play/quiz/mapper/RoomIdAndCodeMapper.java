package com.pokeverse.play.quiz.mapper;

import com.pokeverse.play.quiz.service.RedisCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@RequiredArgsConstructor
public class RoomIdAndCodeMapper {

    private final RedisCacheService redisCacheService;
    private final Random random = new Random();
    private static final String CODE_PREFIX = "room_code";

    public Long getRoomIdByCode(Long code) {
        return redisCacheService.get(CODE_PREFIX, code).orElse(null);
    }

    public Long assignCodeToRoom(Long roomId) {
        Long code = generateUniqueCode();
        redisCacheService.set(CODE_PREFIX, code, roomId);
        System.out.println("Code in mapper: "+ getRoomIdByCode(code));
        return code;
    }

    private Long generateUniqueCode() {
        Long code;
        do {
            code = (long) (100000 + random.nextInt(900000)); // ensures 6 digits
        } while (getRoomIdByCode(code) != null);
        return code;
    }

    public void deleteRoom(Long code) {
        redisCacheService.delete(CODE_PREFIX, code);
    }
}
