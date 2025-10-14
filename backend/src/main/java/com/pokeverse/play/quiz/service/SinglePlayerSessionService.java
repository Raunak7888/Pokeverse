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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
        log.debug("Creating single-player session: userId={}, region='{}', difficulty='{}', rounds={}",
                dto.userId(), dto.region(), dto.difficulty(), dto.rounds());

        if (dto.userId() == null) {
            log.debug("User ID missing in session creation request");
            return errorUtil.badRequest("User ID is required");
        }
        if (dto.rounds() <= 0) {
            log.debug("Invalid rounds: {}", dto.rounds());
            return errorUtil.badRequest("Rounds must be greater than 0");
        }

        List<Question> questionsList;

        if (!dto.region().isEmpty() && !dto.difficulty().isEmpty()) {
            log.debug("Fetching questions by region and difficulty");
            questionsList = questionRepository.findByRegionAndDifficulty(dto.region(), dto.difficulty(), dto.rounds());
        } else if (!dto.region().isEmpty()) {
            log.debug("Fetching questions by region only");
            questionsList = questionRepository.findByRegion(dto.region(), dto.rounds());
        } else if (!dto.difficulty().isEmpty()) {
            log.debug("Fetching questions by difficulty only");
            questionsList = questionRepository.findByDifficulty(dto.difficulty(), dto.rounds());
        } else {
            log.debug("Fetching questions without filters");
            questionsList = questionRepository.findAllLimit(dto.rounds());
        }

        if (questionsList.isEmpty()) {
            log.debug("No questions found for region='{}', difficulty='{}'", dto.region(), dto.difficulty());
            return errorUtil.notFound("Could not find enough questions for the specified region and difficulty.");
        }

        log.debug("Found {} questions for new session", questionsList.size());

        SinglePlayerSession session = SinglePlayerSession.builder()
                .userId(dto.userId())
                .difficulty(dto.difficulty())
                .region(dto.region())
                .rounds(questionsList.size())
                .currentRound(1)
                .status(Status.IN_PROGRESS)
                .completedAt(null)
                .build();

        List<QuestionWithOutAnswerDto> questions = IntStream.range(0, questionsList.size())
                .mapToObj(index -> {
                    Question q = questionsList.get(index);
                    log.debug("Mapping question [{}]: {}", index + 1, q.getQuestion());

                    SinglePlayerAttempts attempt = SinglePlayerAttempts.builder()
                            .session(session)
                            .question(q)
                            .isCorrect(false)
                            .selectedAnswer(null)
                            .build();
                    session.getAttempts().add(attempt);

                    return new QuestionWithOutAnswerDto(
                            q.getId(),
                            index + 1,
                            q.getQuestion(),
                            q.getOptions()
                    );
                })
                .collect(Collectors.toList());

        session.setStartedAt(Instant.now());
        log.debug("Saving session for userId={} with {} rounds", session.getUserId(), session.getRounds());

        SinglePlayerSession savedSession = singlePlayerSessionRepository.save(session);
        log.debug("Session saved successfully with ID {}", savedSession.getId());

        SinglePlayerSessionResponseDto sessionResponseDto = new SinglePlayerSessionResponseDto(
                savedSession.getId(),
                savedSession.getUserId(),
                savedSession.getRegion(),
                savedSession.getDifficulty(),
                savedSession.getRounds()
        );
        log.debug("SinglePlayerSessionResponseDto is created");
        SinglePlayerSessionDto sessionDto = new SinglePlayerSessionDto(sessionResponseDto, questions);
        log.debug("SinglePlayerSessionDto is created");

        redisCacheService.set(SESSION_CACHE, savedSession.getId(), savedSession);


        log.debug("Session cached under key '{}:{}'", SESSION_CACHE, savedSession.getId());
        return ResponseEntity.ok(sessionDto);
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
