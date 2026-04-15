import React, { useState } from "react";
import { Bot, Play, Square, Trash2, Zap, ZapOff, Loader2 } from "lucide-react";
import { useAgentStore } from "../store/agent-store";
import { ToolExecution } from "./ToolExecution";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { cursorClient } from "@/lib/cursor-api/client";
import { generateId } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const AgentPanel: React.FC = () => {
  const {
    messages,
    isRunning,
    yoloMode,
    addMessage,
    updateMessage,
    setRunning,
    setYoloMode,
    clearMessages,
  } = useAgentStore();

  const { providerId, modelId } = useSettingsStore();
  const [goal, setGoal] = useState("");

  const handleRun = async () => {
    if (!goal.trim() || isRunning) return;
    setRunning(true);

    const userMsgId = addMessage({ role: "user", content: goal });

    const systemPrompt = `You are an autonomous coding agent. The user gives you a goal and you accomplish it by using tools.
Available tools: file_read, file_edit, terminal_command, web_search, code_search, create_file.

${yoloMode ? "YOLO MODE: Execute actions immediately without asking for confirmation." : "Ask for confirmation before making changes."}

Respond in JSON format: { "thought": "...", "action": { "tool": "...", "input": {...} }, "response": "..." }`;

    const assistantMsgId = addMessage({
      role: "assistant",
      content: "Analyzing task...",
      toolCalls: [],
    });

    try {
      const messages_for_api = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: goal },
      ];

      let fullResponse = "";
      for await (const delta of cursorClient.streamChat(
        messages_for_api,
        modelId,
        providerId
      )) {
        if (delta.type === "text" && delta.content) {
          fullResponse += delta.content;
          updateMessage(assistantMsgId, fullResponse);
        }
      }

      // Parse agent response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.response) {
            updateMessage(assistantMsgId, parsed.response);
          }
        } catch {
          // Use raw response
        }
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-xcursor-border shrink-0">
        <Bot className="h-3.5 w-3.5 text-accent" />
        <span className="text-editor-xs font-semibold text-xcursor-text">Agent</span>
        <div className="flex-1" />

        {/* YOLO toggle */}
        <button
          onClick={() => setYoloMode(!yoloMode)}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-editor-xs transition-colors border",
            yoloMode
              ? "bg-xcursor-error/20 text-xcursor-error border-xcursor-error/30"
              : "text-xcursor-text-muted border-xcursor-border hover:bg-xcursor-hover"
          )}
          title="YOLO Mode — execute without confirmation"
        >
          {yoloMode ? <Zap className="h-3 w-3" /> : <ZapOff className="h-3 w-3" />}
          YOLO
        </button>

        <button
          onClick={clearMessages}
          disabled={isRunning}
          className="p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover disabled:opacity-30 transition-colors"
          title="Clear"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Goal input */}
      <div className="px-3 py-2 border-b border-xcursor-border shrink-0">
        <div className="flex gap-2">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe what the agent should accomplish..."
            disabled={isRunning}
            rows={2}
            className="flex-1 bg-xcursor-input border border-xcursor-border rounded px-2 py-1.5 text-editor-sm text-xcursor-text placeholder:text-xcursor-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={isRunning ? () => setRunning(false) : handleRun}
              disabled={!goal.trim() && !isRunning}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded transition-colors",
                isRunning
                  ? "bg-xcursor-error/80 text-white hover:bg-xcursor-error"
                  : "bg-accent text-white hover:bg-accent-hover disabled:opacity-30"
              )}
              title={isRunning ? "Stop agent" : "Run agent"}
            >
              {isRunning ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {yoloMode && (
          <p className="mt-1.5 text-[10px] text-xcursor-error">
            ⚡ YOLO mode: agent will execute actions without confirmation
          </p>
        )}
      </div>

      {/* Messages / Tool calls */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Bot className="h-8 w-8 text-xcursor-text-muted opacity-30" />
            <p className="text-editor-xs text-xcursor-text-muted text-center">
              Describe a goal and the agent will accomplish it using tools
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1.5">
              {/* Message */}
              <div className={cn(
                "text-editor-sm px-3 py-2 rounded",
                msg.role === "user"
                  ? "bg-xcursor-selected/30 text-xcursor-text"
                  : "text-xcursor-text"
              )}>
                <div className="text-editor-xs text-xcursor-text-muted mb-1 font-medium">
                  {msg.role === "user" ? "You" : "Agent"}
                  {isRunning && msg.role === "assistant" && (
                    <Loader2 className="inline h-3 w-3 animate-spin ml-1.5 text-accent" />
                  )}
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>

              {/* Tool calls */}
              {msg.toolCalls?.map((tool) => (
                <ToolExecution key={tool.id} tool={tool} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
