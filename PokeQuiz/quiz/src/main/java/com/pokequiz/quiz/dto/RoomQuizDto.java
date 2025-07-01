package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Represents a quiz assigned to a specific room.")
public class RoomQuizDto {
    @Schema(description = "Unique identifier of the quiz.", example = "10")
    private Long quizId;
    @Schema(description = "Unique identifier of the room.", example = "100")
    private Long roomId;
    @Schema(description = "Timestamp when the quiz was assigned to the room.", example = "2023-10-27T11:00:00")
    private LocalDateTime createdAt;
}