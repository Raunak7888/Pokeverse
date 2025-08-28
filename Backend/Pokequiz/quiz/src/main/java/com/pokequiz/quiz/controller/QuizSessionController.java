package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.dto.QuizSessionDTO;
import com.pokequiz.quiz.model.QuizSession;
import com.pokequiz.quiz.service.QuizSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@Tag(name = "Quiz Session Controller", description = "APIs for managing quiz sessions, including creation, updates, and retrieval.")
public class QuizSessionController {

    private final QuizSessionService quizSessionService;

    public QuizSessionController(QuizSessionService quizSessionService) {
        this.quizSessionService = quizSessionService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSession(@RequestBody QuizSessionDTO dto) {

        // ✅ let backend set startTime
        dto.setStartTime(LocalDateTime.now());

        if (dto.getUserId() == null || dto.getTotalQuestions() <= 0 ||
                dto.getDifficulty() == null || dto.getRegion() == null || dto.getQuizType() == null) {

            return ResponseEntity.badRequest().body("Invalid request body");
        }

        return ResponseEntity.ok(
                quizSessionService.createSession(dto)
        );
    }


    @PutMapping("/update/{sessionId}")
    @Operation(summary = "Update quiz session status",
            description = "Updates the status of an existing quiz session (e.g., to COMPLETED, CANCELED).",
            parameters = {
                    @Parameter(name = "sessionId", description = "Unique identifier of the quiz session to update", required = true, example = "1", in = ParameterIn.PATH),
                    @Parameter(name = "status", description = "New status for the quiz session", required = true, example = "COMPLETED",
                            schema = @Schema(implementation = QuizSession.SessionStatus.class))
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quiz session updated successfully",
                            content = @Content(schema = @Schema(implementation = QuizSession.class))),
                    @ApiResponse(responseCode = "404", description = "Quiz session not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid status provided")
            })
    public ResponseEntity<?> updateSession(
            @PathVariable Long sessionId,
            @RequestParam QuizSession.SessionStatus status) {

        QuizSession updatedSession = quizSessionService.updateSession(sessionId, status);
        if (updatedSession == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedSession);
    }

    @GetMapping
    @Operation(summary = "Get all quiz sessions",
            description = "Retrieves a list of all existing quiz sessions.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved all quiz sessions",
                            content = @Content(schema = @Schema(type = "array", implementation = QuizSession.class)))
            })
    public ResponseEntity<List<QuizSession>> getAllSessions() {
        List<QuizSession> sessions = quizSessionService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get a specific quiz session by ID",
            description = "Retrieves details of a single quiz session using its unique identifier.",
            parameters = {
                    @Parameter(name = "sessionId", description = "Unique identifier of the quiz session", required = true, example = "1", in = ParameterIn.PATH)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved quiz session",
                            content = @Content(schema = @Schema(implementation = QuizSession.class))),
                    @ApiResponse(responseCode = "404", description = "Quiz session not found")
            })
    public ResponseEntity<QuizSession> getSessionById(@PathVariable Long sessionId) {
        QuizSession session = quizSessionService.getSessionById(sessionId);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.notFound().build();
    }

    @GetMapping("/active/{userId}")
    @Operation(summary = "Get active session for a user",
            description = "Retrieves the currently active quiz session for a specific user.",
            parameters = {
                    @Parameter(name = "userId", description = "Unique identifier of the user", required = true, example = "10", in = ParameterIn.PATH)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved active session",
                            content = @Content(schema = @Schema(implementation = QuizSession.class))),
                    @ApiResponse(responseCode = "404", description = "No active session found for the user")
            })
    public ResponseEntity<QuizSession> getActiveSession(@PathVariable Long userId) {
        QuizSession activeSession = quizSessionService.findActiveSessionByUserId(userId);
        return activeSession != null ? ResponseEntity.ok(activeSession) : ResponseEntity.notFound().build();
    }
}