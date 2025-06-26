package com.poke.dex.controller;

import com.poke.dex.dto.*;
import com.poke.dex.service.PokemonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // This imports Spring's @RequestBody

import io.swagger.v3.oas.annotations.parameters.RequestBody ; // Renamed Swagger's RequestBody

@RestController
@RequestMapping("/api")
@Tag(name = "Pokémon API", description = "Endpoints for managing Pokémon-related data like types, abilities, moves, and Pokémon itself")
public class PokemonController {

    private final PokemonService pokemonService;

    public PokemonController(PokemonService pokemonService) {
        this.pokemonService = pokemonService;
    }

    @Operation(summary = "Test API", description = "Check if the Pokémon service is running")
    @ApiResponse(responseCode = "200", description = "Service is running",
            content = @Content(mediaType = "text/plain", examples = @ExampleObject(value = "Hello from pokedex service!")))
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Hello from pokedex service!");
    }

    @Operation(
            summary = "Add Pokémon Type",
            description = "Submit a new Pokémon type (e.g., Fire, Water, Grass).",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = TypeDto.class),
                            examples = @ExampleObject(
                                    name = "Minimal Type Example",
                                    value = "{\n"
                                            + "  \"id\": 1,\n"
                                            + "  \"name\": \"Fire\",\n"
                                            + "  \"generation\": \"Generation I\"\n"
                                            + "}"
                            )
                    )
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Type added successfully",
                    content = @Content(schema = @Schema(implementation = TypeDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid type data provided",
                    content = @Content(mediaType = "text/plain", examples = @ExampleObject(value = "Invalid type data.")))
    })
    @PostMapping("/type")
    public ResponseEntity<?> addType(@RequestBody TypeDto type) { // Using Spring's @RequestBody here
        if (type == null) {
            return ResponseEntity.badRequest().body("Invalid type data.");
        }
        return ResponseEntity.ok(pokemonService.addType(type));
    }

    @Operation(
            summary = "Add Damage Relation",
            description = "Add damage relation for a type (e.g., Fire → strong against Grass). TypeDto should include relations like 'doubleDamageTo', 'halfDamageTo', and 'noDamageTo'.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody( // Using the renamed SwaggerRequestBody
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = TypeDto.class),
                            examples = @ExampleObject(
                                    name = "Example Damage Relation Request",
                                    value = "{\"id\": 10, \"name\": \"Fire\", \"type\": 10, \"relatedType\": 12, \"timesDamage\": 2.0}"
                            )
                    )
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Damage relation added successfully",
                    content = @Content(schema = @Schema(implementation = TypeDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid damage relation data provided",
                    content = @Content(mediaType = "text/plain", examples = @ExampleObject(value = "Invalid damage relation data.")))
    })
    @PostMapping("/damage-relation")
    public ResponseEntity<?> addDamageRelation(@RequestBody TypeDto typeDto) { // Using Spring's @RequestBody here
        if (typeDto == null) {
            return ResponseEntity.badRequest().body("Invalid damage relation data.");
        }
        return ResponseEntity.ok(pokemonService.addDamageRelation(typeDto));
    }

    @Operation(
            summary = "Add Ability",
            description = "Add a Pokémon ability. Send a JSON with the ability name, description, and generation.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody( // Using the renamed SwaggerRequestBody
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = OnlyAbilityDto.class),
                            examples = @ExampleObject(
                                    name = "Example Ability Request",
                                    value = "{\"name\": \"Overgrow\", \"description\": \"Powers up Grass-type moves when HP is low.\", \"generation\": \"Generation I\"}"
                            )
                    )
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ability added successfully",
                    content = @Content(schema = @Schema(implementation = OnlyAbilityDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid ability data provided",
                    content = @Content(mediaType = "text/plain", examples = @ExampleObject(value = "Invalid ability data.")))
    })
    @PostMapping("/ability")
    public ResponseEntity<?> addAbility(@RequestBody OnlyAbilityDto ability){ // Using Spring's @RequestBody here
        if (ability == null) {
            return ResponseEntity.badRequest().body("Invalid ability data.");
        }
        return pokemonService.addAbility(ability);
    }

    @Operation(
            summary = "Add Move",
            description = "Add a Pokémon move with details like power, accuracy, type, PP, effect, damage type, generation, description, learn method, and level learned at.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody( // Using the renamed SwaggerRequestBody
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = MoveDto.class),
                            examples = @ExampleObject(
                                    name = "Example Move Request",
                                    value = "{\"name\": \"Flamethrower\", \"type\": \"Fire\", \"power\": 90, \"accuracy\": 100, \"pp\": 15, \"effect\": \"Has a 10% chance to burn the target.\", \"damageType\": \"Special\", \"generation\": \"Generation I\", \"description\": \"A powerful fire attack.\", \"learnMethod\": \"level-up\", \"levelLearnedAt\": 49}"
                            )
                    )
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Move added successfully",
                    content = @Content(schema = @Schema(implementation = MoveDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid move data provided",
                    content = @Content(mediaType = "text/plain", examples = @ExampleObject(value = "Invalid move data.")))
    })
    @PostMapping("/move")
    public ResponseEntity<?> addMove(@RequestBody MoveDto moveDto) { // Using Spring's @RequestBody here
        if (moveDto == null) {
            return ResponseEntity.badRequest().body("Invalid move data.");
        }
        return pokemonService.addMove(moveDto);
    }

    @Operation(
            summary = "Add Pokémon",
            description = "Add a complete Pokémon entry. This DTO includes stats, types, abilities, moves, species details, breeding information, catch rate, happiness, growth rate, sprite URL, and form.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody( // Using the renamed SwaggerRequestBody
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = PokemonDto.class),
                            examples = @ExampleObject(
                                    name = "Example Pokemon Request",
                                    value = "{\"id\": 1, \"name\": \"Bulbasaur\", \"height\": 7, \"weight\": 69, \"baseExperience\": 64, \"types\": [{\"id\": 4, \"name\": \"Grass\", \"generation\": \"Generation I\"}, {\"id\": 3, \"name\": \"Poison\", \"generation\": \"Generation I\"}], \"abilities\": [{\"id\": 65, \"name\": \"Overgrow\", \"isHidden\": false, \"effect\": \"Powers up Grass-type moves when HP is low.\"}], \"stats\": {\"hp\": 45, \"attack\": 49, \"defense\": 49, \"specialAttack\": 65, \"specialDefense\": 65, \"speed\": 45}, \"species\": {\"flavorText\": \"A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.\", \"genus\": \"Seed Pokémon\", \"habitat\": \"Grassland\", \"color\": \"Green\", \"shape\": \"quadruped\", \"generation\": \"Generation I\", \"legendary\": false, \"mythical\": false}, \"moves\": [{\"id\": 33, \"name\": \"Tackle\", \"type\": \"Normal\", \"power\": 40, \"accuracy\": 100, \"pp\": \"35\", \"generation\": \"Generation I\", \"description\": \"A physical attack in which the user charges and slams into the target with its whole body.\", \"learnMethod\": \"level-up\", \"levelLearnedAt\": 1}], \"breeding\": {\"eggGroups\": [\"Monster\", \"Grass\"], \"hatchTime\": 5140, \"genderRatio\": {\"male\": 0.875, \"female\": 0.125}}, \"baseCatchRate\": 45, \"baseHappiness\": 70, \"growthRate\": \"medium-slow\", \"spriteUrl\": \"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png\", \"form\": {\"name\": \"Bulbasaur\", \"formName\": \"Default\", \"isMega\": false, \"isGigantamax\": false}}"
                            )
                    )
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pokémon added successfully",
                    content = @Content(mediaType = "text/plain", examples = @ExampleObject(value = "✅ Pokémon added successfully!")))
    })
    @PostMapping("/pokemon")
    public ResponseEntity<?> addPokemon(@RequestBody PokemonDto dto) { // Using Spring's @RequestBody here
        pokemonService.addPokemon(dto);
        return ResponseEntity.ok("✅ Pokémon added successfully!");
    }

    @Operation(
            summary = "Get Pokémon by ID Range",
            description = "Retrieve Pokémon within a specific ID range.",
            parameters = {
                    @Parameter(name = "startId", description = "Start Pokémon ID", required = true, example = "1"),
                    @Parameter(name = "endId", description = "End Pokémon ID", required = true, example = "10")
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved Pokémon in range",
                    content = @Content(schema = @Schema(implementation = PokemonCardDto.class))),
            @ApiResponse(responseCode = "404", description = "No Pokémon found in the specified range",
                    content = @Content(mediaType = "text/plain")) // Assuming service returns a specific error message
    })
    @GetMapping("/range/{startId}/{endId}")
    public ResponseEntity<?> getPokemonsInRange(
            @PathVariable Integer startId,
            @PathVariable Integer endId) {
        return pokemonService.getPokemonsInRange(startId, endId);
    }

    @Operation(
            summary = "Get Pokémon by Type",
            description = "Retrieve Pokémon of a specific type within an ID range.",
            parameters = {
                    @Parameter(name = "typeId", description = "Type ID (e.g., 10 for Fire)", required = true, example = "10"),
                    @Parameter(name = "startId", description = "Start Pokémon ID", required = true, example = "1"),
                    @Parameter(name = "endId", description = "End Pokémon ID", required = true, example = "100")
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved Pokémon by type",
                    content = @Content(schema = @Schema(implementation = PokemonCardDto.class))),
            @ApiResponse(responseCode = "404", description = "No Pokémon found for the specified type and range",
                    content = @Content(mediaType = "text/plain"))
    })
    @GetMapping("/type/{typeId}/{startId}/{endId}")
    public ResponseEntity<?> getPokemonsByType(
            @PathVariable int typeId,
            @PathVariable Integer startId,
            @PathVariable Integer endId) {
        return pokemonService.getPokemonByType(typeId, startId, endId);
    }

    @Operation(
            summary = "Get Pokémon by Generation",
            description = "Fetch Pokémon from a specific generation in a given range.",
            parameters = {
                    @Parameter(name = "generation", description = "Generation number (e.g., 1 for Kanto)", required = true, example = "1"),
                    @Parameter(name = "startId", description = "Start Pokémon ID", required = true, example = "1"),
                    @Parameter(name = "endId", description = "End Pokémon ID", required = true, example = "151")
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved Pokémon by generation",
                    content = @Content(schema = @Schema(implementation = PokemonCardDto.class))),
            @ApiResponse(responseCode = "404", description = "No Pokémon found for the specified generation and range",
                    content = @Content(mediaType = "text/plain"))
    })
    @GetMapping("/generation/{generation}/{startId}/{endId}")
    public ResponseEntity<?> getPokemonsByGeneration(
            @PathVariable int generation,
            @PathVariable Integer startId,
            @PathVariable Integer endId) {
        return pokemonService.getPokemonsByGeneration(generation, startId, endId);
    }

    @Operation(
            summary = "Get Pokémon by Ability",
            description = "Find Pokémon that have a specific ability in a given range.",
            parameters = {
                    @Parameter(name = "ability", description = "Ability name (e.g., 'Levitate')", required = true, example = "Levitate"),
                    @Parameter(name = "startId", description = "Start Pokémon ID", required = true, example = "1"),
                    @Parameter(name = "endId", description = "End Pokémon ID", required = true, example = "200")
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved Pokémon by ability",
                    content = @Content(schema = @Schema(implementation = PokemonCardDto.class))),
            @ApiResponse(responseCode = "404", description = "No Pokémon found for the specified ability and range",
                    content = @Content(mediaType = "text/plain"))
    })
    @GetMapping("/abilities/{ability}/{startId}/{endId}")
    public ResponseEntity<?> getPokemonsByAbilities(
            @PathVariable String ability,
            @PathVariable Integer startId,
            @PathVariable Integer endId) {
        return pokemonService.getPokemonsByAbilities(ability, startId, endId);
    }

    @Operation(
            summary = "Get Legendary Pokémon",
            description = "Retrieve all legendary Pokémon within a given ID range.",
            parameters = {
                    @Parameter(name = "startId", description = "Start Pokémon ID", required = true, example = "1"),
                    @Parameter(name = "endId", description = "End Pokémon ID", required = true, example = "800")
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved legendary Pokémon",
                    content = @Content(schema = @Schema(implementation = PokemonCardDto.class))),
            @ApiResponse(responseCode = "404", description = "No legendary Pokémon found in the specified range",
                    content = @Content(mediaType = "text/plain"))
    })
    @GetMapping("/legendary/{startId}/{endId}")
    public ResponseEntity<?> getLegendaryPokemons(@PathVariable Integer startId, @PathVariable Integer endId) {
        return pokemonService.getLegendaryPokemons(startId, endId);
    }

    @Operation(
            summary = "Get Mythical Pokémon",
            description = "Retrieve all mythical Pokémon within a given ID range.",
            parameters = {
                    @Parameter(name = "startId", description = "Start Pokémon ID", required = true, example = "1"),
                    @Parameter(name = "endId", description = "End Pokémon ID", required = true, example = "800")
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved mythical Pokémon",
                    content = @Content(schema = @Schema(implementation = PokemonCardDto.class))),
            @ApiResponse(responseCode = "404", description = "No mythical Pokémon found in the specified range",
                    content = @Content(mediaType = "text/plain"))
    })
    @GetMapping("/mythical/{startId}/{endId}")
    public ResponseEntity<?> getMythicalPokemons(@PathVariable Integer startId, @PathVariable Integer endId) {
        return pokemonService.getMythicalPokemons(startId, endId);
    }

    @Operation(
            summary = "Get Pokémon by ID",
            description = "Fetch a single Pokémon by its unique ID.",
            parameters = {
                    @Parameter(name = "pokemonId", description = "Pokémon ID", required = true, example = "25")
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved Pokémon by ID",
                    content = @Content(schema = @Schema(implementation = PokeDetailDto.class))),
            @ApiResponse(responseCode = "404", description = "Pokémon not found for the given ID",
                    content = @Content(mediaType = "text/plain"))
    })
    @GetMapping("/pokemon/{pokemonId}")
    public ResponseEntity<?> getPokemonById(@PathVariable int pokemonId) {
        return pokemonService.getPokemonById(pokemonId);
    }
}
