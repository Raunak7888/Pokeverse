package com.pokeverse.play.quiz.mapper;

import com.pokeverse.play.model.Room;
import com.pokeverse.play.model.RoomPlayer;
import com.pokeverse.play.quiz.dto.MultiplayerPlayersInRoomDto;
import com.pokeverse.play.quiz.dto.MultiplayerRoomCreationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

public class RoomMapper {
    private static final Logger log = LoggerFactory.getLogger(RoomMapper.class);
    public static MultiplayerRoomCreationDto toDto(Room room, Long code) {
        List<MultiplayerPlayersInRoomDto> players = room.getPlayers().stream()
                .map(RoomMapper::toPlayerDto)
                .collect(Collectors.toList());
        MultiplayerRoomCreationDto roomDto = new MultiplayerRoomCreationDto(
                                                room.getId(),
                                                code,
                                                room.getHostId(),
                                                room.getName(),
                                                room.getTotalRounds(),
                                                room.getMaxPlayers(),
                                                room.getStatus(),
                                                players
                                        );
        log.info("Room DTO created: {}", roomDto);
        return roomDto;
    }

    private static MultiplayerPlayersInRoomDto toPlayerDto(RoomPlayer player) {
        return new MultiplayerPlayersInRoomDto(
                player.getId(),
                player.getUserId(),
                player.getName(),
                player.getAvatar(),
                player.getScore()
        );
    }
}
