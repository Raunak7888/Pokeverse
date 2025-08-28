package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.dto.QuestionDTO;
import com.pokequiz.quiz.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz")
@Tag(name = "Quiz Management Controller", description = "APIs for managing quiz questions (CRUD operations and various fetching methods).")
public class QuizController {

    private final QuestionService questionService;

    public QuizController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/hello")
    @Operation(summary = "Test API endpoint",
            description = "Returns a simple 'Hello World' message to check API status.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successful response",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"response\": \"Hello World\"}")))
            })
    public ResponseEntity<?> hello() {
        return ResponseEntity.ok("{\"response\": \"Hello World\"}"); // Correct JSON formatting
    }

    @PostMapping("/add")
    @Operation(summary = "Add a new quiz question",
            description = "Adds a new quiz question to the system. Requires exactly 4 options and a correct answer.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Question details including question text, difficulty, region, quiz type, options, and correct answer.",
                    required = true,
                    content = @Content(schema = @Schema(implementation = QuestionDTO.class))
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quiz added successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid request body, correct answer missing, or incorrect number of options (must be 4)")
            })
    public ResponseEntity<String> addQuiz(@RequestBody QuestionDTO questionDTO) {
        if (questionDTO == null) {
            return ResponseEntity.badRequest().body("Question body cannot be null");
        }
        if(questionDTO.getCorrectAnswer() == null) {
            return ResponseEntity.badRequest().body("Correct answer cannot be null");
        }
        if (questionDTO.getOptions() == null || questionDTO.getOptions().size() != 4) {
            return ResponseEntity.badRequest().body("Options should be exactly 4.");
        }

        questionService.addQuiz(questionDTO);
        return ResponseEntity.ok("Quiz added successfully");
    }

    @GetMapping("/all")
    @Operation(summary = "Get all quiz questions",
            description = "Retrieves a list of all available quiz questions.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved all quizzes",
                            content = @Content(schema = @Schema(type = "array", implementation = QuestionDTO.class)))
            })
    public ResponseEntity<?> getAllQuizzes() {
        return ResponseEntity.ok(questionService.getAllQuizzes());
    }

    @GetMapping("/difficulty/all")
    @Operation(summary = "Get quizzes by difficulty",
            description = "Retrieves quiz questions filtered by a specific difficulty level.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes by difficulty",
                            content = @Content(schema = @Schema(type = "array", implementation = QuestionDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid difficulty parameter")
            })
    public ResponseEntity<?> getAllQuizzesByDifficulty(
            @Parameter(description = "Difficulty level of the quizzes (e.g., Easy, Medium, Hard)", example = "Easy")
            @RequestParam String difficulty) {
        return ResponseEntity.ok(questionService.getQuizzesByDifficulty(difficulty));
    }

    @GetMapping("/region/all")
    @Operation(summary = "Get quizzes by region",
            description = "Retrieves quiz questions filtered by a specific region.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes by region",
                            content = @Content(schema = @Schema(type = "array", implementation = QuestionDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid region parameter")
            })
    public ResponseEntity<?> getQuizzesByRegion(
            @Parameter(description = "Region of the quizzes (e.g., Kanto, Johto)", example = "Kanto")
            @RequestParam String region) {
        return ResponseEntity.ok(questionService.getQuizzesByRegion(region));
    }

    @GetMapping("/quiztype/all")
    @Operation(summary = "Get quizzes by quiz type",
            description = "Retrieves quiz questions filtered by a specific quiz type.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes by quiz type",
                            content = @Content(schema = @Schema(type = "array", implementation = QuestionDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid quiz type parameter")
            })
    public ResponseEntity<?> getQuizzesByQuizType(
            @Parameter(description = "Type of quiz (e.g., Trivia, Battle)", example = "Trivia")
            @RequestParam String quizType) {
        return ResponseEntity.ok(questionService.getQuizzesByQuizType(quizType));
    }

    @GetMapping("/region/difficulty/quizType/all")
    @Operation(summary = "Get quizzes by region, difficulty, and quiz type",
            description = "Retrieves quiz questions filtered by optional region, difficulty, and quiz type.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes based on criteria",
                            content = @Content(schema = @Schema(type = "array", implementation = QuestionDTO.class)))
            })
    public ResponseEntity<?> getQuizzesByRegionAndDifficulty(
            @Parameter(description = "Optional region filter", example = "Kanto")
            @RequestParam(required = false) String region,
            @Parameter(description = "Optional difficulty filter", example = "Medium")
            @RequestParam(required = false) String difficulty,
            @Parameter(description = "Optional quiz type filter", example = "Trivia")
            @RequestParam(required = false) String quizType) {
        return ResponseEntity.ok(questionService.getQuizzesByRegionAndDifficulty(region, difficulty,quizType));
    }

    @GetMapping("/random")
    @Operation(summary = "Get random quizzes",
            description = "Retrieves a specified number of random quiz questions.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved random quizzes",
                            content = @Content(schema = @Schema(type = "array", implementation = QuestionDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid limit parameter")
            })
    public ResponseEntity<?> getRandomQuizzes(
            @Parameter(description = "Number of random quizzes to retrieve", example = "5")
            @RequestParam int limit) {
        return ResponseEntity.ok(questionService.getRandomQuizzes(limit));
    }

    @GetMapping("/random/difficulty/region/quizType")
    @Operation(summary = "Get random quizzes by difficulty, region, and quiz type",
            description = "Retrieves a specified number of random quiz questions filtered by optional difficulty, region, and quiz type.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved random quizzes based on criteria",
                            content = @Content(schema = @Schema(type = "array", implementation = QuestionDTO.class))),
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
        return ResponseEntity.ok(questionService.getRandomQuizzesAsPerDifficultyAndRegion(region, difficulty, quizType, limit));
    }
}