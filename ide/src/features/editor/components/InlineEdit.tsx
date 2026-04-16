import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { cursorClient } from "@/lib/cursor-api/client";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { useEditorStore } from "../store/editor-store";

/**
 * Cmd+K / Inline Edit widget — appears within the editor for quick AI edits.
 */
export const InlineEdit: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { providerId, modelId } = useSettingsStore();
  const { activeTabId, updateContent } = useEditorStore();

  // Listen for Cmd+K — prefer the editor's custom event (fired from CodeMirror keymap)
  // so it only triggers when the editor is focused, avoiding conflicts.
  useEffect(() => {
    const openHandler = () => {
      setIsOpen((v) => !v);
      setResponse(null);
      setPrompt("");
    };

    const keyHandler = (e: KeyboardEvent) => {
      // Only handle Cmd+K from the window listener when the editor DOM is NOT focused
      // (e.g. when focus is on the terminal, sidebar, etc.)
      const editorEl = document.querySelector(".cm-editor");
      const isEditorFocused = editorEl ? editorEl.contains(document.activeElement) : false;

      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !isEditorFocused) {
        e.preventDefault();
        openHandler();
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("xcursor:inline-edit-open" as keyof WindowEventMap, openHandler);
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("xcursor:inline-edit-open" as keyof WindowEventMap, openHandler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setResponse("");

    try {
      const messages = [
        { role: "system" as const, content: "You are an expert code assistant. Respond with the edited code only — no explanation, no markdown fences." },
        { role: "user" as const, content: prompt },
      ];

      for await (const delta of cursorClient.streamChat(messages, modelId, providerId)) {
        if (delta.type === "text" && delta.content) {
          setResponse((prev) => (prev ?? "") + delta.content);
        } else if (delta.type === "error") {
          setResponse(`Error: ${delta.error}`);
          break;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (response && activeTabId) {
      updateContent(activeTabId, response);
    }
    setIsOpen(false);
    setResponse(null);
    setPrompt("");
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-fade-in">
      <div className="bg-xcursor-sidebar border border-xcursor-border rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-xcursor-border bg-xcursor-panel">
          <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="text-editor-xs font-medium text-xcursor-text">
            Inline Edit (⌘K)
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setIsOpen(false)}
            className="text-xcursor-text-muted hover:text-xcursor-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the edit you want..."
            disabled={isLoading}
            className="w-full bg-transparent text-editor-sm text-xcursor-text placeholder:text-xcursor-text-muted focus:outline-none"
          />
        </form>

        {/* Response */}
        {response !== null && (
          <div className="border-t border-xcursor-border">
            <div className="px-3 py-2 font-mono text-editor-xs text-xcursor-text bg-xcursor-bg max-h-48 overflow-y-auto whitespace-pre-wrap">
              {response}
              {isLoading && (
                <span className="inline-block w-1.5 h-3 bg-xcursor-text animate-blink ml-0.5" />
              )}
            </div>
            {!isLoading && response && (
              <div className="flex items-center gap-2 px-3 py-2 border-t border-xcursor-border">
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-white text-editor-xs hover:bg-accent-hover"
                >
                  <Check className="h-3 w-3" /> Accept
                </button>
                <button
                  onClick={() => { setResponse(null); inputRef.current?.focus(); }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xcursor-text-muted hover:text-xcursor-text text-editor-xs border border-xcursor-border"
                >
                  <X className="h-3 w-3" /> Discard
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        {response === null && (
          <div className="flex items-center gap-2 px-3 py-1.5 border-t border-xcursor-border">
            <span className="text-editor-xs text-xcursor-text-muted">
              <kbd className="px-1 border border-xcursor-border rounded font-mono">Enter</kbd> to generate
              · <kbd className="px-1 border border-xcursor-border rounded font-mono">Esc</kbd> to cancel
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
