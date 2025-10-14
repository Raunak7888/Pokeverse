package com.pokeverse.play.repository;

import com.pokeverse.play.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query(value = "SELECT * FROM questions q WHERE q.region = :region ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Question> findByRegion(@Param("region") String region, @Param("limit") int limit);

    @Query(value = "SELECT * FROM questions q WHERE q.difficulty = :difficulty ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Question> findByDifficulty(@Param("difficulty") String difficulty, @Param("limit") int limit);

    @Query(value = "SELECT * FROM questions q WHERE q.region = :region AND q.difficulty = :difficulty ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Question> findByRegionAndDifficulty(@Param("region") String region,
                                             @Param("difficulty") String difficulty,
                                             @Param("limit") int limit);

    @Query(value = "SELECT * FROM questions q ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Question> findAllLimit(@Param("limit") int limit);
    @Query(value = "SELECT * FROM questions ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Question findRandomQuestion();
}
