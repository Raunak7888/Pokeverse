package com.pokeverse.play.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room_players")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class RoomPlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    private String avatar;
    private Long userId;
    private String name;

    @Builder.Default
    private int score = 0;

    @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MultiplayerAttempt> attempts = new ArrayList<>();

    // Helper method
    public void addAttempt(MultiplayerAttempt attempt) {
        attempts.add(attempt);
        attempt.setPlayer(this);
    }
}