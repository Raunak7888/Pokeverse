// store/useSinglePlayerQuestionsStore.ts
import { Question } from "@/components/utils/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type State = {
    questions: Question[];
};

type Actions = {
    setQuestions: (questions: Question[]) => void;
    addQuestion: (question: Question) => void;
    updateQuestion: (id: string, updated: Partial<Question>) => void;
    updateQuestionAttempt: (
        id: string,
        selectedAnswer: string,
        isCorrect: boolean,
        answer: string
    ) => void;
    removeQuestion: (id: string) => void;
    clearQuestions: () => void;
    getQuestionById: (id: string) => Question | undefined;
    getQuestionByNo: (no: number) => Question | undefined;
};

export const useSinglePlayerQuestionsStore = create<State & Actions>()(
    devtools(
        persist(
            (set, get) => ({
                questions: [],

                setQuestions: (questions) => set({ questions }),

                addQuestion: (question) =>
                    set((state) => ({
                        questions: [...state.questions, question],
                    })),

                updateQuestion: (id, updated) =>
                    set((state) => ({
                        questions: state.questions.map((q) =>
                            q.id === id ? { ...q, ...updated } : q
                        ),
                    })),
                updateQuestionAttempt: (
                    id,
                    selectedAnswer,
                    isCorrect,
                    answer
                ) =>
                    set((state) => ({
                        questions: state.questions.map((q) =>
                            q.id === id
                                ? { ...q, selectedAnswer, isCorrect, answer }
                                : q
                        ),
                    })),

                removeQuestion: (id) =>
                    set((state) => ({
                        questions: state.questions.filter((q) => q.id !== id),
                    })),

                clearQuestions: () => set({ questions: [] }),

                getQuestionById: (id) =>
                    get().questions.find((q) => q.id === id),

                getQuestionByNo: (no) =>
                    get().questions.find((q) => q.questionNo === no),
            }),
            {
                name: "single-player-questions", // key in localStorage
            }
        )
    )
);
