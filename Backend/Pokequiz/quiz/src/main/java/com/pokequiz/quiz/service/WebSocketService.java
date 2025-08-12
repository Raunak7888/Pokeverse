
package com.pokequiz.quiz.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokequiz.quiz.dto.DetailedAnswer;
import com.pokequiz.quiz.dto.GameQuestionDto;
import com.pokequiz.quiz.dto.StatsDTO;
import com.pokequiz.quiz.dto.WsAnswerValidationDTO;
import com.pokequiz.quiz.model.*;
import com.pokequiz.quiz.repository.*;
import jakarta.persistence.Tuple;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

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
    private final Map<Long, ScheduledExecutorService> roomSchedulers = new ConcurrentHashMap<>();


    public WebSocketService(RoomRepository roomRepository, SimpMessagingTemplate messagingTemplate, GameService gameService, PlayerAnswerRepository playerAnswerRepository, RoomQuizRepository roomQuizRepository, PlayerRepository playerRepository, QuestionRepository questionRepository, AnswerRepository answerRepository) {
        this.roomRepository = roomRepository;
        this.messagingTemplate = messagingTemplate;
        this.gameService = gameService;
        this.playerAnswerRepository = playerAnswerRepository;
        this.roomQuizRepository = roomQuizRepository;
        this.playerRepository = playerRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }


    public void startGame(Long roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        if (room.isPresent()) {
            Room r = room.get();
            r.setStarted(true);
            roomRepository.save(r);
            messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/game", "Game started");
        }
    }

    public void endGame(Long roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        if (room.isPresent()) {
            Room r = room.get();
            r.setEnded(true);
            roomRepository.save(r);
            messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/game", "Game ended");
        }
    }

    public void sendQuestion(Long roomId, Long hostId) {
        AtomicInteger rounds = new AtomicInteger();
        // Avoid starting multiple schedulers for the same room
        roomSchedulers.computeIfAbsent(roomId, id -> {
            ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
            System.out.println("Broadcasting started for room " + roomId);

            scheduler.scheduleAtFixedRate(() -> {
                try {
                    Optional<Room> roomOptional = roomRepository.findByIdAndHostId(roomId, hostId);
                    if (roomOptional.isEmpty()) {
                        System.out.println("Room not found. Stopping broadcast for room " + roomId);
                        stopBroadcasting(roomId);
                        return;
                    }

                    Room room = roomOptional.get();

                    if (!room.isStarted() || room.isEnded()) {
                        System.out.println("Room is not active. Stopping broadcast for room " + roomId);
                        stopBroadcasting(roomId);
                        return;
                    }

                    if (room.getCurrentRound() >= room.getMaxRound()) {
                        System.out.println("Max rounds reached. Stopping broadcast for room " + roomId);
                        endGame(roomId);
                        stopBroadcasting(roomId);
                        return;
                    }

                    // Fetch already used question IDs for this room
                    List<Long> usedQuestionIds = roomQuizRepository.findQuestionIdsByRoomId(roomId);

                    // Fetch a new question that hasn't been used yet
                    Question question = gameService.getRandomQuizExcluding(usedQuestionIds);

                    if (question == null) {
                        System.out.println("No more unique questions available. Stopping broadcast for room " + roomId);
                        stopBroadcasting(roomId);
                        return;
                    }
                    rounds.incrementAndGet();
                    GameQuestionDto gameQuestionDto = new GameQuestionDto(question, rounds);
                    messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/game", gameQuestionDto);
                    System.out.println("Broadcasting question "+ rounds +" to room " + roomId + ": " + question.getQuestion());




                    // Increment round and save question to RoomQuiz
                    room.setCurrentRound(room.getCurrentRound() + 1);
                    RoomQuiz roomQuiz = new RoomQuiz();
                    roomQuiz.setRoom(room);
                    roomQuiz.setQuestion(question);
                    roomQuizRepository.save(roomQuiz);

//                     Create PlayerAnswer entries for all players
//                    List<Player> players = playerRepository.findByRoomId(roomId);
//                    for (Player player : players) {
//                        PlayerAnswer playerAnswer = new PlayerAnswer();
//                        playerAnswer.setPlayer(player);
//                        playerAnswer.setRoomQuiz(roomQuiz);
//                        playerAnswer.setCorrect(false);
//                        playerAnswer.setAnswer(""); // Use empty string or placeholder
//                        playerAnswerRepository.save(playerAnswer);
//                    }
                    roomRepository.save(room);
                    System.out.println("Sent question to room: " + roomId);

                } catch (Exception e) {
                    System.err.println("Error while broadcasting to room " + roomId);
                    e.printStackTrace();
                    stopBroadcasting(roomId);
                }
            }, 0, 30, TimeUnit.SECONDS); // Runs every 3 seconds

            return scheduler;
        });
    }



    public void stopBroadcasting(Long roomId) {

        ScheduledExecutorService scheduler = roomSchedulers.remove(roomId);
        if (scheduler != null) {
            System.out.println("Stopping broadcast for room " + roomId);
            scheduler.shutdown();

            try {
                if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                    scheduler.shutdownNow(); // Force shutdown if it doesn't terminate
                    System.out.println("Forced shutdown for room " + roomId);
                }
            } catch (InterruptedException e) {
                scheduler.shutdownNow();
                Thread.currentThread().interrupt();
                System.err.println("Interrupted while stopping broadcast for room " + roomId);
            }
        }
    }


    public void validateAnswer(WsAnswerValidationDTO answer) {
        System.out.println("📩 [validateAnswer] Received answer from User ID: " + answer.getUserId());

        // 1. Validate Room
        Room room = roomRepository.findById(answer.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found: ID = " + answer.getRoomId()));

        // 2. Validate non-null answer
        if (answer.getAnswer() == null || answer.getAnswer().trim().isEmpty()) {
            System.err.println("❗ Answer is null or empty");
            messagingTemplate.convertAndSend("/topic/rooms/" + answer.getRoomId() + "/game", "Answer cannot be null");
            return;
        }

        // 3. Get question and correct answer
        Question question = questionRepository.findById(answer.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found: ID = " + answer.getQuestionId()));
        Answer correctAnswer = answerRepository.findByQuestion(question);

        // 4. Get player
        Player player = playerRepository.findById(answer.getUserId())
                .orElseThrow(() -> new RuntimeException("Player not found: ID = " + answer.getUserId()));

        // 5. Get RoomQuiz
        RoomQuiz roomQuiz = roomQuizRepository.findByRoomAndQuestion(room, question);
        if (roomQuiz == null) {
            System.err.println("❗ RoomQuiz not found for question in room");
            messagingTemplate.convertAndSend("/topic/rooms/" + answer.getRoomId() + "/game", "Question not found in this room");
            return;
        }

        // 6. Validate correctness
        boolean isCorrect = answer.getAnswer().equalsIgnoreCase(correctAnswer.getCorrectAnswer());

        // 7. Create PlayerAnswer
        PlayerAnswer playerAnswer = new PlayerAnswer();
        playerAnswer.setPlayer(player);
        playerAnswer.setRoomQuiz(roomQuiz);
        playerAnswer.setAnswer(answer.getAnswer());
        playerAnswer.setCorrect(isCorrect);
        playerAnswerRepository.save(playerAnswer);

        // 8. Update score if correct
        if (isCorrect) {
            player.setScore(player.getScore() + 10);
            player.setCreatedAt(LocalDateTime.now());
            playerRepository.save(player);
            System.out.println("✅ Correct answer! +10 points to player ID: " + player.getId());
        } else {
            System.out.println("❌ Incorrect answer from player ID: " + player.getId());
        }

        // 9. Build response DTO
        WsAnswerValidationDTO response = new WsAnswerValidationDTO();
        response.setRoomId(answer.getRoomId());
        response.setUserId(answer.getUserId());
        response.setQuestionId(answer.getQuestionId());
        response.setAnswer(answer.getAnswer());
        response.setCorrect(isCorrect);

        // 10. Broadcast result
        messagingTemplate.convertAndSend("/topic/rooms/" + answer.getRoomId() + "/game", response);
        System.out.println("📤 Answer validation broadcasted for player ID: " + player.getId());
    }

    public ResponseEntity<?> sendStats(Long roomId, Long playerId) {
        System.out.println("📨 [WebSocket] Entered sendStats()");
        System.out.println("➡️ [Input] roomId: " + roomId + ", playerId: " + playerId);

        Optional<Room> room = roomRepository.findById(roomId);
        if (room.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Room not found with ID: " + roomId);
        }
        System.out.println("✅ [Room Found] " + room.get());

        Optional<Player> player = playerRepository.findById(playerId);
        if (player.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Player not found with ID: " + playerId);
        }
        System.out.println("✅ [Player Found] " + player.get());

        List<PlayerAnswer> playerAnswers = playerAnswerRepository.findByPlayer(player.get());
        if (playerAnswers.isEmpty()) {
            return ResponseEntity.ok()
                    .body("No answers found for player ID: " + playerId);
        }
        System.out.println("🧾 [Answers Retrieved] Count: " + playerAnswers.size());

        playerAnswers.sort(Comparator.comparing(PlayerAnswer::getCreatedAt));
        System.out.println("🔃 [Answers Sorted] By createdAt");

        List<RoomQuiz> roomQuizzes = roomQuizRepository.findAllByRoom(room.get());
        if (roomQuizzes.isEmpty()) {
            return ResponseEntity.ok()
                    .body("No quizzes found for room ID: " + roomId);
        }
        System.out.println("🧾 [RoomQuizzes Retrieved] Count: " + roomQuizzes.size());

        roomQuizzes.sort(Comparator.comparing(RoomQuiz::getCreatedAt));
        System.out.println("🔃 [RoomQuizzes Sorted] By createdAt");

        List<DetailedAnswer> detailedAnswers = new ArrayList<>();

        for (int i = 0; i < playerAnswers.size(); i++) {
            RoomQuiz roomQuiz = roomQuizzes.get(i);
            PlayerAnswer playerAnswer = playerAnswers.get(i);

            System.out.println("🔍 [Processing Pair #" + i + "]");
            System.out.println("   ⌛ RoomQuiz CreatedAt: " + roomQuiz.getCreatedAt());
            System.out.println("   ⌛ PlayerAnswer CreatedAt: " + playerAnswer.getCreatedAt());

            Answer correctAnswer = answerRepository.findByQuestionId(roomQuiz.getQuestion().getId());
            if (correctAnswer == null) {
                System.err.println("⚠️ [No Answer Found] for Question ID: " + roomQuiz.getQuestion().getId());
                continue;
            }

            DetailedAnswer detailedAnswer = getDetailedAnswer(playerAnswer, roomQuiz, correctAnswer);

            detailedAnswers.add(detailedAnswer);

            System.out.println("   ✅ [Detailed Answer] " + detailedAnswer);
        }

        StatsDTO statsDTO = new StatsDTO();
        statsDTO.setUserId(player.get().getId());
        statsDTO.setUsername(player.get().getName());
        statsDTO.setTotalPoints(player.get().getScore());
        statsDTO.setDetailedAnswers(detailedAnswers);

        System.out.println("📦 [Payload Ready] Broadcasting to /topic/rooms/" + roomId + "/game");
        System.out.println("🧾 [StatsDTO] " + statsDTO);


        System.out.println("✅ [Broadcast Complete]");
        return ResponseEntity.ok(statsDTO);
    }

    private static DetailedAnswer getDetailedAnswer(PlayerAnswer playerAnswer, RoomQuiz roomQuiz, Answer correctAnswer) {
        int timeTaken = playerAnswer.getCreatedAt().minusSeconds(roomQuiz.getCreatedAt().getSecond()).getSecond();

        DetailedAnswer detailedAnswer = new DetailedAnswer();
        detailedAnswer.setQuestionId(roomQuiz.getQuestion().getId());
        detailedAnswer.setQuestion(roomQuiz.getQuestion().getQuestion());
        detailedAnswer.setCorrect(playerAnswer.isCorrect());
        detailedAnswer.setCorrectAnswer(correctAnswer.getCorrectAnswer());
        detailedAnswer.setSelectedOption(playerAnswer.getAnswer());
        detailedAnswer.setTimeTaken(timeTaken);
        return detailedAnswer;
    }





}
