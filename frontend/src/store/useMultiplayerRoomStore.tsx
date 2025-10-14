import { MultiplayerRoomCreationDto } from "@/components/utils/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MultiplayerRoomState {
  room: MultiplayerRoomCreationDto | null;
  hasHydrated: boolean;
  setRoom: (room: MultiplayerRoomCreationDto) => void;
  updateRoom: (partial: Partial<MultiplayerRoomCreationDto>) => void;
  clearRoom: () => void;
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
