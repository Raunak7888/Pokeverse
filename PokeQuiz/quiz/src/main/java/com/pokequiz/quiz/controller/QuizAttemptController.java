package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.dto.QuizAttemptDTO;
import com.pokequiz.quiz.model.QuizAttempt;
import com.pokequiz.quiz.model.QuizSession;
import com.pokequiz.quiz.repository.QuizSessionRepository;
import com.pokequiz.quiz.service.QuizAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Quiz Attempt Controller", description = "APIs for managing and retrieving quiz attempts.")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;
    private final QuizSessionRepository quizSessionRepository;

    public QuizAttemptController(QuizAttemptService quizAttemptService, QuizSessionRepository quizSessionRepository) {
        this.quizAttemptService = quizAttemptService;
        this.quizSessionRepository = quizSessionRepository;
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit a quiz attempt",
            description = "Submits a player's answer for a question within a quiz session and evaluates it.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Details of the quiz attempt including session ID, question ID, selected answer, and timestamps.",
                    required = true,
                    content = @Content(schema = @Schema(implementation = QuizAttemptDTO.class))
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quiz attempt submitted and evaluated successfully",
                            content = @Content(schema = @Schema(implementation = QuizAttempt.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid request body or invalid start/end time")
            })
    public ResponseEntity<?> submitQuizAttempt(@RequestBody QuizAttemptDTO dto) {
        if (dto.getSessionId() == null || dto.getQuestionId() == null || dto.getSelectedAnswer() == null ||
                dto.getStartTime() == null || dto.getEndTime() == null) {
            return ResponseEntity.badRequest().body("Invalid request body");
        }

        if (dto.getStartTime().isAfter(dto.getEndTime())) {
            return ResponseEntity.badRequest().body("Invalid start and end time");
        }

        QuizAttempt result = quizAttemptService.evaluateQuizAttempt(dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/session")
    @Operation(summary = "Get quiz attempts by session ID",
            description = "Retrieves all quiz attempts for a given quiz session.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quiz attempts",
                            content = @Content(schema = @Schema(type = "array", implementation = QuizAttempt.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid session ID")
            })
    public ResponseEntity<List<QuizAttempt>> getAttemptsBySession(
            @Parameter(description = "Unique identifier of the quiz session", example = "1")
            @RequestParam Long sessionId) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid session ID: " + sessionId));

        List<QuizAttempt> attempts = quizAttemptService.getAttemptsBySession(session);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/session/time")
    @Operation(summary = "Get quiz attempts by session ID and time range",
            description = "Retrieves quiz attempts for a given session within a specified time range.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quiz attempts by session and time",
                            content = @Content(schema = @Schema(type = "array", implementation = QuizAttempt.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid session ID or invalid start/end time")
            })
    public ResponseEntity<?> getAttemptsBySessionAndTime(
            @Parameter(description = "Unique identifier of the quiz session", example = "1")
            @RequestParam Long sessionId,
            @Parameter(description = "Start timestamp for filtering attempts (ISO 8601 format)", example = "2023-01-01T10:00:00")
            @RequestParam LocalDateTime startTime,
            @Parameter(description = "End timestamp for filtering attempts (ISO 8601 format)", example = "2023-01-01T11:00:00")
            @RequestParam LocalDateTime endTime) {
        if (startTime.isAfter(endTime)) {
            return ResponseEntity.badRequest().body("Invalid start and end time");
        }
        QuizSession session;
        try {
            session = quizSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid session ID: " + sessionId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid session ID: " + sessionId);
        }

        List<QuizAttempt> attempts = quizAttemptService.getAttemptsBySessionAndTime(session, startTime, endTime);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/question")
    @Operation(summary = "Get quiz attempts by question ID",
            description = "Retrieves all quiz attempts for a specific question across all sessions.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quiz attempts",
                            content = @Content(schema = @Schema(type = "array", implementation = QuizAttempt.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid question ID")
            })
    public ResponseEntity<List<QuizAttempt>> getAttemptsByQuestionId(
            @Parameter(description = "Unique identifier of the question", example = "101")
            @RequestParam Long questionId) {
        List<QuizAttempt> attempts = quizAttemptService.getAttemptsByQuestionId(questionId);
        return ResponseEntity.ok(attempts);
    }
}