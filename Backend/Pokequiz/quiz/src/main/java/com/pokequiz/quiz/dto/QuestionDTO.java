package com.pokequiz.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@Schema(description = "Represents a quiz question with its details, options, and correct answer.")
public class QuestionDTO {
    @Schema(description = "Unique identifier of the question.", example = "1")
    private Long id;

    @NotNull(message = "Question cannot be null")
    @Schema(description = "The text of the question.", example = "Which Pokémon is known as the Electric-type?")
    private String question;

    @NotNull(message = "difficulty cannot be null")
    @Schema(description = "The difficulty level of the question.", example = "Easy", allowableValues = {"Easy", "Medium", "Hard"})
    private String difficulty;

    @NotNull(message = "region cannot be null")
    @Schema(description = "The region associated with the question (e.g., Kanto, Johto).", example = "Kanto")
    private String region;

    @NotNull(message = "quizType cannot be null")
    @Schema(description = "The type of quiz this question belongs to.", example = "Trivia")
    private String quizType;

    @NotNull(message = "options cannot be null")
    @Schema(description = "A list of possible answer options for the question.", example = "[\"Pikachu\", \"Charmander\", \"Squirtle\"]")
    private List<String> options;

    @NotNull(message = "correctAnswer cannot be null")
    @Schema(description = "The correct answer among the options.", example = "Pikachu")
    private String correctAnswer;

}