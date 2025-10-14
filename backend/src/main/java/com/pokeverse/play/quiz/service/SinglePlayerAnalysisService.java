package com.pokeverse.play.quiz.service;

import com.pokeverse.play.model.*;
import com.pokeverse.play.quiz.dto.QuestionAttemptDto;
import com.pokeverse.play.quiz.dto.QuizAnalysisDto;
import com.pokeverse.play.quiz.utils.ErrorUtil;
import com.pokeverse.play.repository.SinglePlayerSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SinglePlayerAnalysisService {
    private static final String SESSION_CACHE = "SESSION";
    private static final String ANAYLSIS_CACHE = "ANALYSIS";
    private final SinglePlayerSessionRepository singlePlayerSessionRepository;
    @Autowired
    private RedisCacheService redisSessionCacheService;
    @Autowired
    private RedisCacheService redisAnalysisCacheService;
    private final ErrorUtil errorUtil;

    public ResponseEntity<?> getAnalysisBySessionId(Long sessionId) {

        QuizAnalysisDto cachedAnalysis = redisAnalysisCacheService.get(ANAYLSIS_CACHE, sessionId, QuizAnalysisDto.class)
                .orElse(null);

        if (cachedAnalysis != null) {
            log.info("Returning analysis from cache for sessionId={}", sessionId);
            return ResponseEntity.ok(cachedAnalysis);
        }

        SinglePlayerSession session = redisSessionCacheService.get(SESSION_CACHE, sessionId, SinglePlayerSession.class)
                .orElse(null);

        if (session == null) {
            session = singlePlayerSessionRepository.findById(sessionId).orElse(null);

            if (session == null) {
                log.info("SessionId={} not found", sessionId);
                return errorUtil.notFound("Session not found");
            }

            redisSessionCacheService.set(SESSION_CACHE, sessionId, session);
        }

        if (session.getAttempts() == null || session.getAttempts().isEmpty()) {
            return errorUtil.notFound("No attempts found for this session");
        }

        QuizAnalysisDto analysisDto = computeAnalysis(session);

        redisAnalysisCacheService.set(ANAYLSIS_CACHE, sessionId, analysisDto);

        return ResponseEntity.ok(analysisDto);
    }

    // ---------------------- Helper Methods ----------------------
    private QuizAnalysisDto computeAnalysis(SinglePlayerSession session) {

        List<SinglePlayerAttempts> attempts = session.getAttempts();
        int totalQuestions = attempts.size();
        int correctAnswers = (int) attempts.stream().filter(SinglePlayerAttempts::isCorrect).count();
        int wrongAnswers = totalQuestions - correctAnswers;
        double accuracy = (double) correctAnswers / totalQuestions * 100;

        List<Long> timesEachQuestion = new ArrayList<>();
        Instant previous = session.getStartedAt();

        for (SinglePlayerAttempts attempt : attempts) {
            long timeTaken = Duration.between(previous, attempt.getAnsweredAt()).toMillis();
            timesEachQuestion.add(timeTaken);
            previous = attempt.getAnsweredAt();
        }

        long totalDuration = timesEachQuestion.stream().mapToLong(Long::longValue).sum();
        long averageTimePerQuestion = totalDuration / totalQuestions;
        long fastestAnswerTime = timesEachQuestion.stream().mapToLong(Long::longValue).min().orElse(0);
        long slowestAnswerTime = timesEachQuestion.stream().mapToLong(Long::longValue).max().orElse(0);

        String answerSpeedRating = getAnswerSpeedRating(averageTimePerQuestion);
        String performanceRating = getPerformanceRating(accuracy);

        List<QuestionAttemptDto> attemptDtos = attempts.stream()
                .map(a -> QuestionAttemptDto.builder()
                        .id(a.getId())
                        .questionNo(a.getQuestion().getId().intValue())
                        .question(a.getQuestion().getQuestion())
                        .selectedAnswer(a.getSelectedAnswer())
                        .correct(a.isCorrect())
                        .build())
                .toList();

        return QuizAnalysisDto.builder()
                .sessionId(session.getId())
                .userId(session.getUserId())
                .quizType("SINGLE_PLAYER")
                .difficulty(session.getDifficulty())
                .region(session.getRegion())
                .totalQuestions(totalQuestions)
                .correctAnswers(correctAnswers)
                .wrongAnswers(wrongAnswers)
                .accuracy(accuracy)
                .totalDuration(totalDuration)
                .averageTimePerQuestion(averageTimePerQuestion)
                .fastestAnswerTime(fastestAnswerTime)
                .slowestAnswerTime(slowestAnswerTime)
                .answerSpeedRating(answerSpeedRating)
                .performanceRating(performanceRating)
                .questionAttempts(attemptDtos)
                .createdAt(Instant.now())
                .build();
    }

    private String getAnswerSpeedRating(long avgTimeMs) {
        if (avgTimeMs < 5000) return Rating.MEWTWO.name();
        else if (avgTimeMs < 10000) return Rating.SNORLAX.name();
        else if (avgTimeMs < 15000) return Rating.CHARIZARD.name();
        else if (avgTimeMs < 20000) return Rating.PIKACHU.name();
        else return Rating.CATERPIE.name();
    }

    private String getPerformanceRating(double accuracy) {
        if (accuracy == 100) return Rating.MEWTWO.name();
        else if (accuracy >= 80) return Rating.SNORLAX.name();
        else if (accuracy >= 60) return Rating.CHARIZARD.name();
        else if (accuracy >= 40) return Rating.PIKACHU.name();
        else return Rating.CATERPIE.name();
    }
}
