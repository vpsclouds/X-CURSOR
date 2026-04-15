import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  RefreshCw,
} from "lucide-react";
import { useFileStore, loadFileTree, type FileNode } from "../store/file-store";
import { useEditorStore } from "@/features/editor/store/editor-store";
import { getLanguageFromExtension, getFileExtension } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const FileTree: React.FC = () => {
  const { workspacePath, fileTree, isLoading, setWorkspacePath, setFileTree, setLoading, toggleDir, selectFile, selectedPath } =
    useFileStore();
  const { openFile } = useEditorStore();

  const loadTree = async (path: string) => {
    setLoading(true);
    const tree = await loadFileTree(path);
    setFileTree(tree);
  };

  useEffect(() => {
    if (!workspacePath) {
      // Load mock tree for demo
      const tree = loadFileTree("/workspace");
      tree.then(setFileTree);
    }
  }, []);

  const handleOpenFolder = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({ directory: true, multiple: false });
      if (typeof selected === "string") {
        setWorkspacePath(selected);
        loadTree(selected);
      }
    } catch {
      // Browser demo mode — set a fake path
      setWorkspacePath("/workspace");
    }
  };

  const handleFileClick = (node: FileNode) => {
    if (node.isDir) {
      toggleDir(node.path);
    } else {
      selectFile(node.path);
      openFile({
        id: node.path,
        path: node.path,
        name: node.name,
        language: getLanguageFromExtension(getFileExtension(node.name)),
        content: `// ${node.name}\n// This file is part of the X-CURSOR IDE demo\n`,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-xcursor-border shrink-0">
        <span className="text-editor-xs font-semibold text-xcursor-text uppercase tracking-widest">
          {workspacePath ? workspacePath.split("/").pop() || "Explorer" : "Explorer"}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleOpenFolder}
            className="p-0.5 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
            title="Open Folder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => workspacePath && loadTree(workspacePath)}
            className="p-0.5 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
            <Folder className="h-8 w-8 text-xcursor-text-muted opacity-50" />
            <p className="text-editor-xs text-xcursor-text-muted">
              No folder open
            </p>
            <button
              onClick={handleOpenFolder}
              className="text-editor-xs text-accent hover:underline"
            >
              Open Folder
            </button>
          </div>
        ) : (
          <FileTreeNodes
            nodes={fileTree}
            depth={0}
            onFileClick={handleFileClick}
            selectedPath={selectedPath}
          />
        )}
      </div>
    </div>
  );
};

// ── Recursive tree nodes ──────────────────────

interface FileTreeNodesProps {
  nodes: FileNode[];
  depth: number;
  onFileClick: (node: FileNode) => void;
  selectedPath: string | null;
}

const FileTreeNodes: React.FC<FileTreeNodesProps> = ({
  nodes,
  depth,
  onFileClick,
  selectedPath,
}) => {
  return (
    <>
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={depth}
          onFileClick={onFileClick}
          selectedPath={selectedPath}
        />
      ))}
    </>
  );
};

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  onFileClick: (node: FileNode) => void;
  selectedPath: string | null;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  onFileClick,
  selectedPath,
}) => {
  const isSelected = selectedPath === node.path;

  return (
    <>
      <div
        className={cn(
          "flex items-center h-6 cursor-pointer text-editor-sm group select-none",
          isSelected
            ? "bg-xcursor-selected text-xcursor-text"
            : "text-xcursor-text hover:bg-xcursor-hover"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => onFileClick(node)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Expand arrow */}
        <span className="w-4 shrink-0 flex items-center justify-center text-xcursor-text-muted">
          {node.isDir ? (
            node.isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : null}
        </span>

        {/* Icon */}
        <span className="mr-1.5 shrink-0">
          {node.isDir ? (
            node.isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 text-xcursor-warning" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-xcursor-warning" />
            )
          ) : (
            <FileIcon name={node.name} />
          )}
        </span>

        {/* Name */}
        <span className="truncate">{node.name}</span>
      </div>

      {/* Children */}
      {node.isDir && node.isExpanded && node.children && (
        <FileTreeNodes
          nodes={node.children}
          depth={depth + 1}
          onFileClick={onFileClick}
          selectedPath={selectedPath}
        />
      )}
    </>
  );
};

// ── File icon with color coding ───────────────

const FILE_ICON_COLORS: Record<string, string> = {
  ts: "text-blue-400",
  tsx: "text-blue-400",
  js: "text-yellow-400",
  jsx: "text-yellow-400",
  py: "text-green-400",
  rs: "text-orange-400",
  go: "text-cyan-400",
  css: "text-purple-400",
  scss: "text-purple-400",
  html: "text-red-400",
  htm: "text-red-400",
  json: "text-yellow-300",
  md: "text-gray-300",
  toml: "text-red-300",
  yaml: "text-red-300",
  yml: "text-red-300",
  sh: "text-green-300",
};

const FileIcon: React.FC<{ name: string }> = ({ name }) => {
  const ext = getFileExtension(name);
  const color = FILE_ICON_COLORS[ext] ?? "text-xcursor-text-muted";
  return <File className={cn("h-3.5 w-3.5", color)} />;
};
