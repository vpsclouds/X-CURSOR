import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
}

interface EditorStore {
  tabs: EditorTab[];
  activeTabId: string | null;

  // Actions
  openFile: (tab: Omit<EditorTab, "isDirty">) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  saveTab: (id: string) => void;
}

export const useEditorStore = create<EditorStore>()(
  immer((set) => ({
    tabs: [],
    activeTabId: null,

    openFile: (tab) =>
      set((state) => {
        const existing = state.tabs.find((t) => t.path === tab.path);
        if (existing) {
          state.activeTabId = existing.id;
        } else {
          state.tabs.push({ ...tab, isDirty: false });
          state.activeTabId = tab.id;
        }
      }),

    closeTab: (id) =>
      set((state) => {
        const idx = state.tabs.findIndex((t) => t.id === id);
        if (idx === -1) return;
        state.tabs.splice(idx, 1);
        if (state.activeTabId === id) {
          state.activeTabId =
            state.tabs[Math.max(0, idx - 1)]?.id ?? state.tabs[0]?.id ?? null;
        }
      }),

    setActiveTab: (id) =>
      set((state) => {
        if (state.tabs.find((t) => t.id === id)) {
          state.activeTabId = id;
        }
      }),

    updateContent: (id, content) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === id);
        if (tab) {
          tab.content = content;
          tab.isDirty = true;
        }
      }),

    saveTab: (id) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === id);
        if (tab) {
          tab.isDirty = false;
        }
      }),
  }))
);
