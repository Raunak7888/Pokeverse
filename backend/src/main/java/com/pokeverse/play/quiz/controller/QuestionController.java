package com.pokeverse.play.quiz.controller;

import com.pokeverse.play.quiz.dto.QuestionDto;
import com.pokeverse.play.quiz.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/api/quiz/question")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping("/add")
    public ResponseEntity<?> addQuestion(@RequestBody QuestionDto questionDto) {
        return questionService.addQuestion(questionDto);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateQuestion(@RequestBody QuestionDto questionDto) {
        return questionService.updateQuestion(questionDto);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteQuestion(@RequestParam Long id) {
        return questionService.deleteQuestion(id);
    }

    @GetMapping("/question-by-id")
    public ResponseEntity<?> getQuestionById(@RequestParam Long id) {
        return questionService.getQuestionById(id);
    }
}
