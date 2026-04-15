import React from "react";
import { X, SplitSquareHorizontal, Terminal } from "lucide-react";
import { useEditorStore } from "@/features/editor/store/editor-store";
import { cn } from "@/lib/utils";

interface TabBarProps {
  onToggleBottom?: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({ onToggleBottom }) => {
  const { tabs, activeTabId, closeTab, setActiveTab } = useEditorStore();

  return (
    <div className="flex items-center h-8 bg-xcursor-sidebar border-b border-xcursor-border shrink-0 overflow-x-auto scrollbar-none">
      {/* Tabs */}
      <div className="flex items-stretch h-full overflow-x-auto">
        {tabs.length === 0 ? (
          <div className="flex items-center px-3 text-editor-xs text-xcursor-text-muted">
            No files open
          </div>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center gap-1.5 px-3 h-full border-r border-xcursor-border cursor-pointer min-w-0 max-w-[180px] shrink-0 group",
                activeTabId === tab.id
                  ? "bg-xcursor-bg text-xcursor-text border-t-2 border-t-accent"
                  : "bg-xcursor-sidebar text-xcursor-text-muted hover:bg-xcursor-hover hover:text-xcursor-text"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <FileIcon language={tab.language} />
              <span className="text-editor-xs truncate flex-1">
                {tab.name}
                {tab.isDirty && (
                  <span className="ml-1 text-xcursor-warning">●</span>
                )}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-xcursor-text-muted hover:text-xcursor-text transition-opacity rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center px-1 gap-0.5 shrink-0">
        {onToggleBottom && (
          <button
            onClick={onToggleBottom}
            className="p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
            title="Toggle Terminal"
          >
            <Terminal className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          className="p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
          title="Split Editor"
        >
          <SplitSquareHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

// ── File type icon ────────────────────────────

const FILE_COLORS: Record<string, string> = {
  typescript: "text-blue-400",
  javascript: "text-yellow-400",
  python: "text-green-400",
  rust: "text-orange-400",
  go: "text-cyan-400",
  css: "text-purple-400",
  html: "text-red-400",
  json: "text-yellow-300",
  markdown: "text-gray-400",
  default: "text-xcursor-text-muted",
};

const FileIcon: React.FC<{ language?: string }> = ({ language }) => {
  const color = FILE_COLORS[language ?? ""] ?? FILE_COLORS.default;
  return (
    <span className={cn("text-[10px] font-mono font-bold", color)}>
      {getFileIconChar(language)}
    </span>
  );
};

function getFileIconChar(language?: string): string {
  const map: Record<string, string> = {
    typescript: "TS",
    javascript: "JS",
    python: "PY",
    rust: "RS",
    go: "GO",
    css: "CSS",
    html: "HTM",
    json: "{}",
    markdown: "MD",
  };
  return map[language ?? ""] ?? "TXT";
}
