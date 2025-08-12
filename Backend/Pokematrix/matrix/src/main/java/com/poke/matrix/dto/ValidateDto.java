package com.poke.matrix.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "DTO for validating a proposed solution in the matrix")
public class ValidateDto {
    @Schema(description = "ID of the matrix being validated", example = "1")
    private Long matrixId;
    @Schema(description = "ID of the Pokémon being validated", example = "25")
    private Long pokemonId;
    @Schema(description = "Row ID of the proposed solution", example = "0")
    private Long rowId;
    @Schema(description = "Column ID of the proposed solution", example = "0")
    private Long colId;
    @Schema(description = "ID of the user performing the validation", example = "101")
    private Long userId;
    @Schema(description = "Indicates if the proposed solution is valid (true/false)", example = "true")
    private boolean isValid;
}