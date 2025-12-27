import {
    MultiplayerPlayersInRoomDto,
    MultiplayerRoomCreationDto,
} from "@/components/utils/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MultiplayerRoomState {
    room: MultiplayerRoomCreationDto | null;
    hasHydrated: boolean;

    setRoom: (room: MultiplayerRoomCreationDto) => void;
    updateRoom: (partial: Partial<MultiplayerRoomCreationDto>) => void;
    clearRoom: () => void;
    
    setPlayers: (players: MultiplayerPlayersInRoomDto[]) => void;
    updatePlayer: (player: MultiplayerPlayersInRoomDto) => void;
    clearPlayers: () => void;

    setHasHydrated: (value: boolean) => void;
}

export const useMultiplayerRoomStore = create<MultiplayerRoomState>()(
    persist(
        (set) => ({
            room: null,
            hasHydrated: false,

            setRoom: (room) => set({ room }),

            updateRoom: (partial) =>
                set((state) =>
                    state.room ? { room: { ...state.room, ...partial } } : state
                ),

            clearRoom: () => set({ room: null }),

            setPlayers: (incomingPlayers) =>
                set((state) => {
                    if (!state.room) return state;

                    const existing = state.room.players;

                    const merged = incomingPlayers.map((incoming) => {
                        const prev = existing.find(
                            (p) => p.userId === incoming.userId
                        );

                        return prev
                            ? {
                                    ...prev,
                                    ...incoming,
                                    avatar: incoming.avatar ?? prev.avatar,
                                }
                            : incoming;
                    });

                    return {
                        room: {
                            ...state.room,
                            players: merged,
                        },
                    };
                }),

            updatePlayer: (player) =>
                set((state) =>
                    state.room
                        ? {
                                room: {
                                    ...state.room,
                                    players: state.room.players.map((p) =>
                                        p.id === player.id ? player : p
                                    ),
                                },
                            }
                        : state
                ),

            clearPlayers: () =>
                set((state) =>
                    state.room
                        ? { room: { ...state.room, players: [] } }
                        : state
                ),

            setHasHydrated: (value) => set({ hasHydrated: value }),
        }),
        {
            name: "multiplayer-room-storage",
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
