// stores/useAnalysisStore.ts
import { Analysis } from "@/components/utils/types";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AnalysisStore {
  analysis: Analysis | null;
  loading: boolean;
  error: string | null;
  fetchAnalysis: (sessionId: string) => Promise<void>;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      analysis: null,
      loading: false,
      error: null,

      fetchAnalysis: async (sessionId: string) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(
            `http://localhost:8080/v1/api/quiz/single-player/analysis/${sessionId}`
          );
          if (!res.ok) {
            throw new Error("Failed to fetch analysis");
          }
          const data = await res.json();
          set({ analysis: data, loading: false });
        } catch (err: unknown) {
          if (err instanceof Error) {
            set({ error: err.message, loading: false });
          } else {
            toast.error("An Unknown Error Occurred");
          }
        }
      },

      clearAnalysis: () => set({ analysis: null, error: null }),
    }),
    {
      name: "analysis-storage", // storage key in localStorage
      partialize: (state) => ({
        analysis: state.analysis, // only persist analysis, not loading/error
      }),
    }
  )
);
