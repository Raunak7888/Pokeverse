package com.pokeverse.play.repository;

import com.pokeverse.play.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query(value = "SELECT * FROM questions ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Question findRandomQuestion();

    @Query(value = """
        SELECT * FROM questions q
        WHERE (:topic IS NULL OR q.topic = :topic)
        ORDER BY RANDOM()
        LIMIT 1
    """, nativeQuery = true)
    Optional<Question> findByTopic(@Param("topic") String topic);


    @Query(value = """
        SELECT * FROM questions q
        WHERE (:difficulty IS NULL OR q.difficulty = :difficulty)
          AND (:topic IS NULL OR q.topic = :topic)
        ORDER BY RANDOM()
        LIMIT :limit
    """, nativeQuery = true)
    List<Question> findByFilters(
            @Param("difficulty") String difficulty,
            @Param("topic") String topic,
            @Param("limit") int limit
    );

    Question findByQuestion(String question);
}
