import { useCallback, useRef } from "react";
import { useAIChatStore } from "../store/ai-chat-store";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { cursorClient, setProviderApiKey } from "@/lib/cursor-api/client";
import { generateId } from "@/lib/utils";

export function useAIChat(chatId: string | null) {
  const {
    chats,
    addMessage,
    updateMessage,
    setStreamingMessage,
    setGenerating,
    isGenerating,
  } = useAIChatStore();

  const { providerId, modelId, apiKeys } = useSettingsStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentChat = chats.find((c) => c.id === chatId);

  const sendMessage = useCallback(
    async (userContent: string) => {
      if (!chatId || isGenerating || !userContent.trim()) return;

      // Ensure API keys are loaded into the client
      Object.entries(apiKeys).forEach(([pid, key]) => {
        setProviderApiKey(pid, key);
      });

      // Add user message
      addMessage(chatId, { role: "user", content: userContent });

      // Create assistant message placeholder
      const assistantMsgId = addMessage(chatId, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      setStreamingMessage(assistantMsgId);
      setGenerating(true);

      // Build message history for context
      const history = (currentChat?.messages ?? [])
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      // Append the new user message
      history.push({ role: "user", content: userContent });

      abortControllerRef.current = new AbortController();

      let accumulatedContent = "";

      try {
        for await (const delta of cursorClient.streamChat(
          history,
          modelId,
          providerId,
          abortControllerRef.current.signal
        )) {
          if (delta.type === "text" && delta.content) {
            accumulatedContent += delta.content;
            updateMessage(chatId, assistantMsgId, accumulatedContent);
          } else if (delta.type === "error") {
            updateMessage(
              chatId,
              assistantMsgId,
              `⚠️ Error: ${delta.error ?? "Unknown error"}`,
              true
            );
            break;
          } else if (delta.type === "done") {
            break;
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          updateMessage(
            chatId,
            assistantMsgId,
            `⚠️ Error: ${(err as Error).message}`,
            true
          );
        }
      } finally {
        updateMessage(chatId, assistantMsgId, accumulatedContent, true);
        setStreamingMessage(null);
        setGenerating(false);
        abortControllerRef.current = null;
      }
    },
    [chatId, isGenerating, providerId, modelId, apiKeys, currentChat]
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages: currentChat?.messages ?? [],
    sendMessage,
    stopGeneration,
    isGenerating,
  };
}
