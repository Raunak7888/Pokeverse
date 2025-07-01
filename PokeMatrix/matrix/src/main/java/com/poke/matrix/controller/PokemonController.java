package com.poke.matrix.controller;

import com.poke.matrix.dto.PokemonDto;
import com.poke.matrix.service.PokemonService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/pokemon")
@Tag(name = "Pokemon Controller", description = "Operations related to Pokémon data management")
public class PokemonController {

    private static final Logger logger = LoggerFactory.getLogger(PokemonController.class);
    private final PokemonService pokemonService;

    public PokemonController(PokemonService pokemonService) {
        this.pokemonService = pokemonService;
    }

    @Operation(summary = "Add a new Pokémon",
            description = "Adds detailed information about a new Pokémon to the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pokémon added successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = String.class))), // Assuming service returns a String message
            @ApiResponse(responseCode = "400", description = "Invalid Pokémon data provided")
    })
    @PostMapping("/add")
    public ResponseEntity<String> addPokemon(@RequestBody PokemonDto pokemonDto) {
        logger.info("Received request to add Pokémon: {}", pokemonDto.getName());
        return pokemonService.addPokemon(pokemonDto);
    }
}