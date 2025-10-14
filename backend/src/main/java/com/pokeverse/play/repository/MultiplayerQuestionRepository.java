package com.pokeverse.play.repository;

import com.pokeverse.play.model.MultiplayerQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MultiplayerQuestionRepository extends JpaRepository<MultiplayerQuestion, Long> {
}