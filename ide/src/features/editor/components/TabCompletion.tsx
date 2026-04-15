import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TabCompletionProps {
  suggestion?: string;
  onAccept?: () => void;
  onReject?: () => void;
  position?: { top: number; left: number };
  visible?: boolean;
}

/**
 * Cursor Tab style inline completion ghost text overlay.
 * In production this renders as ghost text inside CodeMirror,
 * but here we show a simplified floating preview.
 */
export const TabCompletion: React.FC<TabCompletionProps> = ({
  suggestion,
  onAccept,
  onReject,
  position,
  visible = false,
}) => {
  if (!visible || !suggestion) return null;

  return (
    <div
      className={cn(
        "absolute z-20 flex items-start gap-2 pointer-events-none",
        "animate-fade-in"
      )}
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      {/* Ghost text */}
      <span className="font-mono text-editor-sm text-xcursor-text-muted/60 whitespace-pre">
        {suggestion}
      </span>

      {/* Accept hint */}
      <span className="pointer-events-auto flex items-center gap-1 text-editor-xs text-xcursor-text-muted bg-xcursor-sidebar border border-xcursor-border rounded px-1.5 py-0.5 shadow">
        <kbd className="font-mono">Tab</kbd> to accept
        <button
          onClick={onReject}
          className="ml-1 text-xcursor-text-muted hover:text-xcursor-text"
        >
          ✕
        </button>
      </span>
    </div>
  );
};

// ── Demo hook for Tab completion state ────────

export function useTabCompletion() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const showSuggestion = (text: string) => {
    setSuggestion(text);
    setVisible(true);
  };

  const accept = () => {
    setVisible(false);
    setSuggestion(null);
  };

  const reject = () => {
    setVisible(false);
    setSuggestion(null);
  };

  return { suggestion, visible, showSuggestion, accept, reject };
}
