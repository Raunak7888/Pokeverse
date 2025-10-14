package com.pokeverse.play.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long hostId;
    private String name;
    private int totalRounds;
    private int maxPlayers;
    private int currentRound;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.NOT_STARTED;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RoomPlayer> players = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MultiplayerQuestion> questions = new ArrayList<>();

    @CreationTimestamp
    private Instant createdAt;

    // Helper methods
    public void addPlayer(RoomPlayer player) {
        players.add(player);
        player.setRoom(this);
    }

    public void addQuestion(MultiplayerQuestion question) {
        questions.add(question);
        question.setRoom(this);
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }

    public boolean isHost(Long userId) {
        return hostId.equals(userId);
    }

    public boolean hasPlayer(Long userId) {
        return players.stream().anyMatch(p -> p.getUserId()==userId);
    }
}