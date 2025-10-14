package com.pokeverse.play.quiz.utils;

import com.pokeverse.play.quiz.dto.ApiError;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class ErrorUtil {
    public ResponseEntity<ApiError> badRequest(String message) {
        return ResponseEntity.badRequest().body(new ApiError(message, java.time.Instant.now()));
    }

    public ResponseEntity<ApiError> notFound(String message) {
        return ResponseEntity.status(404).body(new ApiError(message, java.time.Instant.now()));
    }
}
