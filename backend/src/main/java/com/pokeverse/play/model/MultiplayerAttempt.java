// ============= MultiplayerAttempt.java =============
package com.pokeverse.play.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "multiplayer_attempts")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class MultiplayerAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private RoomPlayer player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "multiplayer_question_id", nullable = false)
    private MultiplayerQuestion multiplayerQuestion;

    private String selectedOption;
    private boolean isCorrect;
    private Instant answeredAt;

    @PrePersist
    public void prePersist() {
        this.answeredAt = Instant.now();
    }
}