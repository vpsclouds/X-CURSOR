import type {
  User, ApiKey, AIProvider, AIModel, FeatureFlag, Transaction, LogEntry,
  AIProviderEnhanced, AIModelEnhanced, ProviderConnection, ProviderQuota,
  ModelCombo, RoutingRule, RequestLog, ProviderTier, ConnectionStatus
} from '../types';

// ============================================================
// Original mock data (unchanged)
// ============================================================

export const mockUsers: User[] = [
  { id: '1', name: 'Nguyễn Văn An', email: 'an.nguyen@company.vn', avatar: '', plan: 'Enterprise', status: 'active', apiCalls: 45230, lastActive: '2025-01-15T10:30:00', createdAt: '2024-03-10' },
  { id: '2', name: 'Trần Thị Bình', email: 'binh.tran@startup.io', avatar: '', plan: 'Pro', status: 'active', apiCalls: 12840, lastActive: '2025-01-15T09:15:00', createdAt: '2024-05-22' },
  { id: '3', name: 'Lê Hoàng Cường', email: 'cuong.le@tech.dev', avatar: '', plan: 'Ultra', status: 'active', apiCalls: 28750, lastActive: '2025-01-14T22:45:00', createdAt: '2024-04-15' },
  { id: '4', name: 'Phạm Minh Đức', email: 'duc.pham@agency.com', avatar: '', plan: 'Free', status: 'active', apiCalls: 1230, lastActive: '2025-01-14T18:20:00', createdAt: '2024-08-01' },
  { id: '5', name: 'Hoàng Thị Eun', email: 'eun.hoang@design.co', avatar: '', plan: 'Pro', status: 'inactive', apiCalls: 8920, lastActive: '2025-01-10T14:00:00', createdAt: '2024-06-18' },
  { id: '6', name: 'Võ Quốc Phong', email: 'phong.vo@enterprise.vn', avatar: '', plan: 'Enterprise', status: 'active', apiCalls: 67890, lastActive: '2025-01-15T11:00:00', createdAt: '2024-01-05' },
  { id: '7', name: 'Đặng Thùy Giang', email: 'giang.dang@freelance.dev', avatar: '', plan: 'Ultra', status: 'active', apiCalls: 34500, lastActive: '2025-01-15T08:30:00', createdAt: '2024-02-20' },
  { id: '8', name: 'Bùi Thanh Hải', email: 'hai.bui@research.edu', avatar: '', plan: 'Free', status: 'banned', apiCalls: 450, lastActive: '2025-01-05T12:00:00', createdAt: '2024-09-12' },
  { id: '9', name: 'Ngô Anh Khoa', email: 'khoa.ngo@mobile.app', avatar: '', plan: 'Pro', status: 'active', apiCalls: 15600, lastActive: '2025-01-15T07:45:00', createdAt: '2024-07-08' },
  { id: '10', name: 'Lý Thị Linh', email: 'linh.ly@cloud.io', avatar: '', plan: 'Ultra', status: 'active', apiCalls: 22100, lastActive: '2025-01-14T23:30:00', createdAt: '2024-04-30' },
  { id: '11', name: 'Mai Hữu Nam', email: 'nam.mai@ai.studio', avatar: '', plan: 'Enterprise', status: 'active', apiCalls: 89000, lastActive: '2025-01-15T11:20:00', createdAt: '2024-01-15' },
  { id: '12', name: 'Trương Thị Oanh', email: 'oanh.truong@saas.co', avatar: '', plan: 'Pro', status: 'active', apiCalls: 11200, lastActive: '2025-01-13T16:00:00', createdAt: '2024-06-05' },
];

export const mockApiKeys: ApiKey[] = [
  { id: '1', name: 'Production API', key: 'xc-prod-a1b2c3d4e5f6g7h8i9j0', createdAt: '2024-06-01', lastUsed: '2025-01-15T11:30:00', status: 'active', rateLimit: 10000, totalRequests: 2450000 },
  { id: '2', name: 'Staging Environment', key: 'xc-stag-k1l2m3n4o5p6q7r8s9t0', createdAt: '2024-08-15', lastUsed: '2025-01-15T10:00:00', status: 'active', rateLimit: 5000, totalRequests: 890000 },
  { id: '3', name: 'Development Local', key: 'xc-dev-u1v2w3x4y5z6a7b8c9d0', createdAt: '2024-09-20', lastUsed: '2025-01-14T18:45:00', status: 'active', rateLimit: 1000, totalRequests: 125000 },
  { id: '4', name: 'Legacy Integration', key: 'xc-leg-e1f2g3h4i5j6k7l8m9n0', createdAt: '2024-03-10', lastUsed: '2024-12-01T08:00:00', status: 'revoked', rateLimit: 2000, totalRequests: 450000 },
  { id: '5', name: 'Mobile App Key', key: 'xc-mob-o1p2q3r4s5t6u7v8w9x0', createdAt: '2024-11-01', lastUsed: '2025-01-15T09:20:00', status: 'active', rateLimit: 8000, totalRequests: 670000 },
  { id: '6', name: 'CI/CD Pipeline', key: 'xc-cicd-y1z2a3b4c5d6e7f8g9h0', createdAt: '2024-10-05', lastUsed: '2025-01-15T06:00:00', status: 'active', rateLimit: 3000, totalRequests: 340000 },
];

export const mockProviders: AIProvider[] = [
  { id: '1', name: 'OpenAI', slug: 'openai', status: 'active', apiKeyConfigured: true, modelsAvailable: 8, totalRequests: 1250000, errorRate: 0.12, baseUrl: 'https://api.openai.com/v1', icon: 'openai' },
  { id: '2', name: 'Anthropic', slug: 'anthropic', status: 'active', apiKeyConfigured: true, modelsAvailable: 5, totalRequests: 890000, errorRate: 0.08, baseUrl: 'https://api.anthropic.com', icon: 'anthropic' },
  { id: '3', name: 'Google AI', slug: 'google', status: 'active', apiKeyConfigured: true, modelsAvailable: 6, totalRequests: 450000, errorRate: 0.15, baseUrl: 'https://generativelanguage.googleapis.com', icon: 'google' },
  { id: '4', name: 'DeepSeek', slug: 'deepseek', status: 'active', apiKeyConfigured: true, modelsAvailable: 3, totalRequests: 320000, errorRate: 0.22, baseUrl: 'https://api.deepseek.com/v1', icon: 'deepseek' },
  { id: '5', name: 'Mistral AI', slug: 'mistral', status: 'active', apiKeyConfigured: true, modelsAvailable: 4, totalRequests: 180000, errorRate: 0.10, baseUrl: 'https://api.mistral.ai/v1', icon: 'mistral' },
  { id: '6', name: 'Groq', slug: 'groq', status: 'active', apiKeyConfigured: true, modelsAvailable: 5, totalRequests: 560000, errorRate: 0.05, baseUrl: 'https://api.groq.com/openai/v1', icon: 'groq' },
  { id: '7', name: 'OpenRouter', slug: 'openrouter', status: 'inactive', apiKeyConfigured: false, modelsAvailable: 0, totalRequests: 0, errorRate: 0, baseUrl: 'https://openrouter.ai/api/v1', icon: 'openrouter' },
  { id: '8', name: 'Ollama', slug: 'ollama', status: 'inactive', apiKeyConfigured: false, modelsAvailable: 0, totalRequests: 0, errorRate: 0, baseUrl: 'http://localhost:11434', icon: 'ollama' },
];

