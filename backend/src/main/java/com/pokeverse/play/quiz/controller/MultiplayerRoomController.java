// ============= MultiplayerRoomController.java =============
package com.pokeverse.play.quiz.controller;

import com.pokeverse.play.quiz.dto.CreateMultiplayerRoomDto;
import com.pokeverse.play.quiz.service.MultiplayerRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
    @RequestMapping("/v1/api/quiz/multiplayer/room")
public class MultiplayerRoomController {

    private final MultiplayerRoomService roomService;

    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody CreateMultiplayerRoomDto dto) {
        return roomService.createMultiplayerRoom(dto);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestParam Long code, @RequestParam Long userId) {
        return roomService.joinMultiplayerRoom(code, userId);
    }

    @PostMapping("/leave")
    public ResponseEntity<?> leaveRoom(@RequestParam Long code, @RequestParam Long userId) {
        return roomService.leaveRoom(code, userId);
    }

    @GetMapping("/get/{code}")
    public ResponseEntity<?> getRoom(@PathVariable Long code) {
        return roomService.getMultiplayerRoom(code);
    }
}