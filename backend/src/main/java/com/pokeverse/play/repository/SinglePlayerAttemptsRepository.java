package com.pokeverse.play.repository;

import com.pokeverse.play.model.SinglePlayerAttempts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SinglePlayerAttemptsRepository extends JpaRepository<SinglePlayerAttempts, Long> {
}
