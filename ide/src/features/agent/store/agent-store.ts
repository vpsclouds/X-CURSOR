import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { AgentMessage, AgentToolCall } from "@/lib/cursor-api/types";
import { generateId } from "@/lib/utils";

interface AgentStore {
  messages: AgentMessage[];
  isRunning: boolean;
  yoloMode: boolean;
  currentToolCall: AgentToolCall | null;

  addMessage: (msg: Omit<AgentMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, content: string) => void;
  addToolCall: (msgId: string, tool: AgentToolCall) => void;
  updateToolCall: (msgId: string, toolId: string, output: string, status: AgentToolCall["status"]) => void;
  setRunning: (v: boolean) => void;
  setYoloMode: (v: boolean) => void;
  setCurrentToolCall: (tool: AgentToolCall | null) => void;
  clearMessages: () => void;
}

export const useAgentStore = create<AgentStore>()(
  immer((set) => ({
    messages: [],
    isRunning: false,
    yoloMode: false,
    currentToolCall: null,

    addMessage: (msg) => {
      const id = generateId();
      set((s) => {
        s.messages.push({ ...msg, id, timestamp: Date.now() });
      });
      return id;
    },

    updateMessage: (id, content) =>
      set((s) => {
        const msg = s.messages.find((m) => m.id === id);
        if (msg) msg.content = content;
      }),

    addToolCall: (msgId, tool) =>
      set((s) => {
        const msg = s.messages.find((m) => m.id === msgId);
        if (msg) {
          if (!msg.toolCalls) msg.toolCalls = [];
          msg.toolCalls.push(tool);
        }
      }),

    updateToolCall: (msgId, toolId, output, status) =>
      set((s) => {
        const msg = s.messages.find((m) => m.id === msgId);
        const tool = msg?.toolCalls?.find((t) => t.id === toolId);
        if (tool) {
          tool.output = output;
          tool.status = status;
          if (status === "completed" || status === "error") {
            tool.completedAt = Date.now();
          }
        }
      }),

    setRunning: (v) => set((s) => { s.isRunning = v; }),
    setYoloMode: (v) => set((s) => { s.yoloMode = v; }),
    setCurrentToolCall: (tool) => set((s) => { s.currentToolCall = tool; }),
    clearMessages: () => set((s) => { s.messages = []; }),
  }))
);
