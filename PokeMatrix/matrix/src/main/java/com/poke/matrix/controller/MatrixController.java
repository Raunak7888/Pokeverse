package com.poke.matrix.controller;

import com.poke.matrix.dto.CreateMattrixDto;
import com.poke.matrix.dto.ValidateDto;
import com.poke.matrix.model.MatrixStructure;
import com.poke.matrix.model.Player;
import com.poke.matrix.service.MatrixService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/matrix")
@Tag(name = "Matrix Controller", description = "Operations related to matrix generation and validation")
public class MatrixController {

    private static final Logger logger = LoggerFactory.getLogger(MatrixController.class);
    private final MatrixService matrixService;

    public MatrixController(MatrixService matrixService) {
        this.matrixService = matrixService;
    }

    @Operation(summary = "Generate a new matrix",
            description = "Creates a new game matrix with specified rows and columns for a user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Matrix generated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = MatrixStructure.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping("/generate")
    public ResponseEntity<MatrixStructure> generateMatrix(@RequestBody CreateMattrixDto dto) {
        logger.info("Received request to generate matrix with {} rows and {} columns", dto.getRows(), dto.getColumns());
        return ResponseEntity.ok(matrixService.generateMatrix(dto));
    }

    @Operation(summary = "Validate a solution within the matrix",
            description = "Validates if a given Pokémon at a specific position is a correct solution.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solution validation result",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Invalid validation data")
    })
    @PostMapping("/validate")
    public ResponseEntity<?> validateSolution(@RequestBody ValidateDto dto) { // Changed to @RequestBody
        logger.info("Received solution for validation...");
        return ResponseEntity.ok(matrixService.validateSolution(dto));
    }

    @Operation(summary = "Create a new player",
            description = "Registers a new player with a user ID and name.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Player created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Player.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input for player creation")
    })
    @PostMapping("/create/player")
    public ResponseEntity<?> createPlayer(
            @Parameter(description = "The ID of the user", required = true) @RequestParam Long userId,
            @Parameter(description = "The name of the player", required = true) @RequestParam String name) {
        logger.info("Received player creation request...");
        Player createdPlayer = matrixService.createPlayer(userId,name); // Placeholder
        return ResponseEntity.ok(createdPlayer);
    }
}