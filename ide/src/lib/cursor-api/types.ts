// ─────────────────────────────────────────────
// Cursor API Types
// Based on decompiled Cursor source analysis
// ─────────────────────────────────────────────

// ── Auth ──────────────────────────────────────

export interface CursorAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface CursorAuthPollResponse {
  auth_token?: string;
  access_token?: string;
  refresh_token?: string;
  error?: string;
}

export interface CursorUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  usage?: CursorUsage;
}

export interface CursorUsage {
  fast_requests_used: number;
  fast_requests_limit: number;
  slow_requests_used: number;
  slow_requests_limit: number;
  period_start: string;
  period_end: string;
}

// ── Chat / AI ────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | MessageContent[];
}

export type MessageContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "code"; code: string; language?: string };

export interface ChatStreamRequest {
  conversation: ChatMessage[];
  model: string;
  workspacePath?: string;
  currentFileContent?: string;
  currentFileName?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatStreamDelta {
  type: "text" | "error" | "done";
  content?: string;
  error?: string;
}

// ── Composer ─────────────────────────────────

export interface ComposerEdit {
  filePath: string;
  originalContent: string;
  newContent: string;
  diff?: string;
}

export interface ComposerRequest {
  prompt: string;
  files: ComposerFileContext[];
  model: string;
  planMode?: boolean;
}

export interface ComposerFileContext {
  path: string;
  content: string;
}

export interface ComposerResponse {
  edits: ComposerEdit[];
  explanation: string;
}

// ── Agent ─────────────────────────────────────

export type AgentToolType =
  | "file_read"
  | "file_edit"
  | "terminal_command"
  | "web_search"
  | "code_search"
  | "create_file"
  | "delete_file";

export interface AgentTool {
  type: AgentToolType;
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface AgentToolCall {
  id: string;
  tool: AgentToolType;
  input: Record<string, unknown>;
  output?: string;
  status: "pending" | "running" | "completed" | "error";
  startedAt?: number;
  completedAt?: number;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolCalls?: AgentToolCall[];
  timestamp: number;
}

// ── Completion (Cursor Tab) ───────────────────

export interface CompletionRequest {
  prefix: string;
  suffix: string;
  fileName: string;
  language: string;
  model?: string;
}

export interface CompletionResponse {
  completions: string[];
  requestId: string;
}

// ── Providers ─────────────────────────────────

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  requiresApiKey: boolean;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  defaultModel: string;
  models: string[];
  baseUrl: string;
  logoColor: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "cursor",
    name: "Cursor",
    description: "Use Cursor's hosted AI (requires Cursor account)",
    requiresApiKey: false,
    apiKeyLabel: "Cursor API Key",
    apiKeyPlaceholder: "Login to Cursor to get your key",
    defaultModel: "claude-sonnet-4-5",
    models: ["claude-opus-4-5", "claude-sonnet-4-5", "gpt-4o", "gemini-2.5-pro"],
    baseUrl: "https://api2.cursor.sh",
    logoColor: "#007acc",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, o1 and more",
    requiresApiKey: true,
    apiKeyLabel: "OpenAI API Key",
    apiKeyPlaceholder: "sk-...",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-preview", "o1-mini"],
    baseUrl: "https://api.openai.com/v1",
    logoColor: "#10a37f",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude Opus, Sonnet, Haiku",
    requiresApiKey: true,
    apiKeyLabel: "Anthropic API Key",
    apiKeyPlaceholder: "sk-ant-...",
    defaultModel: "claude-sonnet-4-5",
    models: ["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-3-5"],
    baseUrl: "https://api.anthropic.com/v1",
    logoColor: "#d97706",
  },
  {
    id: "google",
    name: "Google",
    description: "Gemini 2.5 Pro, Flash",
    requiresApiKey: true,
    apiKeyLabel: "Google API Key",
    apiKeyPlaceholder: "AIza...",
    defaultModel: "gemini-2.5-flash",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro"],
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    logoColor: "#4285f4",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek V3, R1",
    requiresApiKey: true,
    apiKeyLabel: "DeepSeek API Key",
    apiKeyPlaceholder: "sk-...",
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-r1"],
    baseUrl: "https://api.deepseek.com",
    logoColor: "#6366f1",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "European AI models — Mistral Large, Codestral",
    requiresApiKey: true,
    apiKeyLabel: "Mistral API Key",
    apiKeyPlaceholder: "sk-...",
    defaultModel: "mistral-large-latest",
    models: ["mistral-large-latest", "mistral-medium-latest", "codestral-latest", "mistral-small-latest"],
    baseUrl: "https://api.mistral.ai/v1",
    logoColor: "#f97316",
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference — LLaMA, Mixtral, Gemma",
    requiresApiKey: true,
    apiKeyLabel: "Groq API Key",
    apiKeyPlaceholder: "gsk_...",
    defaultModel: "llama-3.3-70b-versatile",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
    baseUrl: "https://api.groq.com/openai/v1",
    logoColor: "#ef4444",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access 100+ models via one API",
    requiresApiKey: true,
    apiKeyLabel: "OpenRouter API Key",
    apiKeyPlaceholder: "sk-or-...",
    defaultModel: "openai/gpt-4o",
    models: ["openai/gpt-4o", "anthropic/claude-opus-4-5", "google/gemini-2.5-pro"],
    baseUrl: "https://openrouter.ai/api/v1",
    logoColor: "#8b5cf6",
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    description: "Run models locally",
    requiresApiKey: false,
    apiKeyLabel: "",
    apiKeyPlaceholder: "",
    defaultModel: "llama3.1",
    models: ["llama3.1", "codellama", "deepseek-coder", "mistral"],
    baseUrl: "http://localhost:11434/v1",
    logoColor: "#f97316",
  },
];
