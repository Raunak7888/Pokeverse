package com.pokequiz.quiz.service;

import com.pokequiz.quiz.dto.DetailedAnswer;
import com.pokequiz.quiz.dto.GameQuestionDto;
import com.pokequiz.quiz.dto.StatsDTO;
import com.pokequiz.quiz.dto.WsAnswerValidationDTO;
import com.pokequiz.quiz.model.*;
import com.pokequiz.quiz.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class WebSocketService {

    private final RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;
    private final PlayerAnswerRepository playerAnswerRepository;
    private final RoomQuizRepository roomQuizRepository;
    private final PlayerRepository playerRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    // Room schedulers
    private final Map<Long, ScheduledExecutorService> roomSchedulers = new ConcurrentHashMap<>();

    // Track active question per room
    private final Map<Long, RoomQuiz> activeQuestions = new ConcurrentHashMap<>();
    private final int QUESTION_INTERVAL_SECONDS = 30; // configurable interval

    public WebSocketService(RoomRepository roomRepository,
                            SimpMessagingTemplate messagingTemplate,
                            GameService gameService,
                            PlayerAnswerRepository playerAnswerRepository,
                            RoomQuizRepository roomQuizRepository,
                            PlayerRepository playerRepository,
                            QuestionRepository questionRepository,
                            AnswerRepository answerRepository) {
        this.roomRepository = roomRepository;
        this.messagingTemplate = messagingTemplate;
        this.gameService = gameService;
        this.playerAnswerRepository = playerAnswerRepository;
        this.roomQuizRepository = roomQuizRepository;
        this.playerRepository = playerRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }

    /** ✅ Start Game */
    public void startGame(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: ID = " + roomId));

        if (room.isStarted()) {
            throw new IllegalStateException("Game already started for room " + roomId);
        }
        room.setStarted(true);
        room.setEnded(false);
        room.setCurrentRound(0);
        roomRepository.save(room);

        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/game", "Game started");
    }

    /** ✅ End Game */
    public void endGame(Long roomId) {
        roomRepository.findById(roomId).ifPresent(room -> {
            room.setEnded(true);
            roomRepository.save(room);
            activeQuestions.remove(roomId);
            stopBroadcasting(roomId);
            messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/game", "Game ended");
        });
    }

    /** ✅ Send Questions at fixed interval */
    public void sendQuestion(Long roomId, Long hostId) {
        AtomicInteger rounds = new AtomicInteger();

        roomSchedulers.computeIfAbsent(roomId, id -> {
            ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

            scheduler.scheduleAtFixedRate(() -> {
                try {
                    Room room = roomRepository.findByIdAndHostId(roomId, hostId)
                            .orElseThrow(() -> new RuntimeException("Room not found or unauthorized host"));

                    if (!room.isStarted() || room.isEnded()) {
                        endGame(roomId);
                        return;
                    }

                    if (room.getCurrentRound() >= room.getMaxRound()) {
                        endGame(roomId);
                        return;
                    }

                    List<Long> usedQuestionIds = roomQuizRepository.findQuestionIdsByRoomId(roomId);
                    Question question = gameService.getRandomQuizExcluding(usedQuestionIds);

                    if (question == null) {
                        endGame(roomId);
                        return;
                    }

                    // Prepare round
                    rounds.incrementAndGet();
                    GameQuestionDto gameQuestionDto = new GameQuestionDto(question, rounds,System.currentTimeMillis() + QUESTION_INTERVAL_SECONDS*1000);

                    // Save room state
                    room.setCurrentRound(room.getCurrentRound() + 1);
                    RoomQuiz roomQuiz = new RoomQuiz();
                    roomQuiz.setRoom(room);
                    roomQuiz.setQuestion(question);
                    roomQuiz.setCreatedAt(LocalDateTime.now());
                    roomQuizRepository.save(roomQuiz);
                    roomRepository.save(room);

                    // Track active question
                    activeQuestions.put(roomId, roomQuiz);

                    // Broadcast question
                    messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/game", gameQuestionDto);

                } catch (Exception e) {
                    System.err.println("⚠️ Error while broadcasting to room " + roomId + ": " + e.getMessage());
                    e.printStackTrace();
                    endGame(roomId);
                }
            }, 0, QUESTION_INTERVAL_SECONDS, TimeUnit.SECONDS); // configurable interval per question

            return scheduler;
        });
    }

    /** ✅ Stop Broadcasting */
    public void stopBroadcasting(Long roomId) {
        ScheduledExecutorService scheduler = roomSchedulers.remove(roomId);
        if (scheduler != null) {
            scheduler.shutdownNow();
        }
    }

    /** ✅ Validate Answer */
    /** ✅ Validate Answer */
    public void validateAnswer(WsAnswerValidationDTO answer) {
        try {
            Room room = roomRepository.findById(answer.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));

            if (!room.isStarted() || room.isEnded()) {
                throw new IllegalStateException("Game already ended or not started.");
            }

            RoomQuiz activeQuiz = activeQuestions.get(answer.getRoomId());
            if (activeQuiz == null) {
                throw new IllegalStateException("No active question for this room.");
            }

            // prevent late submissions (e.g., 25s limit)
            long timeElapsed = Duration.between(activeQuiz.getCreatedAt(), LocalDateTime.now()).toSeconds();
            if (timeElapsed > 25) { // configurable "round duration"
                throw new IllegalStateException("Time is over for this question.");
            }

            Question question = activeQuiz.getQuestion();
            Answer correctAnswer = answerRepository.findByQuestion(question);
            if (correctAnswer == null) {
                throw new RuntimeException("No correct answer found for question " + question.getId());
            }

            Player player = playerRepository.findById(answer.getUserId())
                    .orElseThrow(() -> new RuntimeException("Player not found"));

            // ❗ Prevent duplicate submissions
            boolean alreadyAnswered = playerAnswerRepository.existsByPlayerAndRoomQuiz(player, activeQuiz);
            if (alreadyAnswered) {
                throw new IllegalStateException("Player has already answered this question.");
            }

            boolean isCorrect = answer.getAnswer().equalsIgnoreCase(correctAnswer.getCorrectAnswer());

            PlayerAnswer playerAnswer = new PlayerAnswer();
            playerAnswer.setPlayer(player);
            playerAnswer.setRoomQuiz(activeQuiz);
            playerAnswer.setAnswer(answer.getAnswer());
            playerAnswer.setCorrect(isCorrect);
            playerAnswer.setCreatedAt(LocalDateTime.now());
            playerAnswerRepository.save(playerAnswer);
            int score = player.getScore();
            if (isCorrect) {
                player.setScore(score + 10);
            }else{
                player.setScore(score);
            }
            playerRepository.save(player);

            // Build response DTO
            WsAnswerValidationDTO response = new WsAnswerValidationDTO();
            response.setRoomId(answer.getRoomId());
            response.setUserId(answer.getUserId());
            response.setQuestionId(answer.getQuestionId());
            response.setAnswer(answer.getAnswer());
            response.setCorrect(isCorrect);
            if (isCorrect) {
                response.setScore(score+10);
            }else{
                response.setScore(score);
            }


            messagingTemplate.convertAndSend("/topic/rooms/" + answer.getRoomId() + "/game", response);

        } catch (Exception e) {
            String errMsg = "⚠️ Error validating answer: " + e.getMessage();
            System.err.println(errMsg);
            messagingTemplate.convertAndSend("/topic/rooms/" + answer.getRoomId() + "/game", errMsg);
        }
    }


    /** ✅ Stats per player */
    public ResponseEntity<?> sendStats(Long roomId, Long playerId) {
        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));

            Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found"));

            List<PlayerAnswer> playerAnswers = playerAnswerRepository.findByPlayer(player);
            if (playerAnswers.isEmpty()) {
                return ResponseEntity.ok("No answers found for player");
            }
            playerAnswers.sort(Comparator.comparing(PlayerAnswer::getCreatedAt));

            List<RoomQuiz> roomQuizzes = roomQuizRepository.findAllByRoom(room);
            roomQuizzes.sort(Comparator.comparing(RoomQuiz::getCreatedAt));

            List<DetailedAnswer> detailedAnswers = new ArrayList<>();
            for (int i = 0; i < Math.min(playerAnswers.size(), roomQuizzes.size()); i++) {
                PlayerAnswer pa = playerAnswers.get(i);
                RoomQuiz rq = roomQuizzes.get(i);
                Answer correct = answerRepository.findByQuestionId(rq.getQuestion().getId());
                if (correct != null) {
                    DetailedAnswer da = getDetailedAnswer(pa, rq, correct);
                    detailedAnswers.add(da);
                }
            }

            StatsDTO statsDTO = new StatsDTO();
            statsDTO.setUserId(player.getId());
            statsDTO.setUsername(player.getName());
            statsDTO.setTotalPoints(player.getScore());
            statsDTO.setDetailedAnswers(detailedAnswers);

            return ResponseEntity.ok(statsDTO);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("⚠️ Failed to fetch stats: " + e.getMessage());
        }
    }

    private static DetailedAnswer getDetailedAnswer(PlayerAnswer playerAnswer, RoomQuiz roomQuiz, Answer correctAnswer) {
        long timeTaken = Duration.between(roomQuiz.getCreatedAt(), playerAnswer.getCreatedAt()).toSeconds();

        DetailedAnswer detailedAnswer = new DetailedAnswer();
        detailedAnswer.setQuestionId(roomQuiz.getQuestion().getId());
        detailedAnswer.setQuestion(roomQuiz.getQuestion().getQuestion());
        detailedAnswer.setCorrect(playerAnswer.isCorrect());
        detailedAnswer.setCorrectAnswer(correctAnswer.getCorrectAnswer());
        detailedAnswer.setSelectedOption(playerAnswer.getAnswer());
        detailedAnswer.setTimeTaken((int) timeTaken);
        return detailedAnswer;
    }
}
