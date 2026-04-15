import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalLine {
  type: "command" | "output" | "error" | "prompt";
  content: string;
}

/**
 * Simulated terminal — in production this would use xterm.js with Tauri PTY backend.
 */
export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: "X-CURSOR Terminal v0.1.0" },
    { type: "output", content: 'Type commands below. Use "ai: <task>" for AI command generation.' },
    { type: "output", content: "" },
  ]);
  const [input, setInput] = useState("");
  const [isGeneratingCmd, setIsGeneratingCmd] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const cwd = "/workspace";
  const prompt = `${cwd} $ `;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setHistoryIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const idx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(idx);
        setInput(history[history.length - 1 - idx] ?? "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const idx = historyIdx - 1;
        setHistoryIdx(idx);
        setInput(history[history.length - 1 - idx] ?? "");
      } else {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory((h) => [...h, trimmed]);
    setInput("");

    addLine({ type: "command", content: `${prompt}${trimmed}` });

    // AI command generation
    if (trimmed.startsWith("ai:")) {
      const task = trimmed.slice(3).trim();
      setIsGeneratingCmd(true);
      addLine({ type: "output", content: `[AI] Generating command for: ${task}` });

      // Simulate AI command generation
      await new Promise((r) => setTimeout(r, 800));
      const generatedCmd = generateCommand(task);
      addLine({ type: "output", content: `[AI] Suggested: ${generatedCmd}` });
      setInput(generatedCmd);
      setIsGeneratingCmd(false);
      return;
    }

    // Simulate basic commands
    const output = simulateCommand(trimmed);
    if (output) {
      output.forEach((line) => addLine(line));
    }
  };

  const addLine = (line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
  };

  return (
    <div
      className="flex flex-col h-full bg-xcursor-bg font-mono text-editor-xs"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal header */}
      <div className="flex items-center h-6 px-2 bg-xcursor-panel border-b border-xcursor-border shrink-0">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-xcursor-selected text-xcursor-text text-[10px]">
            bash
            <X className="h-2.5 w-2.5 text-xcursor-text-muted" />
          </button>
          <button className="p-0.5 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover">
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="flex-1" />
        <button
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xcursor-text-muted hover:text-accent transition-colors text-[10px]"
          title="Generate command with AI"
        >
          <Sparkles className="h-2.5 w-2.5" />
          AI
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-2 pb-0">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "leading-relaxed whitespace-pre-wrap",
              line.type === "command" && "text-xcursor-text",
              line.type === "output" && "text-xcursor-text-muted",
              line.type === "error" && "text-xcursor-error",
              line.type === "prompt" && "text-accent"
            )}
          >
            {line.content}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-0">
          <span className="text-accent shrink-0">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGeneratingCmd}
            className="flex-1 bg-transparent text-xcursor-text outline-none border-none caret-xcursor-text"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

// ── Command simulator ─────────────────────────

function simulateCommand(cmd: string): TerminalLine[] | null {
  const parts = cmd.split(/\s+/);
  const command = parts[0];

  switch (command) {
    case "ls":
    case "dir":
      return [
        { type: "output", content: "package.json   tsconfig.json  vite.config.ts  src/  src-tauri/" },
      ];
    case "pwd":
      return [{ type: "output", content: "/workspace" }];
    case "echo":
      return [{ type: "output", content: parts.slice(1).join(" ") }];
    case "node":
    case "npm":
    case "bun":
    case "cargo":
      return [{ type: "output", content: `[X-CURSOR] ${command} not available in demo mode` }];
    case "clear":
      return [];
    case "help":
      return [
        { type: "output", content: "Available commands: ls, pwd, echo, clear, help" },
        { type: "output", content: 'Use "ai: <task>" to generate commands with AI' },
      ];
    default:
      return [
        { type: "error", content: `${command}: command not found (demo mode)` },
      ];
  }
}

function generateCommand(task: string): string {
  const taskLower = task.toLowerCase();
  if (taskLower.includes("install")) return "npm install";
  if (taskLower.includes("build")) return "npm run build";
  if (taskLower.includes("test")) return "npm test";
  if (taskLower.includes("start") || taskLower.includes("dev")) return "npm run dev";
  if (taskLower.includes("list files")) return "ls -la";
  if (taskLower.includes("find")) return `find . -name "*.ts" -not -path "*/node_modules/*"`;
  if (taskLower.includes("git")) return "git status";
  return `echo "AI: ${task}"`;
}
