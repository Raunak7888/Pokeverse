export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  loadFromCookies: () => void;
}
export type Question = {
  id: string;
  questionNo: number;
  question: string;
  options: string[];
  selectedAnswer?: string | null;
  isCorrect?: boolean | null;
  answer?: string | null; // backend-confirmed correct answer
};

export type Session = {
  sessionId: number;
  userId: number;
  difficulty: string;
  region: string;
  rounds: number;
};

export type QuizResult = {
  total: number;
  correct: number;
  wrong: number;
};

export interface QuestionAttempt {
  id: number;
  questionNo: number;
  question: string;
  correct: boolean;
  selectedAnswer: string;
}

export interface Analysis {
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
  performanceRating: string;
  answerSpeedRating: string;
  createdAt: string;
  questionAttempts: QuestionAttempt[];
}

export interface Player {
  id: number;
  name: string;
  score: number;
  avatarUrl: string;
  correctAnswer: number;
}

export interface QuizQuestion {
  id: number;
  questionNo: number;
  question: string;
  options: string[];
  correctAnswer: string;
  timeLimit: Date;
}

export interface MultiplayerPlayersInRoomDto {
  id: number;
  userId: number;
  name: string;
  avatar: string;
  score: number;
}

export interface MultiplayerRoomCreationDto {
  id: number;
  code: number;
  hostId: number;
  name: string;
  rounds: number;
  maxPlayers: number;
  status: Status;
  players: MultiplayerPlayersInRoomDto[];
}

export type Status = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"; // adjust as per backend enum
