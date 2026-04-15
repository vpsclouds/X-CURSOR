import type { User, ApiKey, AIProvider, AIModel, FeatureFlag, Transaction, LogEntry } from '../types';

// Dữ liệu người dùng mẫu
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

// Dữ liệu API key mẫu
export const mockApiKeys: ApiKey[] = [
  { id: '1', name: 'Production API', key: 'xc-prod-a1b2c3d4e5f6g7h8i9j0', createdAt: '2024-06-01', lastUsed: '2025-01-15T11:30:00', status: 'active', rateLimit: 10000, totalRequests: 2450000 },
  { id: '2', name: 'Staging Environment', key: 'xc-stag-k1l2m3n4o5p6q7r8s9t0', createdAt: '2024-08-15', lastUsed: '2025-01-15T10:00:00', status: 'active', rateLimit: 5000, totalRequests: 890000 },
  { id: '3', name: 'Development Local', key: 'xc-dev-u1v2w3x4y5z6a7b8c9d0', createdAt: '2024-09-20', lastUsed: '2025-01-14T18:45:00', status: 'active', rateLimit: 1000, totalRequests: 125000 },
  { id: '4', name: 'Legacy Integration', key: 'xc-leg-e1f2g3h4i5j6k7l8m9n0', createdAt: '2024-03-10', lastUsed: '2024-12-01T08:00:00', status: 'revoked', rateLimit: 2000, totalRequests: 450000 },
  { id: '5', name: 'Mobile App Key', key: 'xc-mob-o1p2q3r4s5t6u7v8w9x0', createdAt: '2024-11-01', lastUsed: '2025-01-15T09:20:00', status: 'active', rateLimit: 8000, totalRequests: 670000 },
  { id: '6', name: 'CI/CD Pipeline', key: 'xc-cicd-y1z2a3b4c5d6e7f8g9h0', createdAt: '2024-10-05', lastUsed: '2025-01-15T06:00:00', status: 'active', rateLimit: 3000, totalRequests: 340000 },
];

// Dữ liệu nhà cung cấp AI
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

// Dữ liệu mô hình AI
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

// Dữ liệu tính năng (feature flags)
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

// Dữ liệu giao dịch
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

// Dữ liệu nhật ký hệ thống
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

// Dữ liệu biểu đồ API calls 7 ngày gần nhất
export const mockWeeklyApiCalls = [
  { date: 'Mon', apiCalls: 45200, tokens: 12400000 },
  { date: 'Tue', apiCalls: 52100, tokens: 14200000 },
  { date: 'Wed', apiCalls: 48900, tokens: 13100000 },
  { date: 'Thu', apiCalls: 61200, tokens: 16800000 },
  { date: 'Fri', apiCalls: 55800, tokens: 15200000 },
  { date: 'Sat', apiCalls: 32100, tokens: 8900000 },
  { date: 'Sun', apiCalls: 28400, tokens: 7600000 },
];

// Dữ liệu sử dụng theo tính năng
export const mockFeatureUsage = [
  { name: 'Chat', requests: 145000, percentage: 35 },
  { name: 'Composer', requests: 89000, percentage: 22 },
  { name: 'Tab Completion', requests: 78000, percentage: 19 },
  { name: 'Agent', requests: 45000, percentage: 11 },
  { name: 'Cmd+K', requests: 32000, percentage: 8 },
  { name: 'Background Agent', requests: 21000, percentage: 5 },
];

// Dữ liệu doanh thu theo tháng
export const mockRevenueData = [
  { month: 'Jul', revenue: 42000 },
  { month: 'Aug', revenue: 48500 },
  { month: 'Sep', revenue: 51200 },
  { month: 'Oct', revenue: 55800 },
  { month: 'Nov', revenue: 62100 },
  { month: 'Dec', revenue: 68400 },
  { month: 'Jan', revenue: 74200 },
];

// Dữ liệu hoạt động gần đây
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

// Dữ liệu sử dụng theo mô hình (cho pie chart)
export const mockModelUsage = [
  { name: 'gpt-4o', value: 520000, fill: 'hsl(252, 85%, 63%)' },
  { name: 'claude-4-sonnet', value: 420000, fill: 'hsl(173, 58%, 55%)' },
  { name: 'gpt-4o-mini', value: 380000, fill: 'hsl(43, 74%, 62%)' },
  { name: 'llama-3.3-70b', value: 340000, fill: 'hsl(330, 65%, 62%)' },
  { name: 'claude-3.5-haiku', value: 280000, fill: 'hsl(200, 80%, 60%)' },
  { name: 'Others', value: 410000, fill: 'hsl(228, 10%, 45%)' },
];

// Dữ liệu sử dụng theo người dùng (top 8)
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
