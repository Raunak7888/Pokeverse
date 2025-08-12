import { create } from "zustand";
import { Client } from "@stomp/stompjs";

interface WebSocketState {
  client: Client | null;
  setClient: (client: Client) => void;
  disconnect: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  client: null,
  setClient: (client) => set({ client }),
  disconnect: () => {
    set((state) => {
      if (state.client?.connected) {
        state.client.deactivate();
      }
      return { client: null };
    });
  },
}));
