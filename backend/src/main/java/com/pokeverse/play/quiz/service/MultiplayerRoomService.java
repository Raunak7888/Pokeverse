package com.pokeverse.play.quiz.service;

import com.pokeverse.play.model.Room;
import com.pokeverse.play.model.RoomPlayer;
import com.pokeverse.play.model.Status;
import com.pokeverse.play.model.User;
import com.pokeverse.play.quiz.dto.CreateMultiplayerRoomDto;
import com.pokeverse.play.quiz.dto.MultiplayerRoomCreationDto;
import com.pokeverse.play.quiz.mapper.RoomIdAndCodeMapper;
import com.pokeverse.play.quiz.mapper.RoomMapper;
import com.pokeverse.play.quiz.utils.ErrorUtil;
import com.pokeverse.play.repository.RoomRepository;
import com.pokeverse.play.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MultiplayerRoomService {

    private static final Logger log = LoggerFactory.getLogger(MultiplayerRoomService.class);

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RedisCacheService redisCacheService;
    private final ErrorUtil errorUtil;
    private final RoomIdAndCodeMapper roomIdAndCodeMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private static final String ROOM_CACHE_PREFIX = "room";

    @Transactional
    public ResponseEntity<?> createMultiplayerRoom(CreateMultiplayerRoomDto dto) {
        if (dto.rounds() <= 0)
            return errorUtil.badRequest("Rounds must be greater than zero.");
        if (dto.maxPlayers() < 2)
            return errorUtil.badRequest("Room must allow at least 2 players.");
        if (dto.name() == null || dto.name().isBlank())
            return errorUtil.badRequest("Room name cannot be empty.");

        User host = userRepository.findById(dto.hostId()).orElse(null);
        if (host == null)
            return errorUtil.notFound("Host user not found.");

        Room room = Room.builder()
                .hostId(host.getId())
                .name(dto.name())
                .totalRounds(dto.rounds())
                .maxPlayers(dto.maxPlayers())
                .currentRound(0)
                .status(Status.NOT_STARTED)
                .build();

        RoomPlayer hostPlayer = RoomPlayer.builder()
                .userId(host.getId())
                .name(host.getUsername())
                .avatar(host.getProfilePictureUrl())
                .build();

        room.addPlayer(hostPlayer);
        Room savedRoom = roomRepository.save(room);
        Long code = roomIdAndCodeMapper.assignCodeToRoom(savedRoom.getId());

        MultiplayerRoomCreationDto roomDto = RoomMapper.toDto(savedRoom, code);
        cacheRoom(roomDto);

        return ResponseEntity.ok(roomDto);
    }

    public ResponseEntity<?> getMultiplayerRoom(Long code) {
        Long roomId = roomIdAndCodeMapper.getRoomIdByCode(code);
        if (roomId == null)
            return errorUtil.notFound("Room not found");

        MultiplayerRoomCreationDto cachedRoom = getRoomFromCache(roomId);
        if (cachedRoom != null) {
            return ResponseEntity.ok(cachedRoom);
        }

        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null)
            return errorUtil.notFound("Room not found.");

        MultiplayerRoomCreationDto roomDto = RoomMapper.toDto(room, code);
        cacheRoom(roomDto);

        return ResponseEntity.ok(roomDto);
    }

    @Transactional
    public ResponseEntity<?> joinMultiplayerRoom(Long code, Long userId) {
        Long roomId = roomIdAndCodeMapper.getRoomIdByCode(code);
        if (roomId == null){
            return errorUtil.notFound("Room not found");
        }
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null){
            return errorUtil.notFound("Room not found.");
        }
        if (room.getStatus() != Status.NOT_STARTED)
            return errorUtil.badRequest("Cannot join room - game already started.");
        if (room.isFull())
            return errorUtil.badRequest("Room is full.");
        if (room.hasPlayer(userId))
            return errorUtil.badRequest("Already in this room.");
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return errorUtil.notFound("User not found.");
        RoomPlayer newPlayer = RoomPlayer.builder()
                .userId(user.getId())
                .name(user.getUsername())
                .avatar(user.getProfilePictureUrl())
                .build();
        room.addPlayer(newPlayer);
        Room updatedRoom = roomRepository.save(room);

        MultiplayerRoomCreationDto roomDto = RoomMapper.toDto(updatedRoom, code);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/quiz", roomDto);
        cacheRoom(roomDto);

        return ResponseEntity.ok(roomDto);
    }

    @Transactional
    public ResponseEntity<?> leaveRoom(Long code, Long userId) {
        Long roomId = roomIdAndCodeMapper.getRoomIdByCode(code);
        if (roomId == null)
            return errorUtil.notFound("Room not found");

        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null)
            return errorUtil.notFound("Room not found.");

        RoomPlayer player = room.getPlayers().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElse(null);

        if (player == null)
            return errorUtil.badRequest("Not in this room.");

        if (room.isHost(userId)) {
            roomRepository.delete(room);
            invalidateCache(roomId);
            return ResponseEntity.ok("Room deleted as host left.");
        }

        room.getPlayers().remove(player);
        Room updatedRoom = roomRepository.save(room);

        MultiplayerRoomCreationDto roomDto = RoomMapper.toDto(updatedRoom, code);
        cacheRoom(roomDto);

        return ResponseEntity.ok(roomDto);
    }

    private MultiplayerRoomCreationDto getRoomFromCache(Long roomId) {
        return redisCacheService.get(ROOM_CACHE_PREFIX, roomId, MultiplayerRoomCreationDto.class)
                .orElse(null);
    }

    private void cacheRoom(MultiplayerRoomCreationDto roomDto) {
        redisCacheService.set(ROOM_CACHE_PREFIX, roomDto.id(), roomDto);
    }

    private void invalidateCache(Long roomId) {
        redisCacheService.delete(ROOM_CACHE_PREFIX, roomId);
    }
}
