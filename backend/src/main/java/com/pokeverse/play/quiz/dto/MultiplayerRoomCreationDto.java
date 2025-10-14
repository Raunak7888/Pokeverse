package com.pokeverse.play.quiz.dto;

import com.pokeverse.play.model.Status;
import lombok.ToString;

import java.util.List;

public record MultiplayerRoomCreationDto(
        long id,
        long code,
        long hostId,
        String name,
        int rounds,
        int maxPlayers,
        Status status,
        List<MultiplayerPlayersInRoomDto> players
) {
    @Override
    public String toString() {
        return "MultiplayerRoomCreationDto{" +
                "id=" + id +
                ", code=" + code +
                ", hostId=" + hostId +
                ", name='" + name + '\'' +
                ", rounds=" + rounds +
                ", maxPlayers=" + maxPlayers +
                ", status=" + status +
                ", players=" + players +
                '}';
    }
}
