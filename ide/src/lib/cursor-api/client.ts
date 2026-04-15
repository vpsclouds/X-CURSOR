// ─────────────────────────────────────────────
// Cursor API — Main Client
// Facade over all services
// ─────────────────────────────────────────────

import { authService } from "./services/auth-service";
import { streamChatCompletion, streamBYOChat, getTabCompletion } from "./services/ai-service";
import { getUserInfo, getUsageStats, getTeams } from "./services/dashboard-service";
import { getServerConfig, getAvailableModels } from "./services/config-service";
import type { ChatMessage, ChatStreamDelta, CompletionRequest, CompletionResponse, AIProvider } from "./types";
import { AI_PROVIDERS } from "./types";

// ── BYO Key Registry ──────────────────────────

const apiKeys: Record<string, string> = {};

export function setProviderApiKey(providerId: string, key: string): void {
  apiKeys[providerId] = key;
  // Also persist to localStorage
  localStorage.setItem(`xcursor-apikey-${providerId}`, key);
}

export function getProviderApiKey(providerId: string): string | null {
  return apiKeys[providerId] ?? localStorage.getItem(`xcursor-apikey-${providerId}`);
}

export function loadPersistedKeys(): void {
  for (const provider of AI_PROVIDERS) {
    const key = localStorage.getItem(`xcursor-apikey-${provider.id}`);
    if (key) apiKeys[provider.id] = key;
  }
}

// ── Main Client Class ─────────────────────────

export class CursorAPIClient {
  private currentProvider: string = "openai";
  private currentModel: string = "gpt-4o";

  constructor() {
    loadPersistedKeys();
  }

  setProvider(providerId: string): void {
    this.currentProvider = providerId;
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (provider) {
      this.currentModel = provider.defaultModel;
    }
  }

  setModel(modelId: string): void {
    this.currentModel = modelId;
  }

  getProvider(): AIProvider | undefined {
    return AI_PROVIDERS.find((p) => p.id === this.currentProvider);
  }

  // ── Auth ────────────────────────────────────

  get auth() {
    return authService;
  }

  // ── Chat Streaming ───────────────────────────

  async *streamChat(
    messages: ChatMessage[],
    model?: string,
    providerId?: string,
    signal?: AbortSignal
  ): AsyncGenerator<ChatStreamDelta> {
    const resolvedProvider = providerId ?? this.currentProvider;
    const resolvedModel = model ?? this.currentModel;

    if (resolvedProvider === "cursor") {
      // Use Cursor's hosted API
      const token = await authService.ensureValidToken();
      if (!token) {
        yield { type: "error", error: "Not authenticated with Cursor" };
        return;
      }
      yield* streamChatCompletion(messages, resolvedModel, token, signal);
    } else {
      // BYO key
      const provider = AI_PROVIDERS.find((p) => p.id === resolvedProvider);
      if (!provider) {
        yield { type: "error", error: `Unknown provider: ${resolvedProvider}` };
        return;
      }

      const apiKey = getProviderApiKey(resolvedProvider) ?? "";

      yield* streamBYOChat(
        messages,
        resolvedModel,
        {
          apiKey,
          baseUrl: provider.baseUrl,
          provider: resolvedProvider as Parameters<typeof streamBYOChat>[2]["provider"],
        },
        signal
      );
    }
  }

  // ── Tab Completion ───────────────────────────

  async getCompletion(
    request: CompletionRequest
  ): Promise<CompletionResponse | null> {
    const token = await authService.ensureValidToken();
    if (!token) return null;
    return getTabCompletion(request, token);
  }

  // ── Dashboard ────────────────────────────────

  async getUserInfo() {
    const token = await authService.ensureValidToken();
    if (!token) return null;
    return getUserInfo(token);
  }

  async getUsageStats() {
    const token = await authService.ensureValidToken();
    if (!token) return null;
    return getUsageStats(token);
  }

  async getTeams() {
    const token = await authService.ensureValidToken();
    if (!token) return [];
    return getTeams(token);
  }

  // ── Config ────────────────────────────────────

  async getServerConfig() {
    const token = await authService.ensureValidToken();
    if (!token) return null;
    return getServerConfig(token);
  }

  async getAvailableModels() {
    const token = await authService.ensureValidToken();
    if (!token) return [];
    return getAvailableModels(token);
  }
}

// Singleton
export const cursorClient = new CursorAPIClient();
