// Types for X-CURSOR Admin Dashboard

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'Free' | 'Pro' | 'Ultra' | 'Enterprise';
  status: 'active' | 'inactive' | 'banned';
  apiCalls: number;
  lastActive: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
  rateLimit: number;
  totalRequests: number;
}

export interface AIProvider {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  apiKeyConfigured: boolean;
  modelsAvailable: number;
  totalRequests: number;
  errorRate: number;
  baseUrl: string;
  icon: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'chat' | 'completion' | 'embedding';
  contextWindow: number;
  pricingInput: number; // per 1M tokens
  pricingOutput: number;
  status: 'active' | 'disabled';
  totalRequests: number;
}

export interface UsageData {
  date: string;
  apiCalls: number;
  tokens: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  plans: {
    Free: boolean;
    Pro: boolean;
    Ultra: boolean;
    Enterprise: boolean;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  plan: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
  details?: string;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
}

// ============================================================
// 9router-inspired types
// ============================================================

// Provider Tiers (inspired by 9router's 4-tier system)
export type ProviderTier = 'free' | 'free-tier' | 'subscription' | 'api-key';
export type AuthMethod = 'oauth-pkce' | 'oauth-authcode' | 'device-code' | 'device-code-pkce' | 'token-import' | 'api-key' | 'noAuth' | 'multi-method';
export type AccountStrategy = 'fill-first' | 'round-robin';
export type ServiceKind = 'llm' | 'embedding' | 'tts' | 'stt' | 'image' | 'imageToText' | 'webSearch' | 'webFetch' | 'video' | 'music';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'rate-limited' | 'cooldown' | 'expired';

export interface ProviderConnection {
  id: string;
  connectionName: string;
  provider: string;
  status: ConnectionStatus;
  isActive: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  modelLocks: Record<string, string>; // modelName -> unlock timestamp
  totalRequests: number;
  lastUsed: string;
  errorCount: number;
  priority: number;
  proxyEnabled: boolean;
  proxyUrl?: string;
}

// Enhanced AI Provider with 9router features
export interface AIProviderEnhanced extends AIProvider {
  tier: ProviderTier;
  authMethod: AuthMethod;
  color: string;
  alias: string;
  serviceKinds: ServiceKind[];
  connections: ProviderConnection[];
  strategy: AccountStrategy;
  stickyLimit: number;
  authMethods?: KiroAuthMethod[]; // For multi-method providers like Kiro
  oauthConfig?: OAuthConfig;
  freeModels?: string[];
  quotaSupported: boolean;
  deprecated: boolean;
  deprecationNotice?: string;
  cooldownMs: number;
  maxRetries: number;
  website?: string;
  textIcon?: string;
  noAuth?: boolean;
  passthroughModels?: boolean;
  notice?: {
    text: string;
    apiKeyUrl?: string;
  };
}

// ============================================================
// Kiro / Cursor / OAuth specific types
// ============================================================

export type KiroAuthMethod = 'builder-id' | 'idc' | 'google' | 'github' | 'import';

export interface KiroIDCConfig {
  startUrl: string;
  region: string;
}

export interface DeviceCodeData {
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
  expiresIn: number;
  interval: number;
}

export interface OAuthConfig {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  usePkce: boolean;
  scopes: string[];
  codeChallengeMethod?: string;
  deviceCodeUrl?: string;
  apiKeyUrl?: string;
  extraParams?: Record<string, string>;
  copilotTokenUrl?: string;
  // Cursor-specific
  tokenStoragePaths?: {
    linux: string;
    macos: string;
    windows: string;
  };
  dbKeys?: {
    accessToken: string;
    machineId: string;
  };
  // Kiro-specific
  ssoOidcEndpoint?: string;
  startUrl?: string;
  socialAuthEndpoint?: string;
  authMethods?: KiroAuthMethod[];
  // iFlow-specific
  clientSecret?: string;
  extraLoginParams?: Record<string, string>;
}

export interface CursorTokenData {
  accessToken: string;
  machineId: string;
}

export interface ModelPricing {
  input: number;   // $/1M tokens
  output: number;
  cached?: number;
  reasoning?: number;
  cacheCreation?: number;
}

export interface AIModelEnhanced extends AIModel {
  pricing: ModelPricing;
  providerOverrides: Record<string, ModelPricing>; // provider-specific pricing
  aliases: string[];
  isFreeTier: boolean;
  maxOutputTokens: number;
}

export interface ProviderQuota {
  providerId: string;
  used: number;
  limit: number;
  resetAt: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface ModelCombo {
  id: string;
  name: string;
  models: { provider: string; model: string; weight: number }[];
  strategy: 'round-robin' | 'weighted' | 'priority';
  isActive: boolean;
}

export interface RoutingRule {
  id: string;
  name: string;
  tiers: ProviderTier[];
  fallbackOrder: string[]; // provider IDs in fallback order
  isActive: boolean;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  tier: ProviderTier;
  connectionId: string;
  status: 'success' | 'fallback' | 'error';
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  errorMessage?: string;
  fallbackFrom?: string;
}
