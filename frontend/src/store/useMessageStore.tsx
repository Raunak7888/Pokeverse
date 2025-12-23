// src/store/useChatStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MessageStatus = "sending" | "sent" | "failed";

export interface ChatMessage {
    id: number | string;
    userId: number;
    user: string;
    text: string;
    timestamp: Date;
    isSystem: boolean;
    status: MessageStatus;
    tempId?: number;
}

interface ChatStore {
    messages: ChatMessage[];
    loadMessages: (initialMessages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    updateMessageStatus: (
        tempId: number,
        newStatus: MessageStatus,
        serverId?: number | string
    ) => void;
    clearMessages: () => void;
}

// ✅ Persist chat messages to localStorage
export const useChatStore = create<ChatStore>()(
    persist(
        (set) => ({
            messages: [],

            loadMessages: (initialMessages) =>
                set({ messages: initialMessages }),

            addMessage: (message) =>
                set((state) => ({
                    messages: [...state.messages, message],
                })),

            updateMessageStatus: (tempId, newStatus, serverId) =>
                set((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.tempId === tempId || msg.id === tempId
                            ? {
                                    ...msg,
                                    id: serverId || msg.id,
                                    status: newStatus,
                                }
                            : msg
                    ),
                })),

            clearMessages: () => set({ messages: [] }),
        }),
        {
            name: "chat-storage", // 🧠 localStorage key
            partialize: (state) => ({ messages: state.messages }), // Only persist messages
            version: 1,
        }
    )
);
