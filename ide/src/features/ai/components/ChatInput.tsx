import React, { useRef, useEffect, useState } from "react";
import { Send, Square, Paperclip, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStop,
  isGenerating = false,
  disabled = false,
  placeholder = "Ask anything, @ to mention files...",
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || (isGenerating && !onStop)) return;

    if (isGenerating) {
      onStop?.();
      return;
    }

    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="border-t border-xcursor-border p-2 bg-xcursor-panel shrink-0">
      <div className={cn(
        "flex flex-col rounded-lg border border-xcursor-border bg-xcursor-input overflow-hidden transition-colors",
        !disabled && "focus-within:border-accent/50"
      )}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isGenerating}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none bg-transparent px-3 pt-2 pb-1 text-editor-sm text-xcursor-text placeholder:text-xcursor-text-muted focus:outline-none disabled:opacity-50 min-h-[36px]"
          style={{ maxHeight: "200px" }}
        />

        {/* Actions bar */}
        <div className="flex items-center gap-1 px-2 py-1.5">
          <button
            disabled={disabled}
            className="p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors disabled:opacity-30"
            title="Attach file"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={disabled}
            className="p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors disabled:opacity-30"
            title="Mention file or symbol"
          >
            <AtSign className="h-3.5 w-3.5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5">
            <span className="text-editor-xs text-xcursor-text-muted">
              {isGenerating ? (
                "Generating..."
              ) : (
                <span className="opacity-50">
                  <kbd className="font-mono">⏎</kbd> send · <kbd className="font-mono">⇧⏎</kbd> newline
                </span>
              )}
            </span>

            <button
              onClick={handleSend}
              disabled={disabled || (!value.trim() && !isGenerating)}
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded transition-colors",
                isGenerating
                  ? "bg-xcursor-error/80 text-white hover:bg-xcursor-error"
                  : "bg-accent text-white hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed"
              )}
              title={isGenerating ? "Stop" : "Send"}
            >
              {isGenerating ? (
                <Square className="h-3 w-3" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
