// ─────────────────────────────────────────────
// Cursor API — AI Service
// Chat, Composer, Completion via Cursor's API
// ─────────────────────────────────────────────

import { buildCursorHeaders } from "../headers";
import { CURSOR_API_ENDPOINTS, processStreamingResponse, cursorFetch } from "../transport";
import type { ChatMessage, ChatStreamDelta, CompletionRequest, CompletionResponse } from "../types";

// ── Chat Stream ───────────────────────────────

export async function* streamChatCompletion(
  messages: ChatMessage[],
  model: string,
  accessToken: string,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamDelta> {
  const body = JSON.stringify({
    model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 8192,
  });

  const headers = await buildCursorHeaders(accessToken, body);

  let response: Response;
  try {
    response = await cursorFetch(`${CURSOR_API_ENDPOINTS.chat}/v1/chat/completions`, {
      method: "POST",
      headers,
      body,
      signal,
      stream: true,
    });
  } catch (err) {
    yield { type: "error" as const, error: err instanceof Error ? err.message : "Network error" };
    return;
  }

  yield* processStreamingResponse(response);
}

// ── BYO Key Streams (Direct Provider) ─────────

interface BYOKeyConfig {
  apiKey: string;
  baseUrl: string;
  provider: "openai" | "anthropic" | "google" | "deepseek" | "mistral" | "groq" | "openrouter" | "ollama";
}

/**
 * Streams chat completion using a user's own API key (bypass Cursor backend).
 */
export async function* streamBYOChat(
  messages: ChatMessage[],
  model: string,
  config: BYOKeyConfig,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamDelta> {
  let url: string;
  let headers: Record<string, string>;
  let body: string;

  switch (config.provider) {
    case "anthropic": {
      url = `${config.baseUrl}/messages`;
      headers = {
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      };
      // Convert messages for Anthropic format
      const systemMessages = messages.filter((m) => m.role === "system");
      const userMessages = messages.filter((m) => m.role !== "system");
      body = JSON.stringify({
        model,
        messages: userMessages,
        system: systemMessages.map((m) => m.content).join("\n"),
        max_tokens: 8192,
        stream: true,
      });
      break;
    }

    case "google": {
      const contents = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content as string }],
        }));
      url = `${config.baseUrl}/models/${model}:streamGenerateContent?key=${config.apiKey}&alt=sse`;
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify({ contents });
      break;
    }

    default: {
      // OpenAI-compatible (OpenAI, DeepSeek, Mistral, Groq, OpenRouter, Ollama)
      url = `${config.baseUrl}/chat/completions`;
      headers = {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      };
      if (config.provider === "openrouter") {
        headers["HTTP-Referer"] = "https://xcursor.dev";
        headers["X-Title"] = "X-CURSOR IDE";
      }
      if (config.provider === "mistral") {
        headers["Accept"] = "text/event-stream";
      }
      body = JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 8192,
      });
    }
  }

  let response: Response;
  try {
    response = await cursorFetch(url, {
      method: "POST",
      headers,
      body,
      signal,
      stream: true,
    });
  } catch (err) {
    yield { type: "error" as const, error: err instanceof Error ? err.message : "Network error" };
    return;
  }

  // Handle Google's different streaming format
  if (config.provider === "google") {
    yield* processGoogleStream(response);
  } else if (config.provider === "anthropic") {
    yield* processAnthropicStream(response);
  } else {
    yield* processStreamingResponse(response);
  }
}

async function* processAnthropicStream(
  response: Response
): AsyncGenerator<ChatStreamDelta> {
  if (!response.ok) {
    const err = await response.text();
    yield { type: "error" as const, error: `Anthropic error: ${err}` };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              yield { type: "text" as const, content: parsed.delta.text };
            } else if (parsed.type === "message_stop") {
              yield { type: "done" as const };
              return;
            }
          } catch {
            // skip
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  yield { type: "done" as const };
}

async function* processGoogleStream(
  response: Response
): AsyncGenerator<ChatStreamDelta> {
  if (!response.ok) {
    const err = await response.text();
    yield { type: "error" as const, error: `Google error: ${err}` };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(line.slice(6));
            const text =
              parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            if (text) yield { type: "text" as const, content: text };
          } catch {
            // skip
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  yield { type: "done" as const };
}

// ── Cursor Tab Completion ─────────────────────

export async function getTabCompletion(
  request: CompletionRequest,
  accessToken: string,
  signal?: AbortSignal
): Promise<CompletionResponse | null> {
  const body = JSON.stringify({
    prefix: request.prefix,
    suffix: request.suffix,
    file_name: request.fileName,
    language: request.language,
    model: request.model ?? "cursor-tab",
  });

  const headers = await buildCursorHeaders(accessToken, body);

  try {
    const response = await cursorFetch(
      `${CURSOR_API_ENDPOINTS.tab}/completions`,
      {
        method: "POST",
        headers,
        body,
        signal,
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      completions: data.completions ?? [],
      requestId: data.request_id ?? "",
    };
  } catch {
    return null;
  }
}
