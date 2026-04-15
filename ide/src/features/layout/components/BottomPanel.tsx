import React, { useState } from "react";
import { X } from "lucide-react";
import { Terminal } from "@/features/terminal/components/Terminal";
import { cn } from "@/lib/utils";

type BottomTab = "terminal" | "output" | "problems";

interface BottomPanelProps {
  onClose: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<BottomTab>("terminal");

  const tabs: { id: BottomTab; label: string; badge?: number }[] = [
    { id: "terminal", label: "Terminal" },
    { id: "output", label: "Output" },
    { id: "problems", label: "Problems", badge: 0 },
  ];

  return (
    <div className="flex flex-col h-full bg-xcursor-bg border-t border-xcursor-border">
      {/* Tab bar */}
      <div className="flex items-center h-7 bg-xcursor-sidebar border-b border-xcursor-border px-1 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1 px-3 h-full text-editor-xs font-medium transition-colors",
              activeTab === tab.id
                ? "text-xcursor-text border-b-2 border-accent"
                : "text-xcursor-text-muted hover:text-xcursor-text"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 px-1 rounded bg-xcursor-error text-white text-[9px] font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "terminal" && <Terminal />}
        {activeTab === "output" && <OutputPanel />}
        {activeTab === "problems" && <ProblemsPanel />}
      </div>
    </div>
  );
};

const OutputPanel: React.FC = () => (
  <div className="h-full p-3 font-mono text-editor-xs text-xcursor-text-muted">
    <p>[X-CURSOR] Output panel ready</p>
  </div>
);

const ProblemsPanel: React.FC = () => (
  <div className="h-full flex items-center justify-center">
    <p className="text-editor-xs text-xcursor-text-muted">No problems detected</p>
  </div>
);
