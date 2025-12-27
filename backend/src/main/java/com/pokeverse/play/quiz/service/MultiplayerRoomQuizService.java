package com.pokeverse.play.quiz.service;

import com.pokeverse.play.model.*;
import com.pokeverse.play.quiz.dto.AnswerValidationDto;
import com.pokeverse.play.quiz.dto.LeaderBoardDto;
import com.pokeverse.play.quiz.dto.RoomQuestionDto;
import com.pokeverse.play.quiz.utils.ErrorUtil;
import com.pokeverse.play.quiz.utils.WebsocketMessingUtil;
import com.pokeverse.play.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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

    @Autowired
    private ApplicationContext context;

    private final RoomRepository roomRepository;
    private final QuestionRepository questionRepository;
    private final MultiplayerQuestionRepository multiplayerQuestionRepository;
    private final MultiplayerAttemptRepository multiplayerAttemptRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ErrorUtil errorUtil;
    private final WebsocketMessingUtil websocketMessingUtil;
    private final Map<Long, MultiplayerQuestion> activeQuestions = new ConcurrentHashMap<>();
    private final Map<Long, ScheduledFuture<?>> roomSchedulers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    private static final int QUESTION_INTERVAL_SECONDS = 30;

    @Transactional
    public void startGame(Long roomId, Long hostId) {
        Room room = roomRepository.findById(roomId).orElse(null);

        if (room == null) {
            websocketMessingUtil.sendError(hostId, "Room not found.");
            return;
        }

        if (!room.isHost(hostId)) {
            websocketMessingUtil.sendError(hostId, "Only the host can start the game.");
            return;
        }

        if (room.getStatus() != Status.NOT_STARTED) {
            websocketMessingUtil.sendError(hostId, "Game already started.");
            return;
        }

        if (room.getPlayers().size() < 2) {
            websocketMessingUtil.sendError(hostId, "Need at least 2 players to start.");
            return;
        }

        room.setStatus(Status.IN_PROGRESS);
        room.setCurrentRound(1);
        roomRepository.save(room);

        websocketMessingUtil.notifyRoom(roomId, "/game/info",
            Map.of("message", "Game is starting soon!"));


        startCountdownAndGame(roomId);
    }

    private void startCountdownAndGame(Long roomId) {
        for (int i = 3; i > 0; i--) {
            final int countdownValue = i;
            scheduler.schedule(() -> {
                websocketMessingUtil.notifyRoom(roomId, "/game/countdown",
                    Map.of("countdown", countdownValue, "message", "Game starting in " + countdownValue));
                log.info("Countdown {} for room {}", countdownValue, roomId);
            }, (3 - i), TimeUnit.SECONDS);
        }

        scheduler.schedule(() -> {
            websocketMessingUtil.notifyRoom(roomId, "/game/info",
                Map.of("message", "Game started! Get ready!"));
            startQuestionCycle(roomId);
        }, 3, TimeUnit.SECONDS);
    }

    private void startQuestionCycle(Long roomId) {
        scheduler.schedule(() -> {
            try {
                MultiplayerRoomQuizService bean = context.getBean(MultiplayerRoomQuizService.class);
                bean.sendNextQuestionTransactional(roomId);
            } catch (Exception e) {
                log.error("Error sending question for room {}: {}", roomId, e.getMessage());
            }
        }, 0, TimeUnit.SECONDS);

        ScheduledFuture<?> scheduledTask = scheduler.scheduleAtFixedRate(() -> {
            try {
                MultiplayerRoomQuizService bean = context.getBean(MultiplayerRoomQuizService.class);
                bean.sendNextQuestionTransactional(roomId);
            } catch (Exception e) {
                log.error("Error sending question for room {}: {}", roomId, e.getMessage());
            }
        }, QUESTION_INTERVAL_SECONDS, QUESTION_INTERVAL_SECONDS, TimeUnit.SECONDS);

        roomSchedulers.put(roomId, scheduledTask);
    }

    public void sendNextQuestion(Long roomId) {
        // Always call inside a new transaction
        sendNextQuestionTransactional(roomId);
    }

    @Transactional
    public void sendNextQuestionTransactional(Long roomId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null || room.getStatus() != Status.IN_PROGRESS) {
            stopQuestionCycle(roomId);
            return;
        }

        if (room.getCurrentRound() > room.getTotalRounds()) {
            endGame(room);
            stopQuestionCycle(roomId);
            return;
        }

        if (room.getCurrentRound() > 1) {
            MultiplayerQuestion previousQuestion = activeQuestions.get(roomId);
            if (previousQuestion != null) sendRoundResults(room, previousQuestion);
        }

        Question question = questionRepository.findRandomQuestion();
        if (question == null) {
            websocketMessingUtil.sendError(room.getHostId(), "No questions available.");
            stopQuestionCycle(roomId);
            return;
        }

        // Force initialize lazy collections here
        question.getOptions().size(); // loads options inside open session

        MultiplayerQuestion mpQuestion = MultiplayerQuestion.builder()
                .room(room)
                .question(question)
                .roundNumber(room.getCurrentRound())
                .build();
    
        multiplayerQuestionRepository.save(mpQuestion);
        activeQuestions.put(roomId, mpQuestion);

        RoomQuestionDto questionDto = RoomQuestionDto.builder()
                .questionId(mpQuestion.getId())
                .question(question.getQuestion())
                .options(question.getOptions())
                .roundNumber(room.getCurrentRound())
                .totalRounds(room.getTotalRounds())
                .timeLimit(QUESTION_INTERVAL_SECONDS)
                .build();

        websocketMessingUtil.notifyRoom(roomId, "/game/question", questionDto);
        log.info("Question sent to room {}: Round {}/{}", roomId, room.getCurrentRound(), room.getTotalRounds());

        room.setCurrentRound(room.getCurrentRound() + 1);
        roomRepository.save(room);
    }


    @Transactional
    public void validateAnswer(AnswerValidationDto dto) {
        MultiplayerQuestion mpQuestion = activeQuestions.get(dto.roomId());

        if (mpQuestion == null) {
            websocketMessingUtil.sendError(dto.userId(), "Question not found or expired");
            log.warn("Question not found for room {} - may have expired", dto.roomId());
            return;
        }

        RoomPlayer player = roomPlayerRepository.findByRoomIdAndUserId(dto.roomId(), dto.userId())
                .orElse(null);

        if (player == null) {
            websocketMessingUtil.sendError(dto.userId(), "Player not found in room");
            log.warn("Player {} not found in room {}", dto.userId(), dto.roomId());
            return;
        }

        boolean alreadyAnswered = multiplayerAttemptRepository
                .existsByPlayerAndMultiplayerQuestion(player, mpQuestion);

        if (alreadyAnswered) {
            websocketMessingUtil.sendError(dto.userId(), "Already answered this question");
            return;
        }

        Question question = mpQuestion.getQuestion();
        boolean isCorrect = question.getAnswer().equalsIgnoreCase(dto.selectedOption());

        MultiplayerAttempt attempt = MultiplayerAttempt.builder()
                .player(player)
                .multiplayerQuestion(mpQuestion)
                .selectedOption(dto.selectedOption())
                .isCorrect(isCorrect)
                .build();

        multiplayerAttemptRepository.save(attempt);

        if (isCorrect) {
            player.setScore(player.getScore() + 10);
            roomPlayerRepository.save(player);
        }

        websocketMessingUtil.sendToPlayer(dto.userId(), "/game/answer", Map.of(
                "isCorrect", isCorrect,
                "newScore", player.getScore(),
                "correctAnswer", question.getAnswer(),
                "message", isCorrect ? "Correct answer!" : "Wrong answer"
        ));

        log.info("Player {} answered question {} in room {} - Correct: {}",
                dto.userId(), mpQuestion.getId(), dto.roomId(), isCorrect);
    }

    private void sendRoundResults(Room room, MultiplayerQuestion question) {
        List<MultiplayerAttempt> attempts = multiplayerAttemptRepository
                .findAllByMultiplayerQuestion(question);

        List<RoomPlayer> players = room.getPlayers();

        Map<String, Object> results = Map.of(
                "type", "roundResults",
                "roundNumber", question.getRoundNumber(),
                "correctAnswer", question.getQuestion().getAnswer(),
                "question", question.getQuestion().getQuestion(),
                "players", players.stream()
                        .sorted(Comparator.comparingInt(RoomPlayer::getScore).reversed())
                        .map(p -> Map.of(
                                "userId", p.getUserId(),
                                "name", p.getName(),
                                "score", p.getScore(),
                                "answered", attempts.stream()
                                        .anyMatch(a -> a.getPlayer().getId().equals(p.getId())),
                                "correct", attempts.stream()
                                        .anyMatch(a -> a.getPlayer().getId().equals(p.getId()) && a.isCorrect())
                        ))
                        .toList()
        );

        websocketMessingUtil.notifyRoom(room.getId(), "/game/results", results);
        log.info("Round {} results sent for room {}", question.getRoundNumber(), room.getId());
    }

    private void endGame(Room room) {
        room.setStatus(Status.COMPLETED);
        roomRepository.save(room);

        activeQuestions.remove(room.getId());

        AtomicInteger rankCounter = new AtomicInteger(1);
        List<LeaderBoardDto> leaderboard = room.getPlayers().stream()
                .sorted(Comparator.comparingInt(RoomPlayer::getScore).reversed())
                .map(p -> new LeaderBoardDto(
                        rankCounter.getAndIncrement(),
                        p.getUserId(),
                        p.getName(),
                        p.getScore()
                ))
                .toList();

        websocketMessingUtil.notifyRoom(room.getId(), "/game/end", Map.of(
                "type", "gameEnd",
                "message", "Game completed!",
                "leaderboard", leaderboard
        ));

        log.info("Game ended for room {}. Winner: {} with {} points",
                room.getId(),
                leaderboard.get(0).name(),
                leaderboard.get(0).score());
    }


    private void stopQuestionCycle(Long roomId) {
        ScheduledFuture<?> scheduledTask = roomSchedulers.remove(roomId);
        if (scheduledTask != null && !scheduledTask.isCancelled()) {
            scheduledTask.cancel(false);
        }
        activeQuestions.remove(roomId);
    }



}

