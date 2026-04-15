import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { generateId } from "@/lib/utils";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessageItem[];
  createdAt: number;
  updatedAt: number;
}

interface AIChatStore {
  chats: Chat[];
  currentChatId: string | null;
  streamingMessageId: string | null;
  isGenerating: boolean;

  // Actions
  createChat: () => string;
  deleteChat: (id: string) => void;
  setCurrentChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<ChatMessageItem, "id" | "timestamp">) => string;
  updateMessage: (chatId: string, messageId: string, content: string, done?: boolean) => void;
  setStreamingMessage: (messageId: string | null) => void;
  setGenerating: (generating: boolean) => void;
  clearChat: (chatId: string) => void;
}

export const useAIChatStore = create<AIChatStore>()(
  persist(
    immer((set, get) => ({
      chats: [],
      currentChatId: null,
      streamingMessageId: null,
      isGenerating: false,

      createChat: () => {
        const id = generateId();
        set((state) => {
          state.chats.unshift({
            id,
            title: "New Chat",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          state.currentChatId = id;
        });
        return id;
      },

      deleteChat: (id) =>
        set((state) => {
          const idx = state.chats.findIndex((c) => c.id === id);
          if (idx !== -1) state.chats.splice(idx, 1);
          if (state.currentChatId === id) {
            state.currentChatId = state.chats[0]?.id ?? null;
          }
        }),

      setCurrentChat: (id) =>
        set((state) => {
          state.currentChatId = id;
        }),

      addMessage: (chatId, message) => {
        const id = generateId();
        set((state) => {
          const chat = state.chats.find((c) => c.id === chatId);
          if (chat) {
            chat.messages.push({ ...message, id, timestamp: Date.now() });
            chat.updatedAt = Date.now();
            // Auto-title from first user message
            if (chat.title === "New Chat" && message.role === "user") {
              chat.title = message.content.slice(0, 40) + (message.content.length > 40 ? "…" : "");
            }
          }
        });
        return id;
      },

      updateMessage: (chatId, messageId, content, done = false) =>
        set((state) => {
          const chat = state.chats.find((c) => c.id === chatId);
          if (chat) {
            const msg = chat.messages.find((m) => m.id === messageId);
            if (msg) {
              msg.content = content;
              if (done) msg.isStreaming = false;
            }
          }
        }),

      setStreamingMessage: (messageId) =>
        set((state) => {
          state.streamingMessageId = messageId;
        }),

      setGenerating: (generating) =>
        set((state) => {
          state.isGenerating = generating;
        }),

      clearChat: (chatId) =>
        set((state) => {
          const chat = state.chats.find((c) => c.id === chatId);
          if (chat) {
            chat.messages = [];
            chat.title = "New Chat";
          }
        }),
    })),
    {
      name: "xcursor-chats",
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
      }),
    }
  )
);