export const mockModels: AIModel[] = [
  { id: '1', name: 'gpt-4o', provider: 'OpenAI', type: 'chat', contextWindow: 128000, pricingInput: 2.50, pricingOutput: 10.00, status: 'active', totalRequests: 520000 },
  { id: '2', name: 'gpt-4o-mini', provider: 'OpenAI', type: 'chat', contextWindow: 128000, pricingInput: 0.15, pricingOutput: 0.60, status: 'active', totalRequests: 380000 },
  { id: '3', name: 'o1', provider: 'OpenAI', type: 'chat', contextWindow: 200000, pricingInput: 15.00, pricingOutput: 60.00, status: 'active', totalRequests: 45000 },
  { id: '4', name: 'claude-4-sonnet', provider: 'Anthropic', type: 'chat', contextWindow: 200000, pricingInput: 3.00, pricingOutput: 15.00, status: 'active', totalRequests: 420000 },
  { id: '5', name: 'claude-4-opus', provider: 'Anthropic', type: 'chat', contextWindow: 200000, pricingInput: 15.00, pricingOutput: 75.00, status: 'active', totalRequests: 89000 },
  { id: '6', name: 'claude-3.5-haiku', provider: 'Anthropic', type: 'chat', contextWindow: 200000, pricingInput: 0.80, pricingOutput: 4.00, status: 'active', totalRequests: 280000 },
  { id: '7', name: 'gemini-2.5-pro', provider: 'Google AI', type: 'chat', contextWindow: 1000000, pricingInput: 1.25, pricingOutput: 10.00, status: 'active', totalRequests: 210000 },
  { id: '8', name: 'gemini-2.5-flash', provider: 'Google AI', type: 'chat', contextWindow: 1000000, pricingInput: 0.15, pricingOutput: 0.60, status: 'active', totalRequests: 190000 },
  { id: '9', name: 'deepseek-v3', provider: 'DeepSeek', type: 'chat', contextWindow: 128000, pricingInput: 0.27, pricingOutput: 1.10, status: 'active', totalRequests: 180000 },
  { id: '10', name: 'deepseek-r1', provider: 'DeepSeek', type: 'chat', contextWindow: 128000, pricingInput: 0.55, pricingOutput: 2.19, status: 'active', totalRequests: 95000 },
  { id: '11', name: 'mistral-large', provider: 'Mistral AI', type: 'chat', contextWindow: 128000, pricingInput: 2.00, pricingOutput: 6.00, status: 'active', totalRequests: 120000 },
  { id: '12', name: 'codestral', provider: 'Mistral AI', type: 'completion', contextWindow: 256000, pricingInput: 0.30, pricingOutput: 0.90, status: 'active', totalRequests: 60000 },
  { id: '13', name: 'llama-3.3-70b', provider: 'Groq', type: 'chat', contextWindow: 131072, pricingInput: 0.59, pricingOutput: 0.79, status: 'active', totalRequests: 340000 },
  { id: '14', name: 'text-embedding-3-large', provider: 'OpenAI', type: 'embedding', contextWindow: 8191, pricingInput: 0.13, pricingOutput: 0, status: 'active', totalRequests: 150000 },
];

export const mockFeatures: FeatureFlag[] = [
  { id: '1', name: 'composer', description: 'Multi-file AI editing with Composer', enabled: true, plans: { Free: false, Pro: true, Ultra: true, Enterprise: true } },
  { id: '2', name: 'background_agent', description: 'Background AI agent for autonomous tasks', enabled: true, plans: { Free: false, Pro: false, Ultra: true, Enterprise: true } },
  { id: '3', name: 'bugbot', description: 'Automated bug detection and PR review', enabled: true, plans: { Free: false, Pro: false, Ultra: true, Enterprise: true } },
  { id: '4', name: 'yolo_mode', description: 'Auto-run terminal commands without confirmation', enabled: true, plans: { Free: false, Pro: true, Ultra: true, Enterprise: true } },
  { id: '5', name: 'shadow_workspace', description: 'Parallel workspace for safe experimentation', enabled: true, plans: { Free: false, Pro: false, Ultra: true, Enterprise: true } },
  { id: '6', name: 'cursor_tab', description: 'Intelligent tab completion predictions', enabled: true, plans: { Free: true, Pro: true, Ultra: true, Enterprise: true } },
  { id: '7', name: 'mcp', description: 'Model Context Protocol server integration', enabled: true, plans: { Free: false, Pro: true, Ultra: true, Enterprise: true } },
  { id: '8', name: 'browser_automation', description: 'AI-driven browser testing and automation', enabled: false, plans: { Free: false, Pro: false, Ultra: false, Enterprise: true } },
  { id: '9', name: 'code_review', description: 'AI-powered code review suggestions', enabled: true, plans: { Free: true, Pro: true, Ultra: true, Enterprise: true } },
  { id: '10', name: 'plan_mode', description: 'Plan before executing — review AI steps', enabled: true, plans: { Free: false, Pro: true, Ultra: true, Enterprise: true } },
  { id: '11', name: 'deep_search', description: 'Deep codebase search with semantic understanding', enabled: true, plans: { Free: false, Pro: false, Ultra: true, Enterprise: true } },
  { id: '12', name: 'knowledge_base', description: 'Custom documentation indexing per project', enabled: true, plans: { Free: false, Pro: true, Ultra: true, Enterprise: true } },
];

export const mockTransactions: Transaction[] = [
  { id: '1', userId: '1', userName: 'Nguyễn Văn An', amount: 400, plan: 'Enterprise', date: '2025-01-15', status: 'completed' },
  { id: '2', userId: '2', userName: 'Trần Thị Bình', amount: 20, plan: 'Pro', date: '2025-01-14', status: 'completed' },
  { id: '3', userId: '3', userName: 'Lê Hoàng Cường', amount: 40, plan: 'Ultra', date: '2025-01-14', status: 'completed' },
  { id: '4', userId: '6', userName: 'Võ Quốc Phong', amount: 400, plan: 'Enterprise', date: '2025-01-13', status: 'completed' },
  { id: '5', userId: '7', userName: 'Đặng Thùy Giang', amount: 40, plan: 'Ultra', date: '2025-01-13', status: 'pending' },
  { id: '6', userId: '9', userName: 'Ngô Anh Khoa', amount: 20, plan: 'Pro', date: '2025-01-12', status: 'completed' },
  { id: '7', userId: '10', userName: 'Lý Thị Linh', amount: 40, plan: 'Ultra', date: '2025-01-12', status: 'failed' },
  { id: '8', userId: '11', userName: 'Mai Hữu Nam', amount: 400, plan: 'Enterprise', date: '2025-01-11', status: 'completed' },
  { id: '9', userId: '12', userName: 'Trương Thị Oanh', amount: 20, plan: 'Pro', date: '2025-01-10', status: 'completed' },
];

