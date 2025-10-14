package com.pokeverse.play.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "multiplayer_questions")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class MultiplayerQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    private int roundNumber; // Which round this question belongs to
    private Instant sentAt;

    @PrePersist
    public void prePersist() {
        this.sentAt = Instant.now();
    }
}