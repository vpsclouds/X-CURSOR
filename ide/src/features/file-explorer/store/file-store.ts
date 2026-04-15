import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getLanguageFromExtension, getFileExtension } from "@/lib/utils";

export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FileStore {
  workspacePath: string | null;
  fileTree: FileNode[];
  selectedPath: string | null;
  isLoading: boolean;

  // Actions
  setWorkspacePath: (path: string) => void;
  setFileTree: (tree: FileNode[]) => void;
  toggleDir: (path: string) => void;
  selectFile: (path: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useFileStore = create<FileStore>()(
  immer((set) => ({
    workspacePath: null,
    fileTree: [],
    selectedPath: null,
    isLoading: false,

    setWorkspacePath: (path) =>
      set((state) => {
        state.workspacePath = path;
      }),

    setFileTree: (tree) =>
      set((state) => {
        state.fileTree = tree;
        state.isLoading = false;
      }),

    toggleDir: (path) =>
      set((state) => {
        const toggle = (nodes: FileNode[]) => {
          for (const node of nodes) {
            if (node.path === path && node.isDir) {
              node.isExpanded = !node.isExpanded;
              return;
            }
            if (node.children) toggle(node.children);
          }
        };
        toggle(state.fileTree);
      }),

    selectFile: (path) =>
      set((state) => {
        state.selectedPath = path;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),
  }))
);

// ── File loading helpers ──────────────────────

export async function loadFileTree(workspacePath: string): Promise<FileNode[]> {
  // Try Tauri IPC if available, otherwise return empty
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const entries = await invoke<FileNode[]>("read_dir_recursive", {
      path: workspacePath,
      depth: 3,
    });
    return entries;
  } catch {
    // Tauri not available (browser mode) — return mock data
    return getMockFileTree();
  }
}

function getMockFileTree(): FileNode[] {
  return [
    {
      name: "src",
      path: "/workspace/src",
      isDir: true,
      isExpanded: true,
      children: [
        {
          name: "main.tsx",
          path: "/workspace/src/main.tsx",
          isDir: false,
        },
        {
          name: "App.tsx",
          path: "/workspace/src/App.tsx",
          isDir: false,
        },
        {
          name: "features",
          path: "/workspace/src/features",
          isDir: true,
          children: [],
        },
      ],
    },
    {
      name: "package.json",
      path: "/workspace/package.json",
      isDir: false,
    },
    {
      name: "tsconfig.json",
      path: "/workspace/tsconfig.json",
      isDir: false,
    },
    {
      name: "README.md",
      path: "/workspace/README.md",
      isDir: false,
    },
  ];
}

export function getFileLanguage(filePath: string): string {
  const ext = getFileExtension(filePath);
  return getLanguageFromExtension(ext);
}
