import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BackendQuestion {
  id: number;
  question: string;
  difficulty: string;
  region: string;
  quizType: string;
  options: string;
  createdAt: string;
}

interface MultiplayerQuestion {
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
}

interface MultiplayerQuestionState {
  multiplayerQuestion: MultiplayerQuestion | null;
  setMultiplayerQuestion: (rawQuestionData: any) => void;
  clearMultiplayerQuestion: () => void;
}

export const useMultiplayerQuestionStore = create<MultiplayerQuestionState>()(
  devtools(
    (set) => ({
      multiplayerQuestion: null,

      setMultiplayerQuestion: (rawQuestionData: any) => {
        if (rawQuestionData === null) {
          set({ multiplayerQuestion: null });
          localStorage.removeItem('multiplayerQuestion');
          return;
        }

        if (
          rawQuestionData &&
          rawQuestionData.question &&
          rawQuestionData.questionNumber !== undefined
        ) {
          try {
            const backendQuestion: BackendQuestion = rawQuestionData.question;

            // Ensure options are parsed safely
            const optionsArray: string[] = backendQuestion.options
              ? JSON.parse(backendQuestion.options)
              : [];

            // Create a new object reference every time to force Zustand update
            const parsedQuestion: MultiplayerQuestion = {
              question: {
                id: backendQuestion.id,
                question: backendQuestion.question,
                difficulty: backendQuestion.difficulty,
                region: backendQuestion.region,
                quizType: backendQuestion.quizType,
                createdAt: backendQuestion.createdAt,
                options: optionsArray,
              },
              questionNumber: rawQuestionData.questionNumber,
            };

            // Save to localStorage
            localStorage.setItem('multiplayerQuestion', JSON.stringify(parsedQuestion));

            // Force Zustand state update with new reference
            set({ multiplayerQuestion: { ...parsedQuestion } });
          } catch (e) {
            console.error("Error parsing raw question data:", e);
            set({ multiplayerQuestion: null });
            localStorage.removeItem('multiplayerQuestion');
          }
        }
      },

      clearMultiplayerQuestion: () => {
        set({ multiplayerQuestion: null });
        localStorage.removeItem('multiplayerQuestion');
      },
    }),
    {
      name: "MultiplayerQuestionStore", // Redux DevTools name
      enabled: process.env.NODE_ENV === "development", // Optional: only enable in dev
    }
  )
);
