"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Session = {
    sessionId: number | null;
    userId: number | null;
    difficulty: string | null;
    rounds: number;
};

interface SinglePlayerSessionState {
    session: Session | null;
    setSession: (session: Session) => void;
    clearSession: () => void;
}

export const useSinglePlayerSessionStore = create<SinglePlayerSessionState>()(
    persist(
        (set) => ({
            session: null,

            setSession: (session) => set({ session }),

            clearSession: () =>
                set({
                    session: {
                        sessionId: null,
                        userId: null,
                        difficulty: null,
                        rounds: 0,
                    },
                }),
        }),
        {
            name: "single-player-session", // storage key
        }
    )
);
