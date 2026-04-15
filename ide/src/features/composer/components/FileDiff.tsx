import React, { useState } from "react";
import { Check, X, ChevronDown, ChevronRight } from "lucide-react";
import type { FileEdit } from "../store/composer-store";
import { cn } from "@/lib/utils";

interface FileDiffProps {
  edit: FileEdit;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export const FileDiff: React.FC<FileDiffProps> = ({ edit, onAccept, onReject }) => {
  const [expanded, setExpanded] = useState(true);
  const fileName = edit.filePath.split("/").pop() ?? edit.filePath;

  const statusColor = {
    pending: "text-xcursor-warning",
    accepted: "text-xcursor-success",
    rejected: "text-xcursor-error",
  }[edit.status];

  // Simple line-by-line diff
  const originalLines = edit.originalContent.split("\n");
  const newLines = edit.newContent.split("\n");

  return (
    <div className={cn(
      "rounded border overflow-hidden",
      edit.status === "pending" && "border-xcursor-border",
      edit.status === "accepted" && "border-xcursor-success/30",
      edit.status === "rejected" && "border-xcursor-error/30 opacity-50",
    )}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 bg-xcursor-panel cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <button className="text-xcursor-text-muted">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        <span className="text-editor-xs font-mono text-xcursor-text truncate flex-1">
          {fileName}
        </span>
        <span className={cn("text-editor-xs font-medium", statusColor)}>
          {edit.status}
        </span>
        {edit.status === "pending" && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onAccept(edit.id); }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-xcursor-success/20 text-xcursor-success hover:bg-xcursor-success/30 text-editor-xs"
            >
              <Check className="h-2.5 w-2.5" /> Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onReject(edit.id); }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-xcursor-error/20 text-xcursor-error hover:bg-xcursor-error/30 text-editor-xs"
            >
              <X className="h-2.5 w-2.5" /> Reject
            </button>
          </div>
        )}
      </div>

      {/* Diff body */}
      {expanded && (
        <div className="font-mono text-[11px] overflow-x-auto bg-xcursor-bg max-h-64 overflow-y-auto">
          {newLines.map((line, i) => {
            const isAdded = i >= originalLines.length || line !== originalLines[i];
            const isRemoved = i < originalLines.length && line !== originalLines[i];
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start px-3 py-0.5",
                  isAdded && "bg-xcursor-success/10 text-xcursor-success",
                  isRemoved && "bg-xcursor-error/10 text-xcursor-error",
                  !isAdded && !isRemoved && "text-xcursor-text-muted"
                )}
              >
                <span className="w-6 text-right shrink-0 select-none opacity-50 mr-3">
                  {i + 1}
                </span>
                <span className="w-3 shrink-0 select-none">
                  {isAdded ? "+" : isRemoved ? "-" : " "}
                </span>
                <span className="whitespace-pre">{line}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
