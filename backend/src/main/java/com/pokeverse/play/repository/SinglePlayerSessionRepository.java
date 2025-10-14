package com.pokeverse.play.repository;

import com.pokeverse.play.model.SinglePlayerSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SinglePlayerSessionRepository extends JpaRepository<SinglePlayerSession, Long> {
    List<SinglePlayerSession> findByUserId(Long userId);
}
