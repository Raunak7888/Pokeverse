package com.pokeverse.play.quiz.controller;

import com.pokeverse.play.quiz.dto.SinglePlayerSessionCreateDto;
import com.pokeverse.play.quiz.service.SinglePlayerSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
    @RequestMapping("/v1/api/quiz/single-player/session")
@RequiredArgsConstructor
public class SinglePlayerSessionController {

    private final SinglePlayerSessionService singlePlayerSessionService;

    @GetMapping("/test")
    public String test() {
        return "Single Player Quiz Controller is working!";
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSinglePlayerSession(@RequestBody SinglePlayerSessionCreateDto singlePlayerSessionCreateDto) {
        return singlePlayerSessionService.createSinglePlayerSession(singlePlayerSessionCreateDto);
    }

    @GetMapping("/session-by-id")
    public ResponseEntity<?> getSinglePlayerSession(@RequestParam Long sessionId) {
        return singlePlayerSessionService.getSinglePlayerSession(sessionId);
    }

    @GetMapping("/session-by-user")
    public ResponseEntity<?> getSinglePlayerSessionsByUser(@RequestParam Long userId) {
        return singlePlayerSessionService.getSinglePlayerSessionsByUser(userId);
    }

}