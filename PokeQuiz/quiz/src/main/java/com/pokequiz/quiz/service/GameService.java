package com.pokequiz.quiz.service;

import com.pokequiz.quiz.model.Question;
import com.pokequiz.quiz.repository.QuestionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GameService {

    private final QuestionRepository questionRepository;

    public GameService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<Question> getAllQuizzes() {
        return questionRepository.findAll();
    }

    public List<Question> getQuizzesByDifficulty(String difficulty) {
        return questionRepository.findByDifficulty(difficulty);
    }

    public List<Question> getQuizzesByRegion(String region) {
        return questionRepository.findByRegion(region);
    }

    public List<Question> getQuizzesByRegionAndDifficulty(String region, String difficulty, String quizType) {
        return questionRepository.findByDifficultyAndRegion(region, difficulty,quizType);
    }

    public List<Question> getRandomQuizzes(int limit) {
        return questionRepository.findRandomQuestions(limit);
    }

    public List<Question> getRandomQuizzesAsPerDifficultyAndRegion(String region, String difficulty, String quizType, int limit) {
        return questionRepository.findRandomQuestionsAsPerDifficultyAndRegion(region, difficulty, quizType, limit);
    }

    public List<Question> getQuizzesByQuizType(String quizType) {
        return questionRepository.findByQuizType(quizType);
    }

    public List<Question> graduallyIncreasingDifficulty(int limit) {
        int eachOne = limit / 3;

        List<Question> allQuizzes = new ArrayList<>();
        allQuizzes.addAll(questionRepository.findByDifficultyLimited("easy", eachOne));
        allQuizzes.addAll(questionRepository.findByDifficultyLimited("medium", eachOne));
        allQuizzes.addAll(questionRepository.findByDifficultyLimited("hard", limit - (eachOne * 2)));

        return allQuizzes;
    }

    public Question getRandomQuiz() {
        return questionRepository.findRandomQuestion();
    }

    public Question getRandomQuizExcluding(List<Long> excludedIds) {
        return questionRepository.findRandomQuestionExcluding(excludedIds);
    }

    public ResponseEntity<?> fetchQuizzes(
            String region,
            String difficulty,
            String quizType,
            Integer limit,
            Boolean gradual
    ) {
        // Normalize "all" values to null
        region = ("all".equalsIgnoreCase(region)) ? null : region;
        difficulty = ("all".equalsIgnoreCase(difficulty)) ? null : difficulty;
        quizType = ("all".equalsIgnoreCase(quizType)) ? null : quizType;

        if (Boolean.TRUE.equals(gradual) && limit != null) {
            return ResponseEntity.ok(graduallyIncreasingDifficulty(limit));
        }

        if (region == null && difficulty == null && quizType == null && limit != null) {
            return ResponseEntity.ok(getRandomQuizzes(limit));
        }

        if (limit != null) {
            return ResponseEntity.ok(
                    getRandomQuizzesAsPerDifficultyAndRegion(region, difficulty, quizType, limit)
            );
        }

        if (region != null || difficulty != null || quizType != null) {
            return ResponseEntity.ok(
                    getQuizzesByRegionAndDifficulty(region, difficulty, quizType)
            );
        }

        return ResponseEntity.badRequest()
                .body("Please provide at least one filter (region, difficulty, quizType) or a limit.");
    }


}
