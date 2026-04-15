import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AI_PROVIDERS } from "@/lib/cursor-api/types";

interface SettingsStore {
  // AI
  providerId: string;
  modelId: string;
  apiKeys: Record<string, string>;

  // Editor
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  formatOnSave: boolean;

  // Theme
  theme: "dark" | "light";

  // Features
  enableTabCompletion: boolean;
  enableInlineEdit: boolean;
  yoloMode: boolean;
  planMode: boolean;

  // Actions
  setProvider: (providerId: string) => void;
  setModel: (modelId: string) => void;
  setApiKey: (providerId: string, key: string) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleYoloMode: () => void;
  togglePlanMode: () => void;
  toggleTabCompletion: () => void;
  updateSettings: (partial: Partial<Omit<SettingsStore, "setProvider" | "setModel" | "setApiKey" | "setFontSize" | "setTheme" | "toggleYoloMode" | "togglePlanMode" | "toggleTabCompletion" | "updateSettings">>) => void;
}

const defaultProvider = AI_PROVIDERS[1]; // openai

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({
      // AI
      providerId: defaultProvider.id,
      modelId: defaultProvider.defaultModel,
      apiKeys: {},

      // Editor
      fontSize: 13,
      fontFamily: "JetBrains Mono",
      tabSize: 2,
      wordWrap: false,
      lineNumbers: true,
      minimap: false,
      formatOnSave: false,

      // Theme
      theme: "dark",

      // Features
      enableTabCompletion: true,
      enableInlineEdit: true,
      yoloMode: false,
      planMode: false,

      // Actions
      setProvider: (providerId) =>
        set((state) => {
          state.providerId = providerId;
          const provider = AI_PROVIDERS.find((p) => p.id === providerId);
          if (provider) state.modelId = provider.defaultModel;
        }),

      setModel: (modelId) =>
        set((state) => {
          state.modelId = modelId;
        }),

      setApiKey: (providerId, key) =>
        set((state) => {
          state.apiKeys[providerId] = key;
        }),

      setFontSize: (size) =>
        set((state) => {
          state.fontSize = size;
        }),

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
        }),

      toggleYoloMode: () =>
        set((state) => {
          state.yoloMode = !state.yoloMode;
        }),

      togglePlanMode: () =>
        set((state) => {
          state.planMode = !state.planMode;
        }),

      toggleTabCompletion: () =>
        set((state) => {
          state.enableTabCompletion = !state.enableTabCompletion;
        }),

      updateSettings: (partial) =>
        set((state) => {
          Object.assign(state, partial);
        }),
    })),
    {
      name: "xcursor-settings",
    }
  )
);
