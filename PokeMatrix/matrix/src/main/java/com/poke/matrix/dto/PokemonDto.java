package com.poke.matrix.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Schema(description = "DTO for detailed Pokémon information")
public class PokemonDto {
    @Schema(description = "Unique ID of the Pokémon", example = "25")
    private Long id;
    @Schema(description = "Name of the Pokémon", example = "Pikachu")
    private String name;
    @Schema(description = "Height of the Pokémon in decimetres", example = "4") // Example in dm
    private int height;
    @Schema(description = "Weight of the Pokémon in hectograms", example = "60") // Example in hg
    private int weight;
    @Schema(description = "Primary type of the Pokémon", example = "Electric")
    private String type1;
    @Schema(description = "Secondary type of the Pokémon (can be null)", example = "Flying")
    private String type2;
    @Schema(description = "Region the Pokémon originates from", example = "Kanto")
    private String region;
    @Schema(description = "Evolution stage of the Pokémon", example = "Basic")
    private String evolutionStage;
    @Schema(description = "Legendary status of the Pokémon", example = "Normal")
    private String legendaryStatus;
    @Schema(description = "Dominant color of the Pokémon", example = "Yellow")
    private String color;
    @Schema(description = "Body shape of the Pokémon", example = "Quadruped")
    private String bodyShape;
    @Schema(description = "List of abilities the Pokémon possesses", example = "[\"Static\", \"Lightning Rod\"]")
    private List<String> abilities;

}