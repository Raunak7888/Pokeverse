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

    private final RoomRepository roomRepository;
    private final QuestionRepository questionRepository;
    private final MultiplayerQuestionRepository multiplayerQuestionRepository;
    private final MultiplayerAttemptRepository multiplayerAttemptRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ErrorUtil errorUtil;
    private final WebsocketMessingUtil websocketMessingUtil;
    // Track active questions and schedulers per room
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

        // Start the game
        room.setStatus(Status.IN_PROGRESS);
        room.setCurrentRound(1);
        roomRepository.save(room);

        // Notify all players
        websocketMessingUtil.notifyRoom(roomId, "/game", Map.of("roomId", roomId, "message", "Game started!"));

        // Start the automated question cycle
        startQuestionCycle(roomId);
    }

    private void startQuestionCycle(Long roomId) {
        // Send first question immediately
        sendNextQuestion(roomId);

        // Schedule subsequent questions every 30 seconds
        ScheduledFuture<?> scheduledTask = scheduler.scheduleAtFixedRate(
                () -> {
                    try {
                        sendNextQuestion(roomId);
                    } catch (Exception e) {
                        log.error("Error sending question for room {}: {}", roomId, e.getMessage());
                    }
                },
                QUESTION_INTERVAL_SECONDS,
                QUESTION_INTERVAL_SECONDS,
                TimeUnit.SECONDS
        );

        roomSchedulers.put(roomId, scheduledTask);
    }

    @Transactional
    public void sendNextQuestion(Long roomId) {
        Room room = roomRepository.findById(roomId).orElse(null);

        if (room == null || room.getStatus() != Status.IN_PROGRESS) {
            stopQuestionCycle(roomId);
            return;
        }

        // Check if game is complete
        if (room.getCurrentRound() > room.getTotalRounds()) {
            endGame(room);
            stopQuestionCycle(roomId);
            return;
        }

        // Send round results before next question (except for first round)
        if (room.getCurrentRound() > 1) {
            MultiplayerQuestion previousQuestion = activeQuestions.get(roomId);
            if (previousQuestion != null) {
                sendRoundResults(room, previousQuestion);
            }
        }

        // Get random question
        Question question = questionRepository.findRandomQuestion();
        if (question == null) {
            websocketMessingUtil.sendError(room.getHostId(), "No questions available.");
            stopQuestionCycle(roomId);
            return;
        }

        // Create multiplayer question
        MultiplayerQuestion mpQuestion = MultiplayerQuestion.builder()
                .room(room)
                .question(question)
                .roundNumber(room.getCurrentRound())
                .build();

        mpQuestion = multiplayerQuestionRepository.save(mpQuestion);
        activeQuestions.put(roomId, mpQuestion);

        // Send question to all players
        RoomQuestionDto questionDto = RoomQuestionDto.builder()
                .questionId(mpQuestion.getId())
                .question(question.getQuestion())
                .options(question.getOptions())
                .roundNumber(room.getCurrentRound())
                .totalRounds(room.getTotalRounds())
                .timeLimit(QUESTION_INTERVAL_SECONDS)
                .build();

        websocketMessingUtil.notifyRoom(roomId, "/game", questionDto);

        // Move to next round
        room.setCurrentRound(room.getCurrentRound() + 1);
        roomRepository.save(room);
    }

    @Transactional
    public void validateAnswer(AnswerValidationDto dto) {
        MultiplayerQuestion mpQuestion = activeQuestions.get(dto.roomId());

        if (mpQuestion == null) {
            return; // Question expired or invalid
        }

        RoomPlayer player = roomPlayerRepository.findByRoomIdAndUserId(dto.roomId(), dto.userId())
                .orElse(null);

        if (player == null) {
            return;
        }

        // Check if already answered this question
        boolean alreadyAnswered = multiplayerAttemptRepository
                .existsByPlayerAndMultiplayerQuestion(player, mpQuestion);

        if (alreadyAnswered) {
            websocketMessingUtil.sendError(dto.userId(), "Already answered this question");
            return;
        }

        // Validate answer
        Question question = mpQuestion.getQuestion();
        boolean isCorrect = question.getAnswer().equalsIgnoreCase(dto.selectedOption());

        // Save attempt
        MultiplayerAttempt attempt = MultiplayerAttempt.builder()
                .player(player)
                .multiplayerQuestion(mpQuestion)
                .selectedOption(dto.selectedOption())
                .isCorrect(isCorrect)
                .build();

        multiplayerAttemptRepository.save(attempt);

        // Update score if correct
        if (isCorrect) {
            player.setScore(player.getScore() + 10); // 10 points per correct answer
            roomPlayerRepository.save(player);
        }

        // Notify player their answer was recorded
        websocketMessingUtil.notifyRoom(dto.userId(), "/game", Map.of(
                "isCorrect", isCorrect,
                "newScore", player.getScore()
        ));
    }

    private void sendRoundResults(Room room, MultiplayerQuestion question) {
        // Get all attempts for this question
        List<MultiplayerAttempt> attempts = multiplayerAttemptRepository
                .findAllByMultiplayerQuestion(question);

        // Get current scores
        List<RoomPlayer> players = room.getPlayers();

        // Send round results
        Map<String, Object> results = Map.of(
                "roundNumber", question.getRoundNumber(),
                "correctAnswer", question.getQuestion().getAnswer(),
                "players", players.stream()
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

        websocketMessingUtil.notifyRoom(room.getId(), "/game", results);
    }

    private void endGame(Room room) {
        room.setStatus(Status.COMPLETED);
        roomRepository.save(room);

        activeQuestions.remove(room.getId());

        // Build leaderboard as a list of LeaderBoardDto
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

        websocketMessingUtil.notifyRoom(room.getId(), "/game", Map.of(
                "message", "Game completed!",
                "leaderboard", leaderboard
        ));
    }


    private void stopQuestionCycle(Long roomId) {
        ScheduledFuture<?> scheduledTask = roomSchedulers.remove(roomId);
        if (scheduledTask != null && !scheduledTask.isCancelled()) {
            scheduledTask.cancel(false);
        }
        activeQuestions.remove(roomId);
    }



}

