export type Player = {
  userId: number;
  name: string;
  profilePicUrl: string;
  score:number;
  
};

export type Room = {
  id: number;
  name: string;
  maxPlayers: number;
  hostId: number;
  started: boolean;
  ended: boolean;
  maxRound: number;
  currentRound: number;
};


export interface WsAnswerValidationDTO {
  userId: number;
  roomId: number;
  questionId: number;
  answer: string;
  correct: boolean;
}

export interface DetailedAnswer {
  questionId: number;
  question: string;
  correctAnswer: string;
  selectedOption: string;
  timeTaken: number;
  correct: boolean;
}

export interface ReviewData {
  userId: number;
  username: string;
  totalPoints: number;
  detailedAnswers: DetailedAnswer[];
}

export interface QuestionAnalysis {
    questionId: number;
    question: string;
    difficulty: string;
    region: string;
    quizType: string;
    selectedAnswer: string;
    options: string[];
    correctAnswer: string;
    timeTaken: number;
    correct: boolean;
};

export interface QuizAnalysis {
    id: number;
    sessionId: number;
    userId: number;
    quizType: string;
    difficulty: string;
    region: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
    totalDuration: number;
    averageTimePerQuestion: number;
    fastestAnswerTime: number;
    slowestAnswerTime: number;
    answerSpeedRating: string;
    performanceRating: string;
    createdAt: string; 
    questionAnalysis: QuestionAnalysis[];
};
