export type Player = {
  id: number;
  userId : number;
  name: string;
  profilePicUrl: string;
  score:number;
  
};
export type User = {
  id: number;
  username: string;
  email: string;
  profilePicUrl: string;
}

export interface BackendQuestion {
  id: number;
  question: string;
  difficulty: string;
  region: string;
  quizType: string;
  options: string;
  createdAt: string;
}

export interface MultiplayerQuestion {
  question: {
    id: number;
    question: string;
    difficulty: string;
    region: string;
    quizType: string;
    options: string[];
    createdAt: string;
  };
  questionNumber: number;
  questionEndTime: number;
}
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

export type MultiplayerResultProps = {
  duration: number;
  correct?: boolean; // Optional flag to show if the answer was correct
};

export interface WsAnswerValidationDTO {
  userId: number;
  roomId: number;
  questionId: number;
  answer: string;
  correct: boolean;
  score: number;
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

export interface QuestionComponentProps {
  questionNumber: number;
  questionText: string;
  optionsText: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedOption: string | null;
  onSelect: (option: string | null) => void;
  onSubmit: () => void;
  isTimebound?: boolean;
  endTime?: number;
}

export interface CompletedResultProps {
  score: string;
  total: string;
  sessionId?: string;
}
