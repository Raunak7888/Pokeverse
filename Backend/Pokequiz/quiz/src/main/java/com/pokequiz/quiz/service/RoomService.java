package com.pokequiz.quiz.service;

import com.pokequiz.quiz.dto.*;
import com.pokequiz.quiz.model.*;
import com.pokequiz.quiz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;
    private final PlayerRepository playerRepository;

    public ResponseEntity<?> createRoom(RoomDto roomDto) {
        if (roomDto.getMaxPlayers() < 2 || roomDto.getMaxPlayers() > 4) {
            return ResponseEntity.badRequest().body("Max players must be between 2 and 4");
        }
        if(roomRepository.findByNameAndHostId(roomDto.getName(), (long) roomDto.getHostId()).isPresent()) {
            return ResponseEntity.badRequest().body("Room with the same name already exists");
        }
        Room room = new Room();
        room.setName(roomDto.getName());
        room.setHostId((long) roomDto.getHostId());
        room.setMaxPlayers(roomDto.getMaxPlayers());
        room.setStarted(false);
        room.setEnded(false);
        room.setMaxRound(roomDto.getMaxRound());
        room.setCurrentRound(0);
        return ResponseEntity.ok(roomRepository.save(room));
    }

    public String joinRoom(Long roomId, PlayerDto playerDto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getPlayers().size() >= room.getMaxPlayers()) {
            return "Room is full";
        }

        Player player = new Player();
        player.setUserId(playerDto.getUserId());
        player.setName(playerDto.getName());
        player.setScore(0);
        player.setRoom(room);

        playerRepository.save(player);

        // Build payload with extra info like profilePicUrl from PlayerDto
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", player.getId());
        payload.put("userId", player.getUserId());
        payload.put("name", player.getName());
        payload.put("score", player.getScore());
        payload.put("profilePicUrl", playerDto.getProfilePicUrl()); // Include DTO-only field

        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/game", payload);

        return "Joined room successfully";
    }


    public Room getRoom(Long roomId) {
        return roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public List<Room> allRooms() {
        return roomRepository.findByStarted(false);
    }

    public Object setTrue(Long roomId,int msg) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        if(msg == 100) {
            room.setStarted(true);
            roomRepository.save(room);
            return "Room started";
        }else{
            room.setEnded(true);
            roomRepository.save(room);
            return "Room stopped";
        }
    }

    public Object setFalse(Long roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
            room.setStarted(false);
            room.setEnded(false);
            roomRepository.save(room);
            return "Room stopped";
    }
}