export const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '2025-01-15T11:32:45', level: 'info', message: 'User login successful', source: 'auth-service', details: 'user_id=1, ip=103.45.67.89' },
  { id: '2', timestamp: '2025-01-15T11:30:12', level: 'warn', message: 'Rate limit approaching threshold', source: 'api-gateway', details: 'key=xc-prod-a1b2, usage=92%' },
  { id: '3', timestamp: '2025-01-15T11:28:03', level: 'error', message: 'OpenAI API timeout after 30s', source: 'provider-proxy', details: 'model=gpt-4o, request_id=req_abc123' },
  { id: '4', timestamp: '2025-01-15T11:25:18', level: 'info', message: 'New API key generated', source: 'key-service', details: 'key_name=CI/CD Pipeline, user_id=6' },
  { id: '5', timestamp: '2025-01-15T11:22:45', level: 'info', message: 'Model routing updated', source: 'model-router', details: 'chat: gpt-4o → claude-4-sonnet' },
  { id: '6', timestamp: '2025-01-15T11:20:00', level: 'warn', message: 'High error rate detected', source: 'monitoring', details: 'provider=deepseek, error_rate=4.5%' },
  { id: '7', timestamp: '2025-01-15T11:18:30', level: 'error', message: 'Database connection pool exhausted', source: 'db-service', details: 'pool_size=50, waiting=12' },
  { id: '8', timestamp: '2025-01-15T11:15:00', level: 'info', message: 'Feature flag updated', source: 'feature-service', details: 'browser_automation: disabled → enabled' },
  { id: '9', timestamp: '2025-01-15T11:12:22', level: 'info', message: 'Subscription upgraded', source: 'billing-service', details: 'user_id=5, Pro → Ultra' },
  { id: '10', timestamp: '2025-01-15T11:10:05', level: 'warn', message: 'Anthropic API degraded performance', source: 'health-check', details: 'latency=2400ms, threshold=1000ms' },
  { id: '11', timestamp: '2025-01-15T11:08:00', level: 'error', message: 'Payment processing failed', source: 'stripe-webhook', details: 'charge_id=ch_3xyz, reason=card_declined' },
  { id: '12', timestamp: '2025-01-15T11:05:30', level: 'info', message: 'Cache cleared successfully', source: 'cache-service', details: 'type=model-responses, entries=12450' },
  { id: '13', timestamp: '2025-01-15T11:02:15', level: 'info', message: 'Background agent task completed', source: 'agent-service', details: 'task_id=task_789, duration=45s' },
  { id: '14', timestamp: '2025-01-15T11:00:00', level: 'warn', message: 'SSL certificate expiring soon', source: 'cert-monitor', details: 'domain=api.x-cursor.dev, expires_in=14d' },
  { id: '15', timestamp: '2025-01-15T10:55:00', level: 'info', message: 'Batch token counting completed', source: 'usage-service', details: 'total_tokens=124M, period=24h' },
];

export const mockWeeklyApiCalls = [
  { date: 'Mon', apiCalls: 45200, tokens: 12400000 },
  { date: 'Tue', apiCalls: 52100, tokens: 14200000 },
  { date: 'Wed', apiCalls: 48900, tokens: 13100000 },
  { date: 'Thu', apiCalls: 61200, tokens: 16800000 },
  { date: 'Fri', apiCalls: 55800, tokens: 15200000 },
  { date: 'Sat', apiCalls: 32100, tokens: 8900000 },
  { date: 'Sun', apiCalls: 28400, tokens: 7600000 },
];

export const mockFeatureUsage = [
  { name: 'Chat', requests: 145000, percentage: 35 },
  { name: 'Composer', requests: 89000, percentage: 22 },
  { name: 'Tab Completion', requests: 78000, percentage: 19 },
  { name: 'Agent', requests: 45000, percentage: 11 },
  { name: 'Cmd+K', requests: 32000, percentage: 8 },
  { name: 'Background Agent', requests: 21000, percentage: 5 },
];

export const mockRevenueData = [
  { month: 'Jul', revenue: 42000 },
  { month: 'Aug', revenue: 48500 },
  { month: 'Sep', revenue: 51200 },
  { month: 'Oct', revenue: 55800 },
  { month: 'Nov', revenue: 62100 },
  { month: 'Dec', revenue: 68400 },
  { month: 'Jan', revenue: 74200 },
];

export const mockRecentActivity = [
  { id: '1', type: 'user_signup', message: 'Nguyễn Minh Tuấn signed up for Pro plan', time: '2 minutes ago' },
  { id: '2', type: 'api_alert', message: 'API rate limit reached for key xc-prod-***', time: '5 minutes ago' },
  { id: '3', type: 'provider_error', message: 'DeepSeek API returning 503 errors', time: '12 minutes ago' },
  { id: '4', type: 'billing', message: 'Enterprise invoice generated for Võ Quốc Phong', time: '18 minutes ago' },
  { id: '5', type: 'feature', message: 'Feature flag browser_automation enabled', time: '25 minutes ago' },
  { id: '6', type: 'model_update', message: 'New model gemini-2.5-pro added to rotation', time: '1 hour ago' },
  { id: '7', type: 'security', message: 'Failed login attempt from 185.220.101.xx', time: '2 hours ago' },
  { id: '8', type: 'user_upgrade', message: 'Lê Hoàng Cường upgraded from Pro to Ultra', time: '3 hours ago' },
];

export const mockModelUsage = [
  { name: 'gpt-4o', value: 520000, fill: 'hsl(252, 85%, 63%)' },
  { name: 'claude-4-sonnet', value: 420000, fill: 'hsl(173, 58%, 55%)' },
  { name: 'gpt-4o-mini', value: 380000, fill: 'hsl(43, 74%, 62%)' },
  { name: 'llama-3.3-70b', value: 340000, fill: 'hsl(330, 65%, 62%)' },
  { name: 'claude-3.5-haiku', value: 280000, fill: 'hsl(200, 80%, 60%)' },
  { name: 'Others', value: 410000, fill: 'hsl(228, 10%, 45%)' },
];

export const mockUserUsage = [
  { name: 'Mai Hữu Nam', apiCalls: 89000 },
  { name: 'Võ Quốc Phong', apiCalls: 67890 },
  { name: 'Nguyễn Văn An', apiCalls: 45230 },
  { name: 'Đặng Thùy Giang', apiCalls: 34500 },
  { name: 'Lê Hoàng Cường', apiCalls: 28750 },
  { name: 'Lý Thị Linh', apiCalls: 22100 },
  { name: 'Ngô Anh Khoa', apiCalls: 15600 },
  { name: 'Trần Thị Bình', apiCalls: 12840 },
];


// ============================================================
// 9router-inspired Enhanced Mock Data
// ============================================================

const now = new Date();
const futureDate = (minutes: number) => new Date(now.getTime() + minutes * 60000).toISOString();
const pastDate = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();
const pastHours = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

// Helper to build connections
function conn(
  id: string, name: string, provider: string, status: ConnectionStatus,
  opts: Partial<ProviderConnection> = {}
): ProviderConnection {
  return {
    id, connectionName: name, provider, status, isActive: status === 'connected',
    modelLocks: {}, totalRequests: 0, lastUsed: pastDate(5), errorCount: 0,
    priority: 1, proxyEnabled: false, ...opts,
  };
}

// ---- ENHANCED PROVIDERS (40+) ----

