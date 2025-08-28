package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.model.QuizAnalysis;
import com.pokequiz.quiz.service.QuizAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@Tag(name = "Quiz Analysis Controller", description = "APIs for analyzing and retrieving quiz session results.")
public class QuizAnalysisController {

    private final QuizAnalysisService quizAnalysisService;

    @PostMapping("/{sessionId}")
    @Operation(summary = "Analyze a quiz session",
            description = "Triggers the analysis process for a completed quiz session, generating insights and results.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quiz analysis successful",
                            content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json",
                                    schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = QuizAnalysis.class))),
                    @ApiResponse(responseCode = "400", description = "Failed to analyze quiz, e.g., session not found or already analyzed")
            })
    public ResponseEntity<?> analyzeQuiz(
            @Parameter(description = "Unique identifier of the quiz session to analyze", example = "1")
            @PathVariable Long sessionId) {
        QuizAnalysis analysis = quizAnalysisService.analyzeQuiz(sessionId);
        return analysis != null ? ResponseEntity.ok(analysis) : ResponseEntity.badRequest().body("Failed to analyze quiz.");
    }

    @GetMapping("/{sessionId}")
    @Operation(summary = "Get quiz analysis by session ID",
            description = "Retrieves the detailed analysis for a specific quiz session.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quiz analysis",
                            content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json",
                                    schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = QuizAnalysis.class))),
                    @ApiResponse(responseCode = "404", description = "Quiz analysis not found for the given session ID")
            })
    public ResponseEntity<?> getAnalysis(
            @Parameter(description = "Unique identifier of the quiz session to retrieve analysis for", example = "1")
            @PathVariable Long sessionId) {
        return quizAnalysisService.getAnalysisBySessionId(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all quiz analyses for a user",
            description = "Retrieves a list of all quiz analyses associated with a specific user.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved user's quiz analyses",
                            content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json",
                                    schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = QuizAnalysis.class)))
            })
    public ResponseEntity<?> getUserAnalyses(
            @Parameter(description = "Unique identifier of the user to retrieve analyses for", example = "10")
            @PathVariable Long userId) {
        List<QuizAnalysis> analyses = quizAnalysisService.getUserAnalyses(userId);
        return ResponseEntity.ok(analyses);
    }
}