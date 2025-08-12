package com.pokeverse.scribble.controller;

import com.pokeverse.scribble.dto.PlayerDTO;
import com.pokeverse.scribble.dto.RoomDTO;
import com.pokeverse.scribble.service.RoomService;
import com.pokeverse.scribble.service.RoundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/room")
@RequiredArgsConstructor
@Tag(name = "Room Management", description = "APIs for managing game rooms, including creation, joining, and status checks.")
public class RoomController {

    private final RoomService roomService;
    private final RoundService roundService;

    /**
     * A simple test endpoint to check if the Scribble service is running.
     *
     * @return A greeting message wrapped in ResponseEntity.
     */
    @Operation(
            summary = "Test API Endpoint",
            description = "Checks the health and responsiveness of the Scribble service.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Service is up and running",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class),
                                    examples = @ExampleObject(value = "Hello from Scribble service!")
                            )
                    )
            }
    )
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Hello from Scribble service!");
    }

    /**
     * Creates a new game room based on the provided room details.
     *
     * @param dto The RoomDTO containing details for the new room.
     * @return ResponseEntity with the created RoomDTO or error message.
     */
    @Operation(
            summary = "Create a new game room",
            description = "Allows a user (host) to create a new game room with specified settings like name, max players, and privacy.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Details for the new room to be created",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = RoomDTO.class),
                            examples = {
                                    @ExampleObject(
                                            name = "Public Room Example",
                                            summary = "Example for a public room",
                                            value = "{\"roomName\": \"My Public Game\", \"hostId\": 101, \"hostUsername\": \"playerOne\", \"maxPlayer\": 8, \"maxRounds\": 5, \"isPublic\": true, \"password\": null}"
                                    ),
                                    @ExampleObject(
                                            name = "Private Room Example",
                                            summary = "Example for a private room with password",
                                            value = "{\"roomName\": \"Secret Hideout\", \"hostId\": 102, \"hostUsername\": \"playerTwo\", \"maxPlayer\": 6, \"maxRounds\": 7, \"isPublic\": false, \"password\": \"mysecretpass\"}"
                                    )
                            }
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Room created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = RoomDTO.class),
                                    examples = @ExampleObject(value = "{\"roomName\": \"My Public Game\", \"hostId\": 101, \"hostUsername\": \"playerOne\", \"maxPlayer\": 8, \"maxRounds\": 5, \"isPublic\": true, \"password\": null}")
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid room data provided",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class),
                                    examples = @ExampleObject(value = "Room name already exists.")
                            )
                    ),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody RoomDTO dto) {
        return roomService.createRoom(dto);
    }

    /**
     * Allows a player to join an existing game room.
     *
     * @param dto The PlayerDTO containing the room ID, player ID, username, and optionally password.
     * @return ResponseEntity with player info or error message.
     */
    @Operation(
            summary = "Join an existing game room",
            description = "Allows a player to join a specified room, requiring a password if the room is private.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Details of the player and the room to join",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = PlayerDTO.class),
                            examples = {
                                    @ExampleObject(
                                            name = "Join Public Room Example",
                                            summary = "Example for joining a public room",
                                            value = "{\"roomId\": 1, \"playerId\": 201, \"username\": \"newPlayer\", \"password\": null}"
                                    ),
                                    @ExampleObject(
                                            name = "Join Private Room Example",
                                            summary = "Example for joining a private room with correct password",
                                            value = "{\"roomId\": 2, \"playerId\": 202, \"username\": \"privateUser\", \"password\": \"mysecretpass\"}"
                                    )
                            }
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully joined the room",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PlayerDTO.class),
                                    examples = @ExampleObject(value = "{\"roomId\": 1, \"playerId\": 201, \"username\": \"newPlayer\", \"password\": null}")
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid join request (e.g., room full, wrong password, room not found)",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class),
                                    examples = @ExampleObject(value = "Room is full or password incorrect.")
                            )
                    ),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestBody PlayerDTO dto) {
        return roomService.joinRoom(dto);
    }

//    /**
//     * Resets the round service state. This is typically for administrative or testing purposes.
//     *
//     * @return A confirmation message.
//     */
//    @Operation(
//            summary = "Reset round service",
//            description = "Resets the internal state of the round service. Use with caution, primarily for development or testing.",
//            responses = {
//                    @ApiResponse(
//                            responseCode = "200",
//                            description = "Round service reset successfully",
//                            content = @Content(
//                                    mediaType = "application/json",
//                                    schema = @Schema(implementation = String.class),
//                                    examples = @ExampleObject(value = "reset success")
//                            )
//                    )
//            }
//    )
//    @GetMapping("/reset")
//    public ResponseEntity<String> reset() {
//        roundService.reset();
//        return ResponseEntity.ok("reset success");
//    }
}
