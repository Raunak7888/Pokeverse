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

    @GetMapping("/test")
    public String testQuestion(@RequestParam String adminId, @RequestParam String adminPassword) {
        if(questionService.isNotAdmin(adminId, adminPassword)){
            return "Forbidden: Invalid admin credentials";
        }else{
            return "Question Controller is working!";
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addQuestion(@RequestBody QuestionDto questionDto,@RequestParam String adminId, @RequestParam String adminPassword) {
        if(questionService.isNotAdmin(adminId, adminPassword)){
            return ResponseEntity.status(403).body("Forbidden: Invalid admin credentials");
        }else{
            return questionService.addQuestion(questionDto);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateQuestion(@RequestBody QuestionDto questionDto,@RequestParam String adminId, @RequestParam String adminPassword) {
        if(questionService.isNotAdmin(adminId, adminPassword)){
            return ResponseEntity.status(403).body("Forbidden: Invalid admin credentials");
        }else{
        return questionService.updateQuestion(questionDto);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteQuestion(@RequestParam Long id,@RequestParam String adminId, @RequestParam String adminPassword) {
        if(questionService.isNotAdmin(adminId, adminPassword)){
            return ResponseEntity.status(403).body("Forbidden: Invalid admin credentials");
        }else{
            return questionService.deleteQuestion(id);
        }
    }

    @GetMapping("/question-by-id")
    public ResponseEntity<?> getQuestionById(@RequestParam Long id,@RequestParam String adminId, @RequestParam String adminPassword) {
        if(questionService.isNotAdmin(adminId, adminPassword)){
            return ResponseEntity.status(403).body("Forbidden: Invalid admin credentials");
        }else{
            return questionService.getQuestionById(id);
        }
    }
}