export const mockEnhancedProviders: AIProviderEnhanced[] = [
  // =============== FREE TIER (OAuth, no paid subscription) ===============
  {
    id: 'kiro', name: 'Kiro AI', slug: 'kiro', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 4, totalRequests: 34200, errorRate: 0.8, baseUrl: 'https://kiro.dev/api',
    icon: 'kiro', tier: 'free', authMethod: 'device-code', color: '#FF6B35', alias: 'kr',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('kiro-1', 'AWS Builder ID #1', 'kiro', 'connected', { totalRequests: 22100, priority: 1 }),
      conn('kiro-2', 'GitHub Login', 'kiro', 'connected', { totalRequests: 12100, priority: 2 }),
    ],
    oauthConfig: { clientId: 'dynamic', authUrl: 'https://oidc.us-east-1.amazonaws.com', tokenUrl: 'https://oidc.us-east-1.amazonaws.com/token', usePkce: false, scopes: ['codewhisperer:completions', 'codewhisperer:conversations'] },
    quotaSupported: true, deprecated: false, cooldownMs: 30000, maxRetries: 3,
  },
  {
    id: 'qwen', name: 'Qwen Code', slug: 'qwen', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 3, totalRequests: 18400, errorRate: 1.2, baseUrl: 'https://chat.qwen.ai/api',
    icon: 'qwen', tier: 'free', authMethod: 'device-code', color: '#10B981', alias: 'qw',
    serviceKinds: ['llm'], strategy: 'round-robin', stickyLimit: 3,
    connections: [
      conn('qwen-1', 'Qwen Account #1', 'qwen', 'connected', { totalRequests: 10200, priority: 1 }),
      conn('qwen-2', 'Qwen Account #2', 'qwen', 'cooldown', { totalRequests: 8200, priority: 2, modelLocks: { 'qwen3-coder-plus': futureDate(12) } }),
    ],
    oauthConfig: { clientId: 'f0304373b74a44d2b584a3fb70ca9e56', authUrl: 'https://chat.qwen.ai/api/v1/oauth2/device/code', tokenUrl: 'https://chat.qwen.ai/api/v1/oauth2/token', usePkce: true, scopes: [] },
    quotaSupported: false, deprecated: false, cooldownMs: 60000, maxRetries: 2,
  },
  {
    id: 'iflow', name: 'iFlow AI', slug: 'iflow', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 2, totalRequests: 8900, errorRate: 0.5, baseUrl: 'https://iflow.cn/api',
    icon: 'iflow', tier: 'free', authMethod: 'oauth-basic', color: '#6366F1', alias: 'if',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('iflow-1', 'iFlow Phone Login', 'iflow', 'connected', { totalRequests: 8900, priority: 1 }),
    ],
    oauthConfig: { clientId: '10009311001', authUrl: 'https://iflow.cn/oauth', tokenUrl: 'https://iflow.cn/oauth/token', usePkce: false, scopes: [] },
    quotaSupported: false, deprecated: false, cooldownMs: 30000, maxRetries: 2,
  },
  {
    id: 'opencode', name: 'OpenCode', slug: 'opencode', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 6, totalRequests: 5600, errorRate: 0.3, baseUrl: 'https://opencode.ai/zen/v1',
    icon: 'opencode', tier: 'free', authMethod: 'none', color: '#E87040', alias: 'oc',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('opencode-noauth', 'Public (No Auth)', 'opencode', 'connected', { totalRequests: 5600, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 1,
  },

  // =============== FREE-TIER (API key, has free tier) ===============
  {
    id: 'openrouter', name: 'OpenRouter', slug: 'openrouter', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 27, totalRequests: 142000, errorRate: 1.5, baseUrl: 'https://openrouter.ai/api/v1',
    icon: 'openrouter', tier: 'free-tier', authMethod: 'api-key', color: '#F97316', alias: 'openrouter',
    serviceKinds: ['llm', 'embedding', 'tts', 'imageToText'], strategy: 'round-robin', stickyLimit: 5,
    connections: [
      conn('or-1', 'OpenRouter Free Key', 'openrouter', 'connected', { totalRequests: 89000, priority: 1 }),
      conn('or-2', 'OpenRouter Paid Key', 'openrouter', 'connected', { totalRequests: 53000, priority: 2 }),
    ],
    freeModels: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-2-9b-it:free', 'mistralai/mistral-7b-instruct:free'],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'nvidia', name: 'NVIDIA NIM', slug: 'nvidia', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 8, totalRequests: 67000, errorRate: 0.9, baseUrl: 'https://integrate.api.nvidia.com/v1',
    icon: 'nvidia', tier: 'free-tier', authMethod: 'api-key', color: '#76B900', alias: 'nvidia',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('nv-1', 'NVIDIA Dev Key', 'nvidia', 'connected', { totalRequests: 67000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 2,
  },
  {
    id: 'ollama', name: 'Ollama Cloud', slug: 'ollama-cloud', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 12, totalRequests: 23000, errorRate: 2.1, baseUrl: 'https://ollama.com/api',
    icon: 'ollama', tier: 'free-tier', authMethod: 'api-key', color: '#ffffff', alias: 'ollama',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('ollama-1', 'Ollama Free Tier', 'ollama', 'connected', { totalRequests: 23000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 15000, maxRetries: 2,
  },
  {
    id: 'vertex', name: 'Vertex AI', slug: 'vertex', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 6, totalRequests: 45000, errorRate: 0.7, baseUrl: 'https://us-central1-aiplatform.googleapis.com',
    icon: 'vertex', tier: 'free-tier', authMethod: 'api-key', color: '#4285F4', alias: 'vx',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('vx-1', 'GCP Project #1', 'vertex', 'connected', { totalRequests: 45000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 15000, maxRetries: 3,
  },
  {
    id: 'gemini', name: 'Gemini', slug: 'gemini', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 5, totalRequests: 98000, errorRate: 0.6, baseUrl: 'https://generativelanguage.googleapis.com',
    icon: 'gemini', tier: 'free-tier', authMethod: 'api-key', color: '#4285F4', alias: 'gemini',
    serviceKinds: ['llm', 'embedding', 'image', 'imageToText', 'webSearch'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('gemini-1', 'Gemini Free API Key', 'gemini', 'connected', { totalRequests: 98000, priority: 1 }),
    ],
    freeModels: ['gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 3,
  },

  // =============== SUBSCRIPTION (OAuth/IDE) ===============
  {
    id: 'claude', name: 'Claude Code', slug: 'claude', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 4, totalRequests: 287000, errorRate: 0.4, baseUrl: 'https://api.anthropic.com',
    icon: 'claude', tier: 'subscription', authMethod: 'oauth-pkce', color: '#D97757', alias: 'cc',
    serviceKinds: ['llm'], strategy: 'round-robin', stickyLimit: 5,
    connections: [
      conn('cc-1', 'Claude Max #1', 'claude', 'connected', { totalRequests: 156000, priority: 1, expiresAt: futureDate(120) }),
      conn('cc-2', 'Claude Max #2', 'claude', 'connected', { totalRequests: 89000, priority: 2, expiresAt: futureDate(90) }),
      conn('cc-3', 'Claude Pro', 'claude', 'rate-limited', { totalRequests: 42000, priority: 3, errorCount: 2, modelLocks: { 'claude-opus-4': futureDate(45), 'claude-sonnet-4': futureDate(20) } }),
    ],
    oauthConfig: { clientId: '9d1c250a-e61b-44d9-88ed-5944d1962f5e', authUrl: 'https://claude.ai/oauth/authorize', tokenUrl: 'https://api.anthropic.com/v1/oauth/token', usePkce: true, scopes: [] },
    quotaSupported: true, deprecated: false, cooldownMs: 60000, maxRetries: 3,
  },
  {
    id: 'codex', name: 'OpenAI Codex', slug: 'codex', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 3, totalRequests: 112000, errorRate: 0.6, baseUrl: 'https://api.openai.com/v1',
    icon: 'codex', tier: 'subscription', authMethod: 'oauth-pkce', color: '#3B82F6', alias: 'cx',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('cx-1', 'Codex Pro Account', 'codex', 'connected', { totalRequests: 112000, priority: 1, expiresAt: futureDate(180) }),
    ],
    oauthConfig: { clientId: 'app_EMoamEEZ73f0CkXaXp7hrann', authUrl: 'https://auth.openai.com/oauth/authorize', tokenUrl: 'https://auth.openai.com/oauth/token', usePkce: true, scopes: [] },
    quotaSupported: true, deprecated: false, cooldownMs: 30000, maxRetries: 3,
  },
  {
    id: 'github', name: 'GitHub Copilot', slug: 'github', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 6, totalRequests: 345000, errorRate: 0.3, baseUrl: 'https://api.github.com/copilot_internal',
    icon: 'github', tier: 'subscription', authMethod: 'device-code', color: '#333333', alias: 'gh',
    serviceKinds: ['llm'], strategy: 'round-robin', stickyLimit: 5,
    connections: [
      conn('gh-1', 'Copilot Business #1', 'github', 'connected', { totalRequests: 198000, priority: 1 }),
      conn('gh-2', 'Copilot Individual', 'github', 'connected', { totalRequests: 147000, priority: 2 }),
    ],
    oauthConfig: { clientId: 'Iv1.b507a08c87ecfe98', authUrl: 'https://github.com/login/device/code', tokenUrl: 'https://github.com/login/oauth/access_token', usePkce: false, scopes: [] },
    quotaSupported: true, deprecated: false, cooldownMs: 30000, maxRetries: 3,
  },
  {
    id: 'cursor', name: 'Cursor IDE', slug: 'cursor', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 5, totalRequests: 234000, errorRate: 0.2, baseUrl: 'https://api2.cursor.sh',
    icon: 'cursor', tier: 'subscription', authMethod: 'token-import', color: '#00D4AA', alias: 'cu',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('cu-1', 'Cursor Ultra', 'cursor', 'connected', { totalRequests: 234000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 30000, maxRetries: 2,
  },
  {
    id: 'kilocode', name: 'Kilo Code', slug: 'kilocode', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 3, totalRequests: 28000, errorRate: 1.1, baseUrl: 'https://api.kilo.ai',
    icon: 'kilocode', tier: 'subscription', authMethod: 'device-code', color: '#FF6B35', alias: 'kc',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('kc-1', 'KiloCode Pro', 'kilocode', 'connected', { totalRequests: 28000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 30000, maxRetries: 2,
  },
  {
    id: 'cline', name: 'Cline', slug: 'cline', status: 'active', apiKeyConfigured: false,
    modelsAvailable: 4, totalRequests: 56000, errorRate: 0.9, baseUrl: 'https://app.cline.bot/api',
    icon: 'cline', tier: 'subscription', authMethod: 'oauth-basic', color: '#5B9BD5', alias: 'cl',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 3,
    connections: [
      conn('cl-1', 'Cline Pro', 'cline', 'connected', { totalRequests: 34000, priority: 1 }),
      conn('cl-2', 'Cline Team', 'cline', 'error', { totalRequests: 22000, priority: 2, errorCount: 5 }),
    ],
    oauthConfig: { clientId: '', authUrl: 'https://api.cline.bot/api/v1/auth/authorize', tokenUrl: 'https://api.cline.bot/api/v1/auth/token', usePkce: false, scopes: [] },
    quotaSupported: false, deprecated: false, cooldownMs: 30000, maxRetries: 2,
  },

  // =============== API-KEY (Standard providers) ===============
  {
    id: 'openai', name: 'OpenAI', slug: 'openai', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 12, totalRequests: 1250000, errorRate: 0.12, baseUrl: 'https://api.openai.com/v1',
    icon: 'openai', tier: 'api-key', authMethod: 'api-key', color: '#10A37F', alias: 'openai',
    serviceKinds: ['llm', 'embedding', 'tts', 'stt', 'image'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('openai-1', 'Production Key', 'openai', 'connected', { totalRequests: 890000, priority: 1 }),
      conn('openai-2', 'Backup Key', 'openai', 'connected', { totalRequests: 360000, priority: 2 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'anthropic', name: 'Anthropic', slug: 'anthropic', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 5, totalRequests: 890000, errorRate: 0.08, baseUrl: 'https://api.anthropic.com',
    icon: 'anthropic', tier: 'api-key', authMethod: 'api-key', color: '#D97757', alias: 'anthropic',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('anth-1', 'Anthropic Prod', 'anthropic', 'connected', { totalRequests: 890000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'deepseek', name: 'DeepSeek', slug: 'deepseek', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 4, totalRequests: 320000, errorRate: 0.22, baseUrl: 'https://api.deepseek.com/v1',
    icon: 'deepseek', tier: 'api-key', authMethod: 'api-key', color: '#0066FF', alias: 'ds',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('ds-1', 'DeepSeek API', 'deepseek', 'connected', { totalRequests: 320000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 3,
  },
  {
    id: 'groq', name: 'Groq', slug: 'groq', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 8, totalRequests: 560000, errorRate: 0.05, baseUrl: 'https://api.groq.com/openai/v1',
    icon: 'groq', tier: 'api-key', authMethod: 'api-key', color: '#F55036', alias: 'groq',
    serviceKinds: ['llm', 'stt'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('groq-1', 'Groq Free Key', 'groq', 'connected', { totalRequests: 560000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'xai', name: 'xAI (Grok)', slug: 'xai', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 3, totalRequests: 89000, errorRate: 0.4, baseUrl: 'https://api.x.ai/v1',
    icon: 'xai', tier: 'api-key', authMethod: 'api-key', color: '#1DA1F2', alias: 'xai',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('xai-1', 'xAI API Key', 'xai', 'connected', { totalRequests: 89000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 2,
  },
  {
    id: 'mistral', name: 'Mistral AI', slug: 'mistral', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 6, totalRequests: 180000, errorRate: 0.10, baseUrl: 'https://api.mistral.ai/v1',
    icon: 'mistral', tier: 'api-key', authMethod: 'api-key', color: '#FF7000', alias: 'mistral',
    serviceKinds: ['llm', 'embedding'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('mistral-1', 'Mistral Prod', 'mistral', 'connected', { totalRequests: 180000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'glm', name: 'GLM (Zhipu)', slug: 'glm', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 4, totalRequests: 45000, errorRate: 0.8, baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    icon: 'glm', tier: 'api-key', authMethod: 'api-key', color: '#4F46E5', alias: 'glm',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('glm-1', 'GLM API Key', 'glm', 'connected', { totalRequests: 45000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 2,
  },
  {
    id: 'minimax', name: 'MiniMax', slug: 'minimax', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 3, totalRequests: 32000, errorRate: 0.6, baseUrl: 'https://api.minimax.chat/v1',
    icon: 'minimax', tier: 'api-key', authMethod: 'api-key', color: '#FF4081', alias: 'minimax',
    serviceKinds: ['llm', 'tts', 'video', 'music'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('mm-1', 'MiniMax API Key', 'minimax', 'connected', { totalRequests: 32000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 2,
  },
  {
    id: 'together', name: 'Together AI', slug: 'together', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 15, totalRequests: 210000, errorRate: 0.3, baseUrl: 'https://api.together.xyz/v1',
    icon: 'together', tier: 'api-key', authMethod: 'api-key', color: '#0EA5E9', alias: 'together',
    serviceKinds: ['llm', 'embedding', 'image'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('tog-1', 'Together Key', 'together', 'connected', { totalRequests: 210000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'fireworks', name: 'Fireworks AI', slug: 'fireworks', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 10, totalRequests: 134000, errorRate: 0.4, baseUrl: 'https://api.fireworks.ai/inference/v1',
    icon: 'fireworks', tier: 'api-key', authMethod: 'api-key', color: '#FF6B2B', alias: 'fireworks',
    serviceKinds: ['llm', 'embedding'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('fw-1', 'Fireworks Key', 'fireworks', 'connected', { totalRequests: 134000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'cerebras', name: 'Cerebras', slug: 'cerebras', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 3, totalRequests: 78000, errorRate: 0.2, baseUrl: 'https://api.cerebras.ai/v1',
    icon: 'cerebras', tier: 'api-key', authMethod: 'api-key', color: '#E11D48', alias: 'cerebras',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('cb-1', 'Cerebras Key', 'cerebras', 'connected', { totalRequests: 78000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'cohere', name: 'Cohere', slug: 'cohere', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 4, totalRequests: 56000, errorRate: 0.5, baseUrl: 'https://api.cohere.ai/v2',
    icon: 'cohere', tier: 'api-key', authMethod: 'api-key', color: '#39594D', alias: 'cohere',
    serviceKinds: ['llm', 'embedding', 'webSearch'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('co-1', 'Cohere API Key', 'cohere', 'connected', { totalRequests: 56000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'perplexity', name: 'Perplexity', slug: 'perplexity', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 3, totalRequests: 67000, errorRate: 0.3, baseUrl: 'https://api.perplexity.ai',
    icon: 'perplexity', tier: 'api-key', authMethod: 'api-key', color: '#20B2AA', alias: 'perplexity',
    serviceKinds: ['llm', 'webSearch'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('pplx-1', 'Perplexity Key', 'perplexity', 'connected', { totalRequests: 67000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'siliconflow', name: 'SiliconFlow', slug: 'siliconflow', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 20, totalRequests: 89000, errorRate: 0.7, baseUrl: 'https://api.siliconflow.cn/v1',
    icon: 'siliconflow', tier: 'api-key', authMethod: 'api-key', color: '#7C3AED', alias: 'siliconflow',
    serviceKinds: ['llm', 'embedding', 'image'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('sf-1', 'SiliconFlow Key', 'siliconflow', 'connected', { totalRequests: 89000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'hyperbolic', name: 'Hyperbolic', slug: 'hyperbolic', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 8, totalRequests: 34000, errorRate: 1.0, baseUrl: 'https://api.hyperbolic.xyz/v1',
    icon: 'hyperbolic', tier: 'api-key', authMethod: 'api-key', color: '#8B5CF6', alias: 'hyperbolic',
    serviceKinds: ['llm', 'image'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('hyp-1', 'Hyperbolic Key', 'hyperbolic', 'connected', { totalRequests: 34000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 2,
  },
  {
    id: 'chutes', name: 'Chutes', slug: 'chutes', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 6, totalRequests: 22000, errorRate: 1.2, baseUrl: 'https://api.chutes.ai/v1',
    icon: 'chutes', tier: 'api-key', authMethod: 'api-key', color: '#06B6D4', alias: 'chutes',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('ch-1', 'Chutes Key', 'chutes', 'connected', { totalRequests: 22000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 2,
  },
  {
    id: 'nebius', name: 'Nebius AI', slug: 'nebius', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 5, totalRequests: 18000, errorRate: 0.6, baseUrl: 'https://api.studio.nebius.ai/v1',
    icon: 'nebius', tier: 'api-key', authMethod: 'api-key', color: '#2563EB', alias: 'nebius',
    serviceKinds: ['llm'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('neb-1', 'Nebius Key', 'nebius', 'connected', { totalRequests: 18000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 10000, maxRetries: 2,
  },

  // =============== MEDIA / SPEECH / SEARCH ===============
  {
    id: 'deepgram', name: 'Deepgram', slug: 'deepgram', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 3, totalRequests: 45000, errorRate: 0.2, baseUrl: 'https://api.deepgram.com/v1',
    icon: 'deepgram', tier: 'api-key', authMethod: 'api-key', color: '#13EF93', alias: 'deepgram',
    serviceKinds: ['stt', 'imageToText'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('dg-1', 'Deepgram Key', 'deepgram', 'connected', { totalRequests: 45000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'elevenlabs', name: 'ElevenLabs', slug: 'elevenlabs', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 4, totalRequests: 23000, errorRate: 0.3, baseUrl: 'https://api.elevenlabs.io/v1',
    icon: 'elevenlabs', tier: 'api-key', authMethod: 'api-key', color: '#000000', alias: 'elevenlabs',
    serviceKinds: ['tts'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('el-1', 'ElevenLabs Key', 'elevenlabs', 'connected', { totalRequests: 23000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 5000, maxRetries: 3,
  },
  {
    id: 'tavily', name: 'Tavily', slug: 'tavily', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 1, totalRequests: 67000, errorRate: 0.1, baseUrl: 'https://api.tavily.com',
    icon: 'tavily', tier: 'api-key', authMethod: 'api-key', color: '#9333EA', alias: 'tavily',
    serviceKinds: ['webSearch'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('tav-1', 'Tavily Key', 'tavily', 'connected', { totalRequests: 67000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 1000, maxRetries: 3,
  },
  {
    id: 'brave-search', name: 'Brave Search', slug: 'brave-search', status: 'active', apiKeyConfigured: true,
    modelsAvailable: 1, totalRequests: 34000, errorRate: 0.2, baseUrl: 'https://api.search.brave.com',
    icon: 'brave', tier: 'api-key', authMethod: 'api-key', color: '#FB542B', alias: 'brave-search',
    serviceKinds: ['webSearch'], strategy: 'fill-first', stickyLimit: 1,
    connections: [
      conn('brave-1', 'Brave API Key', 'brave-search', 'connected', { totalRequests: 34000, priority: 1 }),
    ],
    quotaSupported: false, deprecated: false, cooldownMs: 1000, maxRetries: 3,
  },
];

// ---- ENHANCED MODELS ----

export const mockEnhancedModels: AIModelEnhanced[] = [
  {
    id: 'em-1', name: 'claude-opus-4', provider: 'Anthropic', type: 'chat', contextWindow: 200000,
    pricingInput: 15, pricingOutput: 75, status: 'active', totalRequests: 89000,
    pricing: { input: 15, output: 75, cached: 3.75, reasoning: 15, cacheCreation: 18.75 },
    providerOverrides: { 'claude': { input: 0, output: 0 } },
    aliases: ['claude-4-opus', 'opus-4'], isFreeTier: false, maxOutputTokens: 32000,
  },
  {
    id: 'em-2', name: 'claude-sonnet-4', provider: 'Anthropic', type: 'chat', contextWindow: 200000,
    pricingInput: 3, pricingOutput: 15, status: 'active', totalRequests: 420000,
    pricing: { input: 3, output: 15, cached: 0.30, reasoning: 3, cacheCreation: 3.75 },
    providerOverrides: { 'claude': { input: 0, output: 0 }, 'github': { input: 0, output: 0 } },
    aliases: ['claude-4-sonnet', 'sonnet-4'], isFreeTier: false, maxOutputTokens: 64000,
  },
  {
    id: 'em-3', name: 'claude-haiku-4', provider: 'Anthropic', type: 'chat', contextWindow: 200000,
    pricingInput: 1, pricingOutput: 5, status: 'active', totalRequests: 280000,
    pricing: { input: 1, output: 5, cached: 0.10 },
    providerOverrides: {},
    aliases: ['haiku-4'], isFreeTier: false, maxOutputTokens: 16000,
  },
  {
    id: 'em-4', name: 'gpt-4o', provider: 'OpenAI', type: 'chat', contextWindow: 128000,
    pricingInput: 2.5, pricingOutput: 10, status: 'active', totalRequests: 520000,
    pricing: { input: 2.5, output: 10, cached: 1.25 },
    providerOverrides: { 'github': { input: 0, output: 0 } },
    aliases: ['4o'], isFreeTier: false, maxOutputTokens: 16384,
  },
  {
    id: 'em-5', name: 'gpt-4o-mini', provider: 'OpenAI', type: 'chat', contextWindow: 128000,
    pricingInput: 0.15, pricingOutput: 0.60, status: 'active', totalRequests: 380000,
    pricing: { input: 0.15, output: 0.60, cached: 0.075 },
    providerOverrides: {},
    aliases: ['4o-mini'], isFreeTier: false, maxOutputTokens: 16384,
  },
  {
    id: 'em-6', name: 'gpt-5', provider: 'OpenAI', type: 'chat', contextWindow: 200000,
    pricingInput: 3, pricingOutput: 12, status: 'active', totalRequests: 156000,
    pricing: { input: 3, output: 12, cached: 0.75, reasoning: 12 },
    providerOverrides: { 'github': { input: 1.75, output: 14 } },
    aliases: ['gpt5'], isFreeTier: false, maxOutputTokens: 32768,
  },
  {
    id: 'em-7', name: 'o1', provider: 'OpenAI', type: 'chat', contextWindow: 200000,
    pricingInput: 15, pricingOutput: 60, status: 'active', totalRequests: 45000,
    pricing: { input: 15, output: 60, cached: 7.5, reasoning: 60 },
    providerOverrides: {},
    aliases: [], isFreeTier: false, maxOutputTokens: 100000,
  },
  {
    id: 'em-8', name: 'gemini-2.5-pro', provider: 'Google AI', type: 'chat', contextWindow: 1000000,
    pricingInput: 2, pricingOutput: 12, status: 'active', totalRequests: 210000,
    pricing: { input: 2, output: 12, cached: 0.50 },
    providerOverrides: {},
    aliases: ['gemini-pro'], isFreeTier: false, maxOutputTokens: 65536,
  },
  {
    id: 'em-9', name: 'gemini-2.5-flash', provider: 'Google AI', type: 'chat', contextWindow: 1000000,
    pricingInput: 0.30, pricingOutput: 2.50, status: 'active', totalRequests: 190000,
    pricing: { input: 0.30, output: 2.50, cached: 0.075 },
    providerOverrides: {},
    aliases: ['gemini-flash'], isFreeTier: true, maxOutputTokens: 65536,
  },
  {
    id: 'em-10', name: 'deepseek-chat', provider: 'DeepSeek', type: 'chat', contextWindow: 128000,
    pricingInput: 0.28, pricingOutput: 0.42, status: 'active', totalRequests: 180000,
    pricing: { input: 0.28, output: 0.42, cached: 0.07 },
    providerOverrides: {},
    aliases: ['deepseek-v3'], isFreeTier: false, maxOutputTokens: 8192,
  },
  {
    id: 'em-11', name: 'deepseek-r1', provider: 'DeepSeek', type: 'chat', contextWindow: 128000,
    pricingInput: 0.75, pricingOutput: 3, status: 'active', totalRequests: 95000,
    pricing: { input: 0.75, output: 3, cached: 0.19, reasoning: 3 },
    providerOverrides: {},
    aliases: ['r1'], isFreeTier: false, maxOutputTokens: 8192,
  },
  {
    id: 'em-12', name: 'qwen3-coder-plus', provider: 'Qwen', type: 'chat', contextWindow: 131072,
    pricingInput: 1, pricingOutput: 4, status: 'active', totalRequests: 34000,
    pricing: { input: 1, output: 4 },
    providerOverrides: {},
    aliases: ['qwen-coder'], isFreeTier: true, maxOutputTokens: 16384,
  },
];

// ---- PROVIDER QUOTAS ----

export const mockProviderQuotas: ProviderQuota[] = [
  { providerId: 'claude', used: 342, limit: 500, resetAt: futureDate(240), period: 'daily' },
  { providerId: 'github', used: 1850, limit: 3000, resetAt: futureDate(360), period: 'daily' },
  { providerId: 'codex', used: 78, limit: 200, resetAt: futureDate(180), period: 'daily' },
  { providerId: 'kiro', used: 156, limit: 400, resetAt: futureDate(480), period: 'daily' },
  { providerId: 'openrouter', used: 180, limit: 200, resetAt: futureDate(120), period: 'daily' },
];

// ---- MODEL COMBOS ----

export const mockModelCombos: ModelCombo[] = [
  {
    id: 'combo-1', name: 'Smart Router',
    models: [
      { provider: 'claude', model: 'claude-sonnet-4', weight: 50 },
      { provider: 'github', model: 'gpt-4o', weight: 30 },
      { provider: 'openai', model: 'gpt-4o', weight: 20 },
    ],
    strategy: 'weighted', isActive: true,
  },
  {
    id: 'combo-2', name: 'Free Only',
    models: [
      { provider: 'kiro', model: 'claude-sonnet-4', weight: 1 },
      { provider: 'qwen', model: 'qwen3-coder-plus', weight: 1 },
      { provider: 'opencode', model: 'deepseek-r1', weight: 1 },
    ],
    strategy: 'round-robin', isActive: true,
  },
  {
    id: 'combo-3', name: 'Code Specialist',
    models: [
      { provider: 'claude', model: 'claude-sonnet-4', weight: 1 },
      { provider: 'codex', model: 'gpt-5', weight: 2 },
      { provider: 'cursor', model: 'claude-sonnet-4', weight: 3 },
    ],
    strategy: 'priority', isActive: true,
  },
  {
    id: 'combo-4', name: 'Budget Mix',
    models: [
      { provider: 'deepseek', model: 'deepseek-chat', weight: 40 },
      { provider: 'groq', model: 'llama-3.3-70b', weight: 30 },
      { provider: 'gemini', model: 'gemini-2.5-flash', weight: 30 },
    ],
    strategy: 'weighted', isActive: false,
  },
];

// ---- ROUTING RULES ----

export const mockRoutingRules: RoutingRule[] = [
  {
    id: 'rule-1', name: 'Default Fallback Chain',
    tiers: ['subscription', 'api-key', 'free-tier', 'free'],
    fallbackOrder: ['claude', 'codex', 'github', 'openai', 'anthropic', 'deepseek', 'openrouter', 'kiro', 'qwen'],
    isActive: true,
  },
  {
    id: 'rule-2', name: 'Free-First (Cost Saving)',
    tiers: ['free', 'free-tier', 'subscription', 'api-key'],
    fallbackOrder: ['kiro', 'qwen', 'opencode', 'openrouter', 'gemini', 'claude', 'github'],
    isActive: false,
  },
  {
    id: 'rule-3', name: 'Speed Priority',
    tiers: ['api-key', 'subscription', 'free-tier', 'free'],
    fallbackOrder: ['groq', 'cerebras', 'openai', 'anthropic', 'deepseek', 'claude', 'github'],
    isActive: false,
  },
];

// ---- REQUEST LOGS ----

export const mockRequestLogs: RequestLog[] = [
  { id: 'rl-1', timestamp: pastDate(2), provider: 'claude', model: 'claude-sonnet-4', tier: 'subscription', connectionId: 'cc-1', status: 'success', latencyMs: 1240, inputTokens: 2400, outputTokens: 860, cost: 0.0201 },
  { id: 'rl-2', timestamp: pastDate(5), provider: 'github', model: 'gpt-4o', tier: 'subscription', connectionId: 'gh-1', status: 'success', latencyMs: 980, inputTokens: 1800, outputTokens: 620, cost: 0 },
  { id: 'rl-3', timestamp: pastDate(8), provider: 'claude', model: 'claude-sonnet-4', tier: 'subscription', connectionId: 'cc-3', status: 'fallback', latencyMs: 30200, inputTokens: 3200, outputTokens: 0, cost: 0, errorMessage: 'Rate limited (429)', fallbackFrom: 'cc-3' },
  { id: 'rl-4', timestamp: pastDate(8), provider: 'claude', model: 'claude-sonnet-4', tier: 'subscription', connectionId: 'cc-1', status: 'success', latencyMs: 1580, inputTokens: 3200, outputTokens: 1240, cost: 0.0282 },
  { id: 'rl-5', timestamp: pastDate(12), provider: 'openai', model: 'gpt-4o', tier: 'api-key', connectionId: 'openai-1', status: 'success', latencyMs: 2100, inputTokens: 4500, outputTokens: 1800, cost: 0.0293 },
  { id: 'rl-6', timestamp: pastDate(15), provider: 'deepseek', model: 'deepseek-chat', tier: 'api-key', connectionId: 'ds-1', status: 'success', latencyMs: 3200, inputTokens: 6000, outputTokens: 2400, cost: 0.0028 },
  { id: 'rl-7', timestamp: pastDate(18), provider: 'kiro', model: 'claude-sonnet-4', tier: 'free', connectionId: 'kiro-1', status: 'success', latencyMs: 1890, inputTokens: 2000, outputTokens: 950, cost: 0 },
  { id: 'rl-8', timestamp: pastDate(22), provider: 'qwen', model: 'qwen3-coder-plus', tier: 'free', connectionId: 'qwen-1', status: 'error', latencyMs: 45000, inputTokens: 1500, outputTokens: 0, cost: 0, errorMessage: 'Timeout after 45s' },
  { id: 'rl-9', timestamp: pastDate(25), provider: 'groq', model: 'llama-3.3-70b', tier: 'api-key', connectionId: 'groq-1', status: 'success', latencyMs: 340, inputTokens: 1200, outputTokens: 400, cost: 0.0010 },
  { id: 'rl-10', timestamp: pastDate(30), provider: 'gemini', model: 'gemini-2.5-flash', tier: 'free-tier', connectionId: 'gemini-1', status: 'success', latencyMs: 890, inputTokens: 3000, outputTokens: 1100, cost: 0.0037 },
  { id: 'rl-11', timestamp: pastDate(35), provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free', tier: 'free-tier', connectionId: 'or-1', status: 'success', latencyMs: 2800, inputTokens: 2200, outputTokens: 800, cost: 0 },
  { id: 'rl-12', timestamp: pastDate(40), provider: 'claude', model: 'claude-opus-4', tier: 'subscription', connectionId: 'cc-1', status: 'success', latencyMs: 8400, inputTokens: 8000, outputTokens: 4200, cost: 0.183 },
  { id: 'rl-13', timestamp: pastDate(45), provider: 'codex', model: 'gpt-5', tier: 'subscription', connectionId: 'cx-1', status: 'success', latencyMs: 3200, inputTokens: 5000, outputTokens: 2000, cost: 0.039 },
  { id: 'rl-14', timestamp: pastDate(50), provider: 'mistral', model: 'mistral-large', tier: 'api-key', connectionId: 'mistral-1', status: 'success', latencyMs: 1650, inputTokens: 3000, outputTokens: 1200, cost: 0.0132 },
  { id: 'rl-15', timestamp: pastDate(55), provider: 'cline', model: 'claude-sonnet-4', tier: 'subscription', connectionId: 'cl-2', status: 'error', latencyMs: 5000, inputTokens: 2000, outputTokens: 0, cost: 0, errorMessage: 'Auth token expired' },
  { id: 'rl-16', timestamp: pastDate(60), provider: 'together', model: 'llama-3.3-70b', tier: 'api-key', connectionId: 'tog-1', status: 'success', latencyMs: 1200, inputTokens: 1800, outputTokens: 650, cost: 0.0016 },
  { id: 'rl-17', timestamp: pastHours(2), provider: 'cursor', model: 'claude-sonnet-4', tier: 'subscription', connectionId: 'cu-1', status: 'success', latencyMs: 1100, inputTokens: 2600, outputTokens: 920, cost: 0 },
  { id: 'rl-18', timestamp: pastHours(3), provider: 'nvidia', model: 'llama-3.1-405b', tier: 'free-tier', connectionId: 'nv-1', status: 'success', latencyMs: 4500, inputTokens: 4000, outputTokens: 1800, cost: 0 },
  { id: 'rl-19', timestamp: pastHours(4), provider: 'xai', model: 'grok-2', tier: 'api-key', connectionId: 'xai-1', status: 'success', latencyMs: 2300, inputTokens: 3500, outputTokens: 1400, cost: 0.024 },
  { id: 'rl-20', timestamp: pastHours(5), provider: 'opencode', model: 'deepseek-r1', tier: 'free', connectionId: 'opencode-noauth', status: 'fallback', latencyMs: 60000, inputTokens: 2000, outputTokens: 0, cost: 0, errorMessage: 'Service unavailable', fallbackFrom: 'opencode' },
];

// ---- COST CHART DATA ----

export const mockCostChartData = [
  { date: 'Mon', cost: 4.52, tokens: 12400000 },
  { date: 'Tue', cost: 5.18, tokens: 14200000 },
  { date: 'Wed', cost: 4.89, tokens: 13100000 },
  { date: 'Thu', cost: 6.12, tokens: 16800000 },
  { date: 'Fri', cost: 5.58, tokens: 15200000 },
  { date: 'Sat', cost: 3.21, tokens: 8900000 },
  { date: 'Sun', cost: 2.84, tokens: 7600000 },
];

// ---- PROVIDER USAGE BREAKDOWN ----

export const mockProviderUsageBreakdown = [
  { provider: 'Claude Code', requests: 287000, tokens: 42000000, cost: 126.50, color: '#D97757' },
  { provider: 'GitHub Copilot', requests: 345000, tokens: 38000000, cost: 0, color: '#333333' },
  { provider: 'OpenAI', requests: 1250000, tokens: 156000000, cost: 890.20, color: '#10A37F' },
  { provider: 'Cursor IDE', requests: 234000, tokens: 28000000, cost: 0, color: '#00D4AA' },
  { provider: 'DeepSeek', requests: 320000, tokens: 45000000, cost: 18.90, color: '#0066FF' },
  { provider: 'Groq', requests: 560000, tokens: 67000000, cost: 42.30, color: '#F55036' },
  { provider: 'Gemini', requests: 98000, tokens: 12000000, cost: 8.40, color: '#4285F4' },
  { provider: 'Kiro AI', requests: 34200, tokens: 4800000, cost: 0, color: '#FF6B35' },
];

// ---- TIER COLORS ----

export const tierColors: Record<ProviderTier, { bg: string; text: string; border: string }> = {
  'free': { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  'free-tier': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  'subscription': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  'api-key': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export const connectionStatusColors: Record<ConnectionStatus, string> = {
  'connected': 'bg-green-500',
  'disconnected': 'bg-gray-500',
  'error': 'bg-red-500',
  'rate-limited': 'bg-yellow-500',
  'cooldown': 'bg-yellow-500',
  'expired': 'bg-red-400',
};

// ---- TIER LABELS ----

export const tierLabels: Record<ProviderTier, string> = {
  'free': 'Free',
  'free-tier': 'Free Tier',
  'subscription': 'Subscription',
  'api-key': 'API Key',
};

// ---- SERVICE KIND LABELS ----

export const serviceKindLabels: Record<string, string> = {
  'llm': 'LLM',
  'embedding': 'Embedding',
  'tts': 'TTS',
  'stt': 'STT',
  'image': 'Image',
  'imageToText': 'Vision',
  'webSearch': 'Web Search',
  'webFetch': 'Web Fetch',
  'video': 'Video',
  'music': 'Music',
};
