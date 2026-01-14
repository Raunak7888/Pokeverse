package com.pokeverse.play.quiz.service;

import com.pokeverse.play.model.Question;
import com.pokeverse.play.model.SinglePlayerAttempts;
import com.pokeverse.play.model.SinglePlayerSession;
import com.pokeverse.play.model.Status;
import com.pokeverse.play.quiz.dto.QuestionWithOutAnswerDto;
import com.pokeverse.play.quiz.dto.SinglePlayerSessionCreateDto;
import com.pokeverse.play.quiz.dto.SinglePlayerSessionDto;
import com.pokeverse.play.quiz.dto.SinglePlayerSessionResponseDto;
import com.pokeverse.play.quiz.utils.ErrorUtil;
import com.pokeverse.play.repository.QuestionRepository;
import com.pokeverse.play.repository.SinglePlayerSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class SinglePlayerSessionService {
    private static final String SESSION_CACHE = "SESSION";

    private final QuestionRepository questionRepository;
    private final SinglePlayerSessionRepository singlePlayerSessionRepository;

    @Autowired
    private final RedisCacheService redisCacheService;

    private final ErrorUtil errorUtil;

    public ResponseEntity<?> createSinglePlayerSession(SinglePlayerSessionCreateDto dto) {

        if (dto.userId() == null) {
            return errorUtil.badRequest("User ID is required");
        }
        if (dto.rounds() <= 0) {
            return errorUtil.badRequest("Rounds must be greater than 0");
        }

        String difficulty = (dto.difficulty().equals("all") || dto.difficulty().isBlank()) ? null : dto.difficulty();
        String topic = (dto.topic().equals( "all") || dto.topic().isBlank()) ? null : dto.topic();


        List<Question> fetched = questionRepository.findByFilters(
                difficulty,
                topic,
                dto.rounds() * 2
        );

        // 1️⃣ Deduplicate by question ID
        Map<Long, Question> uniqueMap = new LinkedHashMap<>();
        for (Question q : fetched) {
            uniqueMap.putIfAbsent(q.getId(), q);
        }

        List<Question> uniqueQuestions = new ArrayList<>(uniqueMap.values());

        // 2️⃣ Shuffle (Fisher–Yates via JDK)
        Collections.shuffle(uniqueQuestions);

        // 3️⃣ Enforce invariant
        if (uniqueQuestions.size() < dto.rounds()) {
            return errorUtil.notFound("Could not find enough unique questions.");
        }

        List<Question> selected = uniqueQuestions.subList(0, dto.rounds());

        // 4️⃣ Build session
        SinglePlayerSession session = SinglePlayerSession.builder()
                .userId(dto.userId())
                .difficulty(dto.difficulty())
                .rounds(dto.rounds())
                .currentRound(1)
                .status(Status.IN_PROGRESS)
                .startedAt(Instant.now())
                .build();

        List<QuestionWithOutAnswerDto> questions = new ArrayList<>();

        int order = 1;
        for (Question q : selected) {

            session.getAttempts().add(
                    SinglePlayerAttempts.builder()
                            .session(session)
                            .question(q)
                            .isCorrect(false)
                            .selectedAnswer(null)
                            .build()
            );

            questions.add(new QuestionWithOutAnswerDto(
                    q.getId(),
                    order++,
                    q.getQuestion(),
                    q.getOptions()
            ));
        }

        SinglePlayerSession savedSession = singlePlayerSessionRepository.save(session);

        redisCacheService.set(SESSION_CACHE, savedSession.getId(), savedSession);

        return ResponseEntity.ok(
                new SinglePlayerSessionDto(
                        new SinglePlayerSessionResponseDto(
                                savedSession.getId(),
                                savedSession.getUserId(),
                                savedSession.getDifficulty(),
                                savedSession.getRounds()
                        ),
                        questions
                )
        );
    }


    public ResponseEntity<?> getSinglePlayerSession(Long id) {
        log.debug("Fetching single-player session by ID {}", id);

        if (id == null) {
            log.debug("Session ID is null in getSinglePlayerSession");
            return errorUtil.badRequest("Session ID is required");
        }

        Optional<SinglePlayerSession> cachedSession = redisCacheService.get(SESSION_CACHE, id, SinglePlayerSession.class);
        if (cachedSession.isPresent()) {
            log.debug("Cache hit for session ID {}", id);
            return ResponseEntity.ok(cachedSession.get());
        }

        log.debug("Cache miss, fetching from DB for session ID {}", id);
        Optional<SinglePlayerSession> sessionOpt = singlePlayerSessionRepository.findById(id);

        if (sessionOpt.isPresent()) {
            redisCacheService.set(SESSION_CACHE, id, sessionOpt.get());
            log.debug("Session found in DB and cached (ID: {})", id);
            return ResponseEntity.ok(sessionOpt.get());
        } else {
            log.debug("Session not found in DB for ID {}", id);
            return errorUtil.notFound("Session not found");
        }
    }

    public ResponseEntity<?> getSinglePlayerSessionsByUser(Long userId) {
        log.debug("Fetching all sessions for userId={}", userId);

        if (userId == null) {
            log.debug("userId is null in getSinglePlayerSessionsByUser");
            return errorUtil.badRequest("User ID is required");
        }

        List<SinglePlayerSession> sessions = singlePlayerSessionRepository.findByUserId(userId);
        log.debug("Found {} sessions for userId={}", sessions.size(), userId);

        return ResponseEntity.ok(sessions);
    }
}
