// quizData.ts

import { Player, QuizQuestion } from "@/components/utils/types";
import { Variants } from "framer-motion";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    questionNo: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    timeLimit: new Date(Date.now() + 15 * 1000),
  },
  {
    id: 2,
    questionNo: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
    timeLimit: new Date(Date.now() + 15 * 1000),
  },
  {
    id: 3,
    questionNo: 3,
    question: "What is 15 × 8?",
    options: ["120", "125", "115", "130"],
    correctAnswer: "120",
    timeLimit: new Date(Date.now() + 20 * 1000),
  },
  {
    id: 4,
    questionNo: 4,
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: "Leonardo da Vinci",
    timeLimit: new Date(Date.now() + 15 * 1000),
  },
  {
    id: 5,
    questionNo: 5,
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: "Pacific Ocean",
    timeLimit: new Date(Date.now() + 15 * 1000),
  },
];

export const initialPlayers: Player[] = [
  { id: 1, name: "You", score: 0, avatarUrl: "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Riley", correctAnswer: 0 },
  { id: 2, name: "Player 2", score: 0, avatarUrl: "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Sadie", correctAnswer: 0 },
  { id: 3, name: "Player 3", score: 0, avatarUrl: "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Amaya", correctAnswer: 0 },
  { id: 4, name: "Player 4", score: 0, avatarUrl: "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Maria", correctAnswer: 0 },
  { id: 5, name: "Player 5", score: 0, avatarUrl: "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Luna", correctAnswer: 0 },
  { id: 6, name: "Player 6", score: 0, avatarUrl: "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Max", correctAnswer: 0 },
];

export const optionLetters = ["A", "B", "C", "D"];

// Animation variants
export const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};