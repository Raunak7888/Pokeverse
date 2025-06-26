package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.dto.QuizSessionDTO;
import com.pokequiz.quiz.model.QuizSession;
import com.pokequiz.quiz.service.QuizSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizSessionController {

    private final QuizSessionService quizSessionService;

    public QuizSessionController(QuizSessionService quizSessionService) {
        this.quizSessionService = quizSessionService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSession(@RequestBody QuizSessionDTO dto) {
        if (dto.getUserId() == null || dto.getTotalQuestions() <= 0 ||
                dto.getDifficulty() == null || dto.getRegion() == null || dto.getQuizType() == null) {
            return ResponseEntity.badRequest().body("Invalid request body");
        }
        return ResponseEntity.ok(quizSessionService.createSession(dto));
    }

    @PutMapping("/update/{sessionId}")
    public ResponseEntity<?> updateSession(
            @PathVariable Long sessionId,
            @RequestParam QuizSession.SessionStatus status) {

        QuizSession updatedSession = quizSessionService.updateSession(sessionId, status);
        if (updatedSession == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedSession);
    }

    // 📊 Get all quiz sessions
    @GetMapping
    public ResponseEntity<List<QuizSession>> getAllSessions() {
        List<QuizSession> sessions = quizSessionService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }

    // 🔍 Get a specific quiz session by ID
    @GetMapping("/{sessionId}")
    public ResponseEntity<QuizSession> getSessionById(@PathVariable Long sessionId) {
        QuizSession session = quizSessionService.getSessionById(sessionId);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.notFound().build();
    }

    // 📌 Get active session for a user
    @GetMapping("/active/{userId}")
    public ResponseEntity<QuizSession> getActiveSession(@PathVariable Long userId) {
        QuizSession activeSession = quizSessionService.findActiveSessionByUserId(userId);
        return activeSession != null ? ResponseEntity.ok(activeSession) : ResponseEntity.notFound().build();
    }
}
