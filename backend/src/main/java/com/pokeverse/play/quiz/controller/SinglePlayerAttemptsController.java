package com.pokeverse.play.quiz.controller;

import com.pokeverse.play.quiz.dto.SubmitAttemptDto;
import com.pokeverse.play.quiz.service.SinglePlayerAttemptsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api/quiz/single-player/attempts")
@RequiredArgsConstructor
public class SinglePlayerAttemptsController {

    private final SinglePlayerAttemptsService singlePlayerAttemptsService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitAttempt(@RequestBody SubmitAttemptDto dto) {
        return singlePlayerAttemptsService.submitAttempt(dto);
    }
}
