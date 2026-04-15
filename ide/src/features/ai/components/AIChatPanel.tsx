import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  X,
  ChevronDown,
  MessageSquare,
  Layers,
  Bot,
} from "lucide-react";
import { useAIChatStore } from "../store/ai-chat-store";
import { useAIChat } from "../hooks/use-ai-chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ProviderSelector } from "./ProviderSelector";
import { ComposerPanel } from "@/features/composer/components/ComposerPanel";
import { AgentPanel } from "@/features/agent/components/AgentPanel";
import { cn } from "@/lib/utils";

type AIView = "chat" | "composer" | "agent";

interface AIChatPanelProps {
  onClose?: () => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ onClose }) => {
  const [view, setView] = useState<AIView>("chat");
  const { chats, currentChatId, createChat, setCurrentChat, deleteChat } =
    useAIChatStore();

  // Ensure there's at least one chat
  useEffect(() => {
    if (chats.length === 0) {
      createChat();
    }
  }, []);

  const { messages, sendMessage, stopGeneration, isGenerating } = useAIChat(
    currentChatId
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    createChat();
  };

  return (
    <div className="flex flex-col h-full bg-xcursor-sidebar border-l border-xcursor-border">
      {/* Panel header */}
      <div className="flex items-center h-8 px-2 border-b border-xcursor-border shrink-0 gap-1">
        {/* View switcher */}
        <div className="flex items-center gap-0.5 bg-xcursor-input rounded px-0.5 py-0.5">
          <ViewButton
            active={view === "chat"}
            onClick={() => setView("chat")}
            icon={<MessageSquare className="h-3 w-3" />}
            label="Chat"
          />
          <ViewButton
            active={view === "composer"}
            onClick={() => setView("composer")}
            icon={<Layers className="h-3 w-3" />}
            label="Composer"
          />
          <ViewButton
            active={view === "agent"}
            onClick={() => setView("agent")}
            icon={<Bot className="h-3 w-3" />}
            label="Agent"
          />
        </div>

        <div className="flex-1" />

        <button
          onClick={handleNewChat}
          className="p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
          title="New Chat"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* View content */}
      {view === "chat" && (
        <>
          {/* Provider selector */}
          <ProviderSelector />

          {/* Chat history list (if multiple chats) */}
          {chats.length > 1 && (
            <ChatSelector
              chats={chats.map((c) => ({ id: c.id, title: c.title }))}
              currentId={currentChatId}
              onSelect={setCurrentChat}
              onDelete={deleteChat}
            />
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <WelcomeMessage onSend={sendMessage} />
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            onStop={stopGeneration}
            isGenerating={isGenerating}
          />
        </>
      )}

      {view === "composer" && <ComposerView />}
      {view === "agent" && <AgentView />}
    </div>
  );
};

// ── View button ───────────────────────────────

interface ViewButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ViewButton: React.FC<ViewButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1 px-1.5 py-0.5 rounded text-editor-xs transition-colors",
      active
        ? "bg-xcursor-sidebar text-xcursor-text shadow-sm"
        : "text-xcursor-text-muted hover:text-xcursor-text"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// ── Chat selector ─────────────────────────────

interface ChatSelectorProps {
  chats: { id: string; title: string }[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChatSelector: React.FC<ChatSelectorProps> = ({
  chats,
  currentId,
  onSelect,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const current = chats.find((c) => c.id === currentId);

  return (
    <div className="relative border-b border-xcursor-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 w-full px-3 py-1.5 text-editor-xs text-xcursor-text-muted hover:bg-xcursor-hover transition-colors"
      >
        <MessageSquare className="h-3 w-3" />
        <span className="flex-1 text-left truncate">
          {current?.title ?? "Select chat"}
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-20 bg-xcursor-sidebar border border-xcursor-border shadow-lg max-h-48 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center group px-3 py-1.5 cursor-pointer hover:bg-xcursor-hover",
                chat.id === currentId && "bg-xcursor-selected"
              )}
              onClick={() => {
                onSelect(chat.id);
                setOpen(false);
              }}
            >
              <span className="flex-1 text-editor-xs text-xcursor-text truncate">
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-xcursor-text-muted hover:text-xcursor-error transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Welcome message ───────────────────────────

const WelcomeMessage: React.FC<{ onSend: (msg: string) => void }> = ({ onSend }) => {
  const suggestions = [
    "Explain the selected code",
    "Fix any bugs in this file",
    "Write unit tests for this function",
    "Refactor for better readability",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
        <MessageSquare className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="text-editor-sm font-medium text-xcursor-text">X-CURSOR AI</p>
        <p className="text-editor-xs text-xcursor-text-muted mt-0.5">
          Ask anything about your code
        </p>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSend(s)}
            className="text-left text-editor-xs text-xcursor-text-muted px-3 py-1.5 rounded border border-xcursor-border hover:border-accent/50 hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Stubs for other views ─────────────────────

const ComposerView: React.FC = () => <ComposerPanel />;
const AgentView: React.FC = () => <AgentPanel />;
