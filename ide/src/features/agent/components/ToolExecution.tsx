import React, { useState } from "react";
import {
  FileText,
  Edit3,
  Terminal,
  Globe,
  Code2,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { AgentToolCall } from "@/lib/cursor-api/types";
import { cn } from "@/lib/utils";

interface ToolExecutionProps {
  tool: AgentToolCall;
}

const TOOL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  file_read: FileText,
  file_edit: Edit3,
  terminal_command: Terminal,
  web_search: Globe,
  code_search: Code2,
  create_file: Plus,
  delete_file: Trash2,
};

const TOOL_LABELS: Record<string, string> = {
  file_read: "Read file",
  file_edit: "Edit file",
  terminal_command: "Run command",
  web_search: "Web search",
  code_search: "Search code",
  create_file: "Create file",
  delete_file: "Delete file",
};

export const ToolExecution: React.FC<ToolExecutionProps> = ({ tool }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = TOOL_ICONS[tool.tool] ?? Code2;
  const label = TOOL_LABELS[tool.tool] ?? tool.tool;

  const statusIconMap: Record<string, React.ReactNode> = {
    pending: <Loader2 className="h-3 w-3 text-xcursor-text-muted animate-spin" />,
    running: <Loader2 className="h-3 w-3 text-accent animate-spin" />,
    completed: <CheckCircle2 className="h-3 w-3 text-xcursor-success" />,
    error: <XCircle className="h-3 w-3 text-xcursor-error" />,
  };
  const statusIcon = statusIconMap[tool.status];

  const inputStr = typeof tool.input === "object"
    ? JSON.stringify(tool.input, null, 2)
    : String(tool.input);

  return (
    <div className={cn(
      "rounded border overflow-hidden text-editor-xs",
      tool.status === "error" ? "border-xcursor-error/30" : "border-xcursor-border",
    )}>
      <div
        className="flex items-center gap-2 px-2 py-1.5 bg-xcursor-panel cursor-pointer hover:bg-xcursor-hover"
        onClick={() => setExpanded((v) => !v)}
      >
        {statusIcon}
        <Icon className="h-3 w-3 text-xcursor-text-muted" />
        <span className="text-xcursor-text font-medium">{label}</span>
        {tool.input.path != null && (
          <span className="text-xcursor-text-muted font-mono truncate flex-1">
            {String(tool.input.path as string)}
          </span>
        )}
        <button className="text-xcursor-text-muted ml-auto">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-xcursor-border">
          {/* Input */}
          <div className="px-2 py-1.5 bg-xcursor-bg font-mono text-xcursor-text-muted whitespace-pre-wrap max-h-32 overflow-y-auto">
            {inputStr}
          </div>

          {/* Output */}
          {tool.output && (
            <div className={cn(
              "px-2 py-1.5 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto border-t border-xcursor-border",
              tool.status === "error"
                ? "text-xcursor-error bg-xcursor-error/5"
                : "text-xcursor-success bg-xcursor-success/5"
            )}>
              {tool.output}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
