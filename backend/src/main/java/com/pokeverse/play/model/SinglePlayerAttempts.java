package com.pokeverse.play.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "single_player_attempts")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
public class SinglePlayerAttempts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private SinglePlayerSession session;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    private String selectedAnswer;
    private boolean isCorrect;
    private Instant answeredAt;

    @PrePersist
    protected void onCreate() {
        this.answeredAt = Instant.now();
    }
}
