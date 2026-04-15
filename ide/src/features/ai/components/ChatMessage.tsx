import React from "react";
import { User, Bot, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessageItem } from "../store/ai-chat-store";

interface ChatMessageProps {
  message: ChatMessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-3 hover:bg-xcursor-hover/50 transition-colors",
        isUser && "bg-xcursor-selected/20"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5",
          isUser
            ? "bg-xcursor-input text-xcursor-text-muted"
            : "bg-accent/20 text-accent"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-editor-xs font-semibold text-xcursor-text-muted">
            {isUser ? "You" : "AI"}
          </span>
          <span className="text-[10px] text-xcursor-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message text */}
        <div className="text-editor-sm text-xcursor-text leading-relaxed">
          <MessageContent
            content={message.content}
            isStreaming={message.isStreaming}
          />
        </div>
      </div>

      {/* Copy button */}
      <button
        onClick={copyContent}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover shrink-0 self-start mt-0.5"
        title="Copy"
      >
        {copied ? (
          <Check className="h-3 w-3 text-xcursor-success" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
};

// ── Message content renderer ──────────────────

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ content, isStreaming }) => {
  if (!content && isStreaming) {
    return <span className="inline-block w-2 h-3.5 bg-xcursor-text-muted animate-blink" />;
  }

  // Simple code block rendering
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const lines = part.slice(3).split("\n");
          const lang = lines[0].trim();
          const code = lines.slice(1, -1).join("\n");
          return (
            <CodeBlock key={i} language={lang} code={code} />
          );
        }

        // Handle inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <span key={i}>
            {inlineParts.map((ip, j) =>
              ip.startsWith("`") && ip.endsWith("`") ? (
                <code
                  key={j}
                  className="px-1 py-0.5 rounded bg-xcursor-input font-mono text-xcursor-success text-[12px]"
                >
                  {ip.slice(1, -1)}
                </code>
              ) : (
                <span key={j} className="whitespace-pre-wrap">{ip}</span>
              )
            )}
          </span>
        );
      })}
      {isStreaming && content && (
        <span className="inline-block w-2 h-3.5 bg-xcursor-text-muted animate-blink ml-0.5" />
      )}
    </>
  );
};

// ── Code block ────────────────────────────────

const CodeBlock: React.FC<{ language: string; code: string }> = ({
  language,
  code,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded border border-xcursor-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1 bg-xcursor-panel border-b border-xcursor-border">
        <span className="text-[10px] font-mono text-xcursor-text-muted uppercase">
          {language || "code"}
        </span>
        <button
          onClick={copy}
          className="text-[10px] text-xcursor-text-muted hover:text-xcursor-text flex items-center gap-1"
        >
          {copied ? (
            <><Check className="h-2.5 w-2.5" /> Copied</>
          ) : (
            <><Copy className="h-2.5 w-2.5" /> Copy</>
          )}
        </button>
      </div>
      <pre className="px-3 py-2 bg-xcursor-bg overflow-x-auto">
        <code className="font-mono text-[12px] text-xcursor-text leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
};

// ── Helpers ───────────────────────────────────

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
