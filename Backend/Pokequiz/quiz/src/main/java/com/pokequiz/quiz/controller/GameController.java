package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.service.GameService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz/game")
@Tag(name = "Game Controller", description = "APIs for managing quiz game operations, including fetching questions based on various criteria.")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/test")
    @Operation(summary = "Test API endpoint",
            description = "Returns a simple 'Hello from quiz service' message to check API status.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successful response",
                            content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json",
                                    schema = @io.swagger.v3.oas.annotations.media.Schema(example = "Hello from quiz service")))
            })
    public ResponseEntity<?> hello() {
        return ResponseEntity.ok("Hello from quiz service");
    }

    @GetMapping("/all")
    @Operation(summary = "Get all quizzes",
            description = "Retrieves a list of all available quiz questions.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved all quizzes",
                            content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json"))
                    // Assuming GameService.getAllQuizzes() returns a List<QuestionDTO> or similar
            })
    public ResponseEntity<?> getAllQuizzes() {
        return ResponseEntity.ok(gameService.getAllQuizzes());
    }

    @GetMapping("/difficulty/all")
    @Operation(summary = "Get quizzes by difficulty",
            description = "Retrieves quiz questions filtered by a specific difficulty level.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes by difficulty"),
                    @ApiResponse(responseCode = "400", description = "Invalid difficulty parameter")
            })
    public ResponseEntity<?> getAllQuizzesByDifficulty(
            @Parameter(description = "Difficulty level of the quizzes (e.g., Easy, Medium, Hard)", example = "Easy")
            @RequestParam String difficulty) {
        return ResponseEntity.ok(gameService.getQuizzesByDifficulty(difficulty));
    }

    @GetMapping("/region/all")
    @Operation(summary = "Get quizzes by region",
            description = "Retrieves quiz questions filtered by a specific region.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes by region"),
                    @ApiResponse(responseCode = "400", description = "Invalid region parameter")
            })
    public ResponseEntity<?> getQuizzesByRegion(
            @Parameter(description = "Region of the quizzes (e.g., Kanto, Johto)", example = "Kanto")
            @RequestParam String region) {
        return ResponseEntity.ok(gameService.getQuizzesByRegion(region));
    }

    @GetMapping("/quiztype/all")
    @Operation(summary = "Get quizzes by quiz type",
            description = "Retrieves quiz questions filtered by a specific quiz type.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes by quiz type"),
                    @ApiResponse(responseCode = "400", description = "Invalid quiz type parameter")
            })
    public ResponseEntity<?> getQuizzesByQuizType(
            @Parameter(description = "Type of quiz (e.g., Trivia, Battle)", example = "Trivia")
            @RequestParam String quizType) {
        return ResponseEntity.ok(gameService.getQuizzesByQuizType(quizType));
    }

    @GetMapping("/region/difficulty/quiztype/all")
    @Operation(summary = "Get quizzes by region, difficulty, and quiz type",
            description = "Retrieves quiz questions filtered by optional region, difficulty, and quiz type.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes based on criteria")
            })
    public ResponseEntity<?> getQuizzesByRegionAndDifficulty(
            @Parameter(description = "Optional region filter", example = "Kanto")
            @RequestParam(required = false) String region,
            @Parameter(description = "Optional difficulty filter", example = "Medium")
            @RequestParam(required = false) String difficulty,
            @Parameter(description = "Optional quiz type filter", example = "Trivia")
            @RequestParam(required = false) String quizType) {
        return ResponseEntity.ok(gameService.getQuizzesByRegionAndDifficulty(region, difficulty, quizType));
    }

    @GetMapping("/random")
    @Operation(summary = "Get random quizzes",
            description = "Retrieves a specified number of random quiz questions.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved random quizzes"),
                    @ApiResponse(responseCode = "400", description = "Invalid limit parameter")
            })
    public ResponseEntity<?> getRandomQuizzes(
            @Parameter(description = "Number of random quizzes to retrieve", example = "5")
            @RequestParam int limit) {
        return ResponseEntity.ok(gameService.getRandomQuizzes(limit));
    }

    @GetMapping("/random/difficulty/region/quiztype")
    @Operation(summary = "Get random quizzes by difficulty, region, and quiz type",
            description = "Retrieves a specified number of random quiz questions filtered by optional difficulty, region, and quiz type.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved random quizzes based on criteria"),
                    @ApiResponse(responseCode = "400", description = "Invalid limit parameter")
            })
    public ResponseEntity<?> getRandomQuizzesAsPerDifficultyAndRegion(
            @Parameter(description = "Optional region filter", example = "Johto")
            @RequestParam(required = false) String region,
            @Parameter(description = "Optional difficulty filter", example = "Hard")
            @RequestParam(required = false) String difficulty,
            @Parameter(description = "Optional quiz type filter", example = "Battle")
            @RequestParam(required = false) String quizType,
            @Parameter(description = "Number of random quizzes to retrieve", example = "3")
            @RequestParam int limit) {
        return ResponseEntity.ok(gameService.getRandomQuizzesAsPerDifficultyAndRegion(region, difficulty, quizType, limit));
    }

    @GetMapping("/gradually")
    @Operation(summary = "Get quizzes with gradually increasing difficulty",
            description = "Retrieves a specified number of quizzes, with the difficulty gradually increasing.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes with gradually increasing difficulty"),
                    @ApiResponse(responseCode = "400", description = "Invalid limit parameter")
            })
    public ResponseEntity<?> graduallyIncreasingDifficulty(
            @Parameter(description = "Number of quizzes to retrieve", example = "10")
            @RequestParam int limit) {
        return ResponseEntity.ok(gameService.graduallyIncreasingDifficulty(limit));
    }

}
