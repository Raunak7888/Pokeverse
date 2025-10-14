package com.pokeverse.play.quiz.controller;

import com.pokeverse.play.quiz.service.SinglePlayerAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api/quiz/single-player/analysis")
@RequiredArgsConstructor
public class SinglePlayerAnalysisController {

    private final SinglePlayerAnalysisService singlePlayerAnalysisService;

    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getAnalysisBySessionId(@PathVariable Long sessionId) {
        return singlePlayerAnalysisService.getAnalysisBySessionId(sessionId);
    }
}
