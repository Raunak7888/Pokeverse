package com.pokeverse.play.repository;

import com.pokeverse.play.model.MultiplayerAttempt;
import com.pokeverse.play.model.MultiplayerQuestion;
import com.pokeverse.play.model.RoomPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MultiplayerAttemptRepository extends JpaRepository<MultiplayerAttempt, Long> {

    boolean existsByPlayerAndMultiplayerQuestion(RoomPlayer player, MultiplayerQuestion question);

    long countByMultiplayerQuestion(MultiplayerQuestion question);

    List<MultiplayerAttempt> findAllByMultiplayerQuestion(MultiplayerQuestion question);
}