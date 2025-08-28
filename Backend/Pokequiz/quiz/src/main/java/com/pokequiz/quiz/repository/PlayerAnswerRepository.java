package com.pokequiz.quiz.repository;

import com.pokequiz.quiz.model.Player;
import com.pokequiz.quiz.model.PlayerAnswer;
import com.pokequiz.quiz.model.RoomQuiz;
import jakarta.persistence.Tuple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerAnswerRepository extends JpaRepository<PlayerAnswer, Long> {
    PlayerAnswer findByPlayerAndRoomQuiz(Player player, RoomQuiz roomQuiz);

    @Query(value = """
    SELECT 
        pa.player_id AS userId,
        p.name AS username,
        rq.id AS quizId,
        SUM(CASE WHEN pa.correct THEN 10 ELSE 0 END) AS totalPoints,
        '[' || string_agg(
            '{"questionId":' || rq.id ||
            ',"selectedOption":"' || pa.answer ||
            '","correct":' || pa.correct ||
            ',"timeTaken":0}', 
        ',') || ']' AS detailedAnswers
    FROM player_answers pa
    JOIN players p ON p.id = pa.player_id
    JOIN room_quizzes rq ON pa.quiz_id = rq.quiz_id AND rq.room_id = :roomId
    WHERE pa.player_id = :playerId
    GROUP BY pa.player_id, p.name, rq.id
    """, nativeQuery = true)
    List<Tuple> findByPlayerIdAndRoomId(@Param("playerId") Long playerId, @Param("roomId") Long roomId);
    List<PlayerAnswer> findByPlayer(Player player);
    boolean existsByPlayerAndRoomQuiz(Player player, RoomQuiz roomQuiz);





}

