package com.poke.matrix.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "DTO for creating a new game matrix")
public class CreateMattrixDto {
    @Schema(description = "ID of the user requesting matrix creation", example = "101")
    private Long userId;
    @Schema(description = "Number of rows for the matrix", example = "5")
    private int rows;
    @Schema(description = "Number of columns for the matrix", example = "5")
    private int columns;
}