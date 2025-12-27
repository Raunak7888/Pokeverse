import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import { PlayerResult } from "@/components/utils/types";

interface RoomResult {
    players: PlayerResult[];
    currentUser: PlayerResult | null;
    userRank: number | null;
    fetchedAt: number;
}

interface MultiplayerResultState {
    resultsByRoom: Record<string, RoomResult>;
    roomOrder: string[];
    loading: boolean;

    fetchResults: (roomCode: string, userId: number) => Promise<void>;
    clearAll: () => void;
}

const MAX_ROOMS = 5;

export const useMultiplayerRStore = create<MultiplayerResultState>()(
    persist(
        (set, get) => ({
            resultsByRoom: {},
            roomOrder: [],
            loading: false,
            async fetchResults(roomCode, userId) {
                const { resultsByRoom, roomOrder } = get();
                if (resultsByRoom[roomCode]) return;
                set({ loading: true });
                const res = await api.get(
                    `/v1/api/quiz/multiplayer/room/results/${roomCode}`
                );
                const players: PlayerResult[] = res.data;
                const index = players.findIndex((p) => p.id === userId);
                const roomResult: RoomResult = {
                    players,
                    currentUser: index !== -1 ? players[index] : null,
                    userRank: index !== -1 ? index + 1 : null,
                    fetchedAt: Date.now(),
                };

                const newResults = { ...resultsByRoom, [roomCode]: roomResult };
                const newOrder = [...roomOrder, roomCode];

                // 🧹 EVICTION: keep only last 5 rooms
                if (newOrder.length > MAX_ROOMS) {
                    const oldest = newOrder.shift()!;
                    delete newResults[oldest];
                }

                set({
                    resultsByRoom: newResults,
                    roomOrder: newOrder,
                    loading: false,
                });
            },

            clearAll() {
                set({
                    resultsByRoom: {},
                    roomOrder: [],
                    loading: false,
                });
            },
        }),
        {
            name: "multiplayer-results-cache",
        }
    )
);
