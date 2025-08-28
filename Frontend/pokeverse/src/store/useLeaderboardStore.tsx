import { create } from "zustand";
import { Player, Room } from "@/utils/types";

interface LeaderboardState {
  players: Player[];
  room: Room | null;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  updatePlayerScore: (id: string | number, newScore: number) => void;
  applyAnswerResult: (id: string | number, score: number) => void;
  setRoom: (room: Room) => void;
  reset: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  players: [],
  room: null,

  setPlayers: (players) => {
    localStorage.setItem("players", JSON.stringify(players));
    set({ players });
  },

  addPlayer: (player) => {
    const updatedPlayers = [...get().players, player];
    localStorage.setItem("players", JSON.stringify(updatedPlayers));
    set({ players: updatedPlayers });
  },

  updatePlayer: (player) => {
    const updatedPlayers = get().players.map((p) =>
      String(p.id) === String(player.id) ? { ...p, ...player } : p
    );
    localStorage.setItem("players", JSON.stringify(updatedPlayers));
    set({ players: updatedPlayers });
  },

  updatePlayerScore: (id, newScore) => {
    const updatedPlayers = get().players.map((p) =>
      String(p.id) === String(id) ? { ...p, score: newScore } : p
    );
    localStorage.setItem("players", JSON.stringify(updatedPlayers));
    set({ players: updatedPlayers });
  },

  /** 🔹 Apply WS answer result */
  applyAnswerResult: (id, score) => {
    // Optional: Uncomment for debugging
    const updatedPlayers = get().players.map((p) =>
      String(p.id) === String(id)
        ? { ...p, score }
        : p
    );

    localStorage.setItem("players", JSON.stringify(updatedPlayers));
    set({ players: updatedPlayers });
  },

  setRoom: (room) => {
    localStorage.setItem("room", JSON.stringify(room));
    set({ room });
  },

  reset: () => {
    localStorage.removeItem("players");
    localStorage.removeItem("room");
    set({ players: [], room: null });
  },
}));
