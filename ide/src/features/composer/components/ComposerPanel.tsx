import React, { useState } from "react";
import { Sparkles, CheckCheck, XCircle, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useComposerStore } from "../store/composer-store";
import { FileDiff } from "./FileDiff";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { cursorClient } from "@/lib/cursor-api/client";
import { generateId } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const ComposerPanel: React.FC = () => {
  const {
    prompt,
    edits,
    isGenerating,
    planMode,
    explanation,
    setPrompt,
    setEdits,
    setGenerating,
    setPlanMode,
    setExplanation,
    acceptEdit,
    rejectEdit,
    acceptAll,
    rejectAll,
    clearEdits,
  } = useComposerStore();

  const { providerId, modelId } = useSettingsStore();
  const [localPrompt, setLocalPrompt] = useState(prompt);

  const handleGenerate = async () => {
    if (!localPrompt.trim() || isGenerating) return;
    setPrompt(localPrompt);
    setGenerating(true);
    clearEdits();

    try {
      const messages = [
        {
          role: "system" as const,
          content: `You are an AI code editor. The user will describe changes they want made to their code.
${planMode ? "First, output a plan of what you'll change, then output the edited files." : "Output the edited file content directly."}
Format your response as JSON: { "explanation": "...", "edits": [{ "filePath": "...", "content": "..." }] }`,
        },
        { role: "user" as const, content: localPrompt },
      ];

      let fullResponse = "";
      for await (const delta of cursorClient.streamChat(messages, modelId, providerId)) {
        if (delta.type === "text" && delta.content) {
          fullResponse += delta.content;
        }
      }

      // Try to parse JSON response
      try {
        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setExplanation(parsed.explanation ?? "");
          setEdits(
            (parsed.edits ?? []).map((e: { filePath: string; content: string }) => ({
              id: generateId(),
              filePath: e.filePath,
              originalContent: "",
              newContent: e.content,
              status: "pending" as const,
            }))
          );
        } else {
          // Fallback: treat as single file edit
          setEdits([{
            id: generateId(),
            filePath: "untitled.ts",
            originalContent: "",
            newContent: fullResponse,
            status: "pending" as const,
          }]);
          setExplanation("Generated code edit");
        }
      } catch {
        setExplanation(fullResponse);
      }
    } finally {
      setGenerating(false);
    }
  };

  const pendingCount = edits.filter((e) => e.status === "pending").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-xcursor-border shrink-0">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span className="text-editor-xs font-semibold text-xcursor-text">Composer</span>
        <div className="flex-1" />
        {/* Plan mode toggle */}
        <button
          onClick={() => setPlanMode(!planMode)}
          className="flex items-center gap-1 text-editor-xs text-xcursor-text-muted hover:text-xcursor-text transition-colors"
          title="Toggle Plan Mode"
        >
          {planMode ? (
            <ToggleRight className="h-3.5 w-3.5 text-accent" />
          ) : (
            <ToggleLeft className="h-3.5 w-3.5" />
          )}
          Plan
        </button>
      </div>

      {/* Prompt */}
      <div className="p-3 border-b border-xcursor-border shrink-0">
        <textarea
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="Describe the changes you want across your codebase..."
          className="w-full bg-xcursor-input border border-xcursor-border rounded px-2 py-1.5 text-editor-sm text-xcursor-text placeholder:text-xcursor-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-accent"
          rows={4}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !localPrompt.trim()}
          className="mt-2 flex items-center gap-1.5 w-full justify-center py-1.5 rounded bg-accent text-white text-editor-sm hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" /> Generate Changes</>
          )}
        </button>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="px-3 py-2 border-b border-xcursor-border bg-xcursor-panel/50">
          <p className="text-editor-xs text-xcursor-text-muted">{explanation}</p>
        </div>
      )}

      {/* Edits */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {edits.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Sparkles className="h-8 w-8 text-xcursor-text-muted opacity-30" />
            <p className="text-editor-xs text-xcursor-text-muted">
              Describe changes to generate file edits
            </p>
          </div>
        )}
        {edits.map((edit) => (
          <FileDiff
            key={edit.id}
            edit={edit}
            onAccept={acceptEdit}
            onReject={rejectEdit}
          />
        ))}
      </div>

      {/* Bulk actions */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-xcursor-border shrink-0">
          <span className="text-editor-xs text-xcursor-text-muted flex-1">
            {pendingCount} change{pendingCount !== 1 ? "s" : ""} pending
          </span>
          <button
            onClick={acceptAll}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-xcursor-success/20 text-xcursor-success hover:bg-xcursor-success/30 text-editor-xs"
          >
            <CheckCheck className="h-3 w-3" /> Accept All
          </button>
          <button
            onClick={rejectAll}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-xcursor-error/20 text-xcursor-error hover:bg-xcursor-error/30 text-editor-xs"
          >
            <XCircle className="h-3 w-3" /> Reject All
          </button>
        </div>
      )}
    </div>
  );
};
