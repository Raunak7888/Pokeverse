package com.pokeverse.play.quiz.service;

import com.pokeverse.play.model.Question;
import com.pokeverse.play.quiz.dto.QuestionDto;
import com.pokeverse.play.quiz.utils.ErrorUtil;
import com.pokeverse.play.quiz.utils.Validate;
import com.pokeverse.play.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final Validate validate;
    private final ErrorUtil errorUtil;
    private final String ADMIN_ID;
    private final String ADMIN_PASSWORD;

    public QuestionService(QuestionRepository questionRepository, Validate validate, ErrorUtil errorUtil,
                           @Value("${admin.id}") String adminId,
                           @Value("${admin.password}") String adminPassword) {
        this.ADMIN_ID = adminId;
        this.ADMIN_PASSWORD = adminPassword;
        this.questionRepository = questionRepository;
        this.validate = validate;
        this.errorUtil = errorUtil;
    }

    public ResponseEntity<?> addQuestion(QuestionDto questionDto) {
        String validationError = validate.validateQuestionDto(questionDto);
        if (validationError != null) {
            return errorUtil.badRequest(validationError);
        }

        Question question = questionRepository.findByQuestion(questionDto.question());
        if (question != null) {
            return errorUtil.badRequest("Question already exists");
        }

        question = Question.builder()
                .question(questionDto.question())
                .options(questionDto.options())
                .answer(questionDto.answer())
                .topic(questionDto.topic())
                .difficulty(questionDto.difficulty())
                .build();

        Question savedQuestion;
        try{
            savedQuestion = questionRepository.save(question);
        }catch(Exception e){
            System.out.println(question.getQuestion());
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }

        return ResponseEntity.ok(savedQuestion);
    }

    public ResponseEntity<?> updateQuestion(QuestionDto questionDto) {
        if (questionDto.id() == null) {
            return errorUtil.badRequest("Question ID is required for update");
        }

        Optional<Question> existingQuestionOpt = questionRepository.findById(questionDto.id());
        if (existingQuestionOpt.isEmpty()) {
            return errorUtil.notFound("Question not found");
        }

        String validationError = validate.validateQuestionDto(questionDto);
        if (validationError != null) {
            return errorUtil.badRequest(validationError);
        }

        Question question = existingQuestionOpt.get();
        question.setQuestion(questionDto.question());
        question.setOptions(questionDto.options());
        question.setAnswer(questionDto.answer());
        question.setTopic(questionDto.topic());
        question.setDifficulty(questionDto.difficulty());

        Question updatedQuestion = questionRepository.save(question);
        return ResponseEntity.ok(updatedQuestion);
    }

    public ResponseEntity<?> deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            return errorUtil.notFound("Question not found");
        }
        questionRepository.deleteById(id);
        return ResponseEntity.ok("Question deleted successfully");
    }

    public ResponseEntity<?> getQuestionById(Long id) {
        return questionRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(errorUtil.notFound("Question not found"));
    }

    public boolean isNotAdmin(String adminId, String adminPassword) {
        return !ADMIN_ID.equals(adminId) || !ADMIN_PASSWORD.equals(adminPassword);
    }
}
