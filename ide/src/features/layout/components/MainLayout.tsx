import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import { BottomPanel } from "./BottomPanel";
import { AIChatPanel } from "@/features/ai/components/AIChatPanel";
import { CodeEditor } from "@/features/editor/components/CodeEditor";
import { useEditorStore } from "@/features/editor/store/editor-store";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  onOpenSettings: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ onOpenSettings }) => {
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"files" | "git" | "search">("files");

  const { activeTabId, tabs } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex flex-col h-screen bg-xcursor-bg text-xcursor-text overflow-hidden select-none">
      {/* Title bar */}
      <TitleBar onToggleAI={() => setShowAIPanel((v) => !v)} onOpenSettings={onOpenSettings} />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left sidebar */}
          <Panel defaultSize={18} minSize={12} maxSize={35} className="flex flex-col">
            <Sidebar
              activeTab={sidebarTab}
              onTabChange={setSidebarTab}
              onOpenSettings={onOpenSettings}
            />
          </Panel>

          <PanelResizeHandle className="w-px bg-xcursor-border hover:bg-accent transition-colors" />

          {/* Editor area */}
          <Panel defaultSize={showAIPanel ? 55 : 82} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={showBottomPanel ? 70 : 100} minSize={30}>
                <div className="flex flex-col h-full">
                  <TabBar onToggleBottom={() => setShowBottomPanel((v) => !v)} />
                  <div className="flex-1 overflow-hidden">
                    {activeTab ? (
                      <CodeEditor
                        key={activeTab.id}
                        filePath={activeTab.path}
                        language={activeTab.language}
                      />
                    ) : (
                      <EmptyEditor />
                    )}
                  </div>
                </div>
              </Panel>

              {showBottomPanel && (
                <>
                  <PanelResizeHandle className="h-px bg-xcursor-border hover:bg-accent transition-colors" />
                  <Panel defaultSize={30} minSize={15} maxSize={60}>
                    <BottomPanel onClose={() => setShowBottomPanel(false)} />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {/* Right AI panel */}
          {showAIPanel && (
            <>
              <PanelResizeHandle className="w-px bg-xcursor-border hover:bg-accent transition-colors" />
              <Panel defaultSize={27} minSize={20} maxSize={50}>
                <AIChatPanel onClose={() => setShowAIPanel(false)} />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Status bar */}
      <StatusBar
        showAI={showAIPanel}
        showBottom={showBottomPanel}
        onToggleAI={() => setShowAIPanel((v) => !v)}
        onToggleBottom={() => setShowBottomPanel((v) => !v)}
        activeFile={activeTab?.path}
        language={activeTab?.language}
      />
    </div>
  );
};

// ── Title Bar ──────────────────────────────────

interface TitleBarProps {
  onToggleAI: () => void;
  onOpenSettings: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ onToggleAI, onOpenSettings }) => {
  return (
    <div className="flex items-center h-8 bg-xcursor-sidebar border-b border-xcursor-border px-2 gap-2 shrink-0">
      {/* App icon/name */}
      <div className="flex items-center gap-1.5 px-1">
        <XCursorLogo />
        <span className="text-editor-xs font-bold text-xcursor-text-bright tracking-wider">
          X-CURSOR
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons */}
      <button
        onClick={onToggleAI}
        className="text-editor-xs text-xcursor-text-muted hover:text-xcursor-text px-2 py-0.5 rounded hover:bg-xcursor-hover transition-colors"
        title="Toggle AI Panel"
      >
        AI
      </button>
      <button
        onClick={onOpenSettings}
        className="text-editor-xs text-xcursor-text-muted hover:text-xcursor-text px-2 py-0.5 rounded hover:bg-xcursor-hover transition-colors"
        title="Settings"
      >
        ⚙
      </button>
    </div>
  );
};

// ── X-CURSOR Logo ─────────────────────────────

const XCursorLogo: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-label="X-CURSOR"
  >
    <rect width="16" height="16" rx="3" fill="#007acc" />
    <path
      d="M3 4L6.5 8L3 12H5.5L8 9.2L10.5 12H13L9.5 8L13 4H10.5L8 6.8L5.5 4H3Z"
      fill="white"
    />
  </svg>
);

// ── Status Bar ────────────────────────────────

interface StatusBarProps {
  showAI: boolean;
  showBottom: boolean;
  onToggleAI: () => void;
  onToggleBottom: () => void;
  activeFile?: string;
  language?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  showAI,
  showBottom,
  onToggleAI,
  onToggleBottom,
  activeFile,
  language,
}) => {
  const fileName = activeFile?.split("/").pop() ?? activeFile?.split("\\").pop();

  return (
    <div className="flex items-center h-5 bg-accent text-white text-editor-xs px-2 gap-3 shrink-0">
      <span className="text-white/70">X-CURSOR</span>
      {fileName && (
        <span className="text-white/90 truncate max-w-[200px]">{fileName}</span>
      )}
      {language && (
        <span className="text-white/70 capitalize">{language}</span>
      )}
      <div className="flex-1" />
      <button
        onClick={onToggleBottom}
        className={cn(
          "px-1.5 py-0.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors",
          showBottom && "text-white bg-white/10"
        )}
      >
        Terminal
      </button>
      <button
        onClick={onToggleAI}
        className={cn(
          "px-1.5 py-0.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors",
          showAI && "text-white bg-white/10"
        )}
      >
        AI Chat
      </button>
    </div>
  );
};

// ── Empty Editor ──────────────────────────────

const EmptyEditor: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-xcursor-text-muted gap-4">
    <XCursorLogo />
    <div className="text-center">
      <p className="text-editor-base font-medium text-xcursor-text">Welcome to X-CURSOR</p>
      <p className="text-editor-sm mt-1">Open a file from the explorer or start a new chat</p>
    </div>
    <div className="flex flex-col gap-1.5 text-editor-xs text-xcursor-text-muted">
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 rounded border border-xcursor-border font-mono">⌘K</kbd>
        <span>Inline AI edit</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 rounded border border-xcursor-border font-mono">⌘I</kbd>
        <span>Open AI chat</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 rounded border border-xcursor-border font-mono">⌘P</kbd>
        <span>Quick open file</span>
      </div>
    </div>
  </div>
);
