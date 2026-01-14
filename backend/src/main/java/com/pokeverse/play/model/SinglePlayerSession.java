package com.pokeverse.play.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "single_players_sessions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class SinglePlayerSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String difficulty;
    private int rounds;
    private int currentRound;
    @Enumerated(EnumType.STRING)
    private Status status;
    @Builder.Default
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SinglePlayerAttempts> attempts = new ArrayList<>();
    private Instant startedAt;
    private Instant completedAt;
    private Instant createdAt;
    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
