// store/multiplayerResultStore.ts
import { create } from "zustand";
import { WsAnswerValidationDTO } from "@/utils/types";

const STORAGE_KEY = "multiplayerResults";

interface MultiplayerResultState {
  results: WsAnswerValidationDTO[];
  addResult: (result: WsAnswerValidationDTO) => void;
  clearResults: () => void;
}

// Helper to load from localStorage
const loadFromStorage = (): WsAnswerValidationDTO[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse multiplayer results:", e);
      }
    }
  }
  return [];
};

export const useMultiplayerResultStore = create<MultiplayerResultState>((set, get) => ({
  results: loadFromStorage(),

  addResult: (newResult) => {
    const updatedResults = [...get().results, newResult];

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
    }

    set({ results: updatedResults });
  },

  clearResults: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ results: [] });
  },
}));

