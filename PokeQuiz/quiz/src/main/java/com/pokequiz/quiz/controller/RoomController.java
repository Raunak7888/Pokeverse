package com.pokequiz.quiz.controller;

import com.pokequiz.quiz.dto.PlayerDto;
import com.pokequiz.quiz.dto.RoomDto;
import com.pokequiz.quiz.model.Player;
import com.pokequiz.quiz.model.Room;
import com.pokequiz.quiz.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:3000") // ✅ Class-level
@RequiredArgsConstructor
@Tag(name = "Room Controller", description = "APIs for managing multiplayer quiz rooms and player interactions.")
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/create")
    @Operation(summary = "Create a new quiz room",
            description = "Creates a new multiplayer quiz room with specified settings.",
            requestBody = @RequestBody(
                    description = "Details for creating a new room, including host user ID and room name.",
                    required = true,
                    content = @Content(schema = @Schema(implementation = RoomDto.class))
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Room created successfully",
                            content = @Content(schema = @Schema(implementation = Room.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid room creation request")
            })
    public ResponseEntity<?> createRoom(@RequestBody RoomDto roomDto) {
        return roomService.createRoom(roomDto);
    }

    @PostMapping("/join")
    @Operation(summary = "Join an existing quiz room",
            description = "Allows a player to join a specified quiz room.",
            parameters = {
                    @Parameter(name = "roomId", description = "Unique identifier of the room to join", required = true, example = "1")
            },
            requestBody = @RequestBody(
                    description = "Player details for joining the room, including user ID and player name.",
                    required = true,
                    content = @Content(schema = @Schema(implementation = PlayerDto.class))
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Player joined the room successfully",
                            content = @Content(schema = @Schema(type = "string", example = "Player joined room"))),
                    @ApiResponse(responseCode = "400", description = "Room not found or room is full"),
                    @ApiResponse(responseCode = "409", description = "Player already in the room")
            })
    public ResponseEntity<String> joinRoom(@RequestParam Long roomId, @RequestBody PlayerDto playerDto) {
        return ResponseEntity.ok(roomService.joinRoom(roomId, playerDto));
    }

    @GetMapping("/{roomId}/{userId}")
    @Operation(summary = "Get room details",
            description = "Retrieves details of a specific room, including its players. Only accessible by players already in the room.",
            parameters = {
                    @Parameter(name = "roomId", description = "Unique identifier of the room", required = true, example = "1"),
                    @Parameter(name = "userId", description = "Unique identifier of the requesting user (must be a player in the room)", required = true, example = "10")
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved room details",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"room\": {}, \"players\": []}"))), // Example schema for map
                    @ApiResponse(responseCode = "200", description = "User not in this room",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(example = "{\"room\": \"\", \"players\": \"\", \"message\": \"You are not in this room\"}")))
            })
    public ResponseEntity<Map<String, Object>> getRoom(@PathVariable Long roomId, @PathVariable Long userId) {
        Room room = roomService.getRoom(roomId);
        List<Player> players = room.getPlayers();
        boolean isOkToSend = false;
        for (Player player : players) {
            if (player.getUserId().equals(userId)) {
                isOkToSend = true;
                break;
            }
        }

        Map<String, Object> response = new HashMap<>();
        if (isOkToSend) {
            response.put("room", room);
            response.put("players", players);

        }else{
            response.put("room", "");
            response.put("players", "");
            response.put("message", "You are not in this room");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all active quiz rooms",
            description = "Retrieves a list of all currently active quiz rooms.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved all rooms",
                            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Room.class))))
            })
    public ResponseEntity<?> allRooms() {
        return ResponseEntity.ok(roomService.allRooms());
    }
}