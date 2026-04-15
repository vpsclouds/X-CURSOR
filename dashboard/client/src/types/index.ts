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
