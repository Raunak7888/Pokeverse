package com.pokeverse.play.quiz.service;

import com.pokeverse.play.model.Question;
import com.pokeverse.play.model.SinglePlayerAttempts;
import com.pokeverse.play.model.SinglePlayerSession;
import com.pokeverse.play.model.Status;
import com.pokeverse.play.quiz.dto.SinglePlayerAttemptDto;
import com.pokeverse.play.quiz.dto.SubmitAttemptDto;
import com.pokeverse.play.quiz.utils.ErrorUtil;
import com.pokeverse.play.repository.QuestionRepository;
import com.pokeverse.play.repository.SinglePlayerSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SinglePlayerAttemptsService {
    private static final String SESSION_CACHE = "SESSION";
    private final ErrorUtil errorUtil;
    private final QuestionRepository questionRepository;
    private final SinglePlayerSessionRepository singlePlayerSessionRepository;
    @Autowired
    private final RedisCacheService redisCacheService;

    public ResponseEntity<?> submitAttempt(SubmitAttemptDto dto) {

        SinglePlayerSession session = redisCacheService.get(SESSION_CACHE, dto.sessionId(), SinglePlayerSession.class)
                .orElse(null);

        if (session == null) {
            session = singlePlayerSessionRepository.findById(dto.sessionId()).orElse(null);
            if (session == null) {
                return errorUtil.notFound("Session not found");
            }
            redisCacheService.set(SESSION_CACHE, session.getId(), session);
        }

        if (session.getStatus() != Status.IN_PROGRESS) {
            return errorUtil.badRequest("Session is not in progress");
        }

        SinglePlayerAttempts attempt = session.getAttempts().stream()
                .filter(a -> a.getQuestion().getId().equals(dto.questionId()))
                .findFirst()
                .orElse(null);

        if (attempt == null) {
            return errorUtil.notFound("Attempt not found for this question");
        }

        Question question = questionRepository.findById(dto.questionId()).orElse(null);
        if (question == null) {
            return errorUtil.badRequest("Invalid question ID");
        }

        attempt.setSelectedAnswer(dto.selectedAnswer());
        attempt.setCorrect(dto.selectedAnswer().equals(question.getAnswer()));
        attempt.setAnsweredAt(Instant.now());

        SinglePlayerAttemptDto responseDto = new SinglePlayerAttemptDto(
                question.getId(),
                attempt.getSelectedAnswer(),
                attempt.isCorrect(),
                question.getAnswer()
        );

        session.setCurrentRound(session.getCurrentRound() + 1);

        if (session.getCurrentRound() > session.getRounds()) {
            session.setStatus(Status.COMPLETED);
        }

        redisCacheService.set(SESSION_CACHE, session.getId(), session);

        singlePlayerSessionRepository.save(session);

        return ResponseEntity.ok(responseDto);
    }
}
