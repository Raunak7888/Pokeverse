package com.pokequiz.quiz.dto;

import com.pokequiz.quiz.model.Question;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Represents a question to be presented during a game, including its number in the sequence.")
public class GameQuestionDto {
    @Schema(description = "The question details.")
    Question question; // Assuming Question model has its own Swagger annotations if desired
    @Schema(description = "The current question number in the game.", example = "5")
    AtomicInteger questionNumber;
    Long questionEndTime;
}