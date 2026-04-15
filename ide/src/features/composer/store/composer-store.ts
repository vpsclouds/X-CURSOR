import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface FileEdit {
  id: string;
  filePath: string;
  originalContent: string;
  newContent: string;
  status: "pending" | "accepted" | "rejected";
}

interface ComposerStore {
  prompt: string;
  edits: FileEdit[];
  isGenerating: boolean;
  planMode: boolean;
  explanation: string;

  setPrompt: (prompt: string) => void;
  setEdits: (edits: FileEdit[]) => void;
  acceptEdit: (id: string) => void;
  rejectEdit: (id: string) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  setGenerating: (v: boolean) => void;
  setPlanMode: (v: boolean) => void;
  setExplanation: (v: string) => void;
  clearEdits: () => void;
}

export const useComposerStore = create<ComposerStore>()(
  immer((set) => ({
    prompt: "",
    edits: [],
    isGenerating: false,
    planMode: false,
    explanation: "",

    setPrompt: (prompt) => set((s) => { s.prompt = prompt; }),
    setEdits: (edits) => set((s) => { s.edits = edits; }),
    acceptEdit: (id) =>
      set((s) => {
        const e = s.edits.find((e) => e.id === id);
        if (e) e.status = "accepted";
      }),
    rejectEdit: (id) =>
      set((s) => {
        const e = s.edits.find((e) => e.id === id);
        if (e) e.status = "rejected";
      }),
    acceptAll: () =>
      set((s) => {
        s.edits.forEach((e) => { if (e.status === "pending") e.status = "accepted"; });
      }),
    rejectAll: () =>
      set((s) => {
        s.edits.forEach((e) => { if (e.status === "pending") e.status = "rejected"; });
      }),
    setGenerating: (v) => set((s) => { s.isGenerating = v; }),
    setPlanMode: (v) => set((s) => { s.planMode = v; }),
    setExplanation: (v) => set((s) => { s.explanation = v; }),
    clearEdits: () => set((s) => { s.edits = []; s.explanation = ""; }),
  }))
);
