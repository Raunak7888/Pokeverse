package com.pokeverse.play.quiz.service;

import com.pokeverse.play.model.*;
import com.pokeverse.play.quiz.dto.AnswerValidationDto;
import com.pokeverse.play.quiz.dto.LeaderBoardDto;
import com.pokeverse.play.quiz.dto.RoomQuestionDto;
import com.pokeverse.play.quiz.utils.WebsocketMessingUtil;
import com.pokeverse.play.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class MultiplayerRoomQuizService {

    private final ApplicationContext context;

    private final RoomRepository roomRepository;
    private final QuestionRepository questionRepository;
    private final MultiplayerQuestionRepository multiplayerQuestionRepository;
    private final MultiplayerAttemptRepository multiplayerAttemptRepository;
    private final RoomPlayerRepository roomPlayerRepository;

    private final WebsocketMessingUtil websocketMessingUtil;
    private final RedisRoomAndQuestionService redisService;

    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(2);
    private final Map<Long, ScheduledFuture<?>> roomTasks = new ConcurrentHashMap<>();

    private static final int QUESTION_INTERVAL_SECONDS = 30;
    private static final int MAX_POINT = 310;

    /* ---------------------------------------------------- */
    /* GAME START                                           */
    /* ---------------------------------------------------- */

    @Transactional
    public void startGame(Long roomId, Long hostId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null || !room.isHost(hostId)) return;

        if (room.getPlayers().size() < 2) {
            websocketMessingUtil.sendError(hostId, "Need at least 2 players");
            return;
        }

        room.setStatus(Status.IN_PROGRESS);
        roomRepository.save(room);

        websocketMessingUtil.notifyRoom(
                roomId, "/game/info",
                Map.of("message", "Game_Starting")
        );

        redisService.incrementRound(roomId); // initialize round = 1
        startTicker(roomId);

        log.info("Game started for room {}", roomId);
    }

    private void startTicker(Long roomId) {
        ScheduledFuture<?> task =
                scheduler.scheduleAtFixedRate(() -> {
                    MultiplayerRoomQuizService bean =
                            context.getBean(MultiplayerRoomQuizService.class);
                    bean.tick(roomId);
                }, 5, QUESTION_INTERVAL_SECONDS, TimeUnit.SECONDS);

        roomTasks.put(roomId, task);
    }

    @Transactional
    public void tick(Long roomId) {
        if (!redisService.acquireLock(roomId)) return;

        try {
            Room room = roomRepository.findById(roomId).orElse(null);
            if (room == null || room.getStatus() != Status.IN_PROGRESS) {
                stopGame(roomId);
                return;
            }

            // Logic check: only proceed if there isn't a question currently active
            if (redisService.hasActiveQuestion(roomId)) return;

            int round = redisService.getRound(roomId);
            if (round > room.getTotalRounds()) {
                endGame(room);
                stopGame(roomId);
                return;
            }

            String topic = (room.getTopic() == null || room.getTopic().equalsIgnoreCase("ALL"))
                    ? null : room.getTopic();

            // Use Optional to prevent NullPointerException
            Question q = questionRepository.findByTopic(topic)
                    .orElseThrow(() -> new RuntimeException("No questions found"));

            MultiplayerQuestion mpq = multiplayerQuestionRepository.save(
                    MultiplayerQuestion.builder()
                            .room(room)
                            .question(q)
                            .roundNumber(round)
                            .build()
            );

            // State Init
            redisService.setActiveQuestion(roomId, mpq.getId());
            redisService.setActiveQuestionStart(roomId);
            redisService.initPlayerAnswerState(roomId, room.getPlayers().size());

            websocketMessingUtil.notifyRoom(roomId, "/game/question", RoomQuestionDto.from(mpq));
            redisService.incrementRound(roomId);

        } catch (Exception e) {
            log.error("Error in game tick for room {}: {}", roomId, e.getMessage());
        } finally {
            redisService.releaseLock(roomId);
        }
    }

    @Transactional
    public void validateAnswer(AnswerValidationDto dto) {

        Long questionId = redisService.getActiveQuestion(dto.roomId());
        if (questionId == null) {
            websocketMessingUtil.sendError(dto.userId(), "Question expired");
            return;
        }

        MultiplayerQuestion mpq =
                multiplayerQuestionRepository.findById(questionId).orElse(null);
        if (mpq == null) return;

        RoomPlayer player =
                roomPlayerRepository.findByRoomIdAndUserId(
                        dto.roomId(), dto.userId()
                ).orElse(null);
        if (player == null) return;

        if (multiplayerAttemptRepository
                .existsByPlayerAndMultiplayerQuestion(player, mpq)) {
            return;
        }

        boolean correct =
                mpq.getQuestion().getAnswer()
                        .equalsIgnoreCase(dto.selectedOption());

        multiplayerAttemptRepository.save(
                MultiplayerAttempt.builder()
                        .player(player)
                        .multiplayerQuestion(mpq)
                        .selectedOption(dto.selectedOption())
                        .isCorrect(correct)
                        .build()
        );

        if (correct) {
            int seconds =
                    (int) ((System.currentTimeMillis()
                            - redisService.getActiveQuestionStart(dto.roomId())) / 1000);
            player.setScore(player.getScore() + MAX_POINT - (seconds * 10));
            roomPlayerRepository.save(player);
        }

        websocketMessingUtil.sendToPlayer(
                dto.roomId(),
                "/game/answer",
                Map.of(
                        "playerId", player.getId(),
                        "isCorrect", correct,
                        "score", player.getScore()
                )
        );

        long answered = redisService.incrementAnswered(dto.roomId());
        int totalPlayers = redisService.getTotalPlayers(dto.roomId());

        if (answered >= totalPlayers && totalPlayers > 0) {
            log.info("All players answered early for room {}", dto.roomId());
            redisService.clearActiveQuestion(dto.roomId()); // 🔥 critical
            tick(dto.roomId());
        }
    }

    private void stopGame(Long roomId) {
        stopTicker(roomId);
        redisService.clearRoom(roomId);
    }

    private void stopTicker(Long roomId) {
        ScheduledFuture<?> task = roomTasks.remove(roomId);
        if (task != null) {
            task.cancel(false);
        }
    }

    private void endGame(Room room) {
        room.setStatus(Status.COMPLETED);
        roomRepository.save(room);

        AtomicInteger rank = new AtomicInteger(1);
        List<LeaderBoardDto> leaderboard =
                room.getPlayers().stream()
                        .sorted(Comparator.comparingInt(RoomPlayer::getScore).reversed())
                        .map(p -> new LeaderBoardDto(
                                rank.getAndIncrement(),
                                p.getUserId(),
                                p.getName(),
                                p.getScore()
                        ))
                        .toList();

        websocketMessingUtil.notifyRoom(
                room.getId(),
                "/game/end",
                Map.of("leaderboard", leaderboard)
        );
    }
}
