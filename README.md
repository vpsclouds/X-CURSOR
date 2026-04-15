<div align="center">
  <h1>🚀 X-CURSOR</h1>
  <p><strong>AI-Powered IDE Platform with Management Dashboard</strong></p>
  <p>A comprehensive ecosystem combining a desktop AI code editor and an admin dashboard for managing users, API keys, quotas, and AI providers.</p>

  <br/>

  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tauri-2-orange?logo=tauri" alt="Tauri" />
  <img src="https://img.shields.io/badge/Tailwind-4-blue?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-5-purple?logo=vite" alt="Vite" />
</div>

---

## 📦 Project Structure

```
X-CURSOR/
├── dashboard/          # Admin Dashboard (React + Vite + Tailwind)
│   ├── src/
│   │   ├── pages/      # Dashboard pages (Users, API Keys, Providers, etc.)
│   │   ├── components/ # Reusable UI components
│   │   └── data/       # Mock data & types
│   └── ...
│
├── ide/                # Desktop IDE Application (Tauri + React)
│   ├── src/
│   │   ├── features/   # Feature modules (AI, Editor, Composer, Agent, etc.)
│   │   ├── lib/        # Cursor API client & utilities
│   │   └── ui/         # Shared UI components
│   ├── src-tauri/      # Rust backend (Tauri v2)
│   └── ...
│
└── docs/               # Documentation & API references
```

## 🎯 Features

### Dashboard (`/dashboard`)

| Feature | Description |
|---------|-------------|
| **User Management** | View, search, filter users by plan; manage roles & permissions |
| **API Key Management** | Create, revoke, rotate API keys; per-key usage stats |
| **AI Provider Config** | Configure OpenAI, Anthropic, Google, DeepSeek, Mistral, Groq, OpenRouter, Ollama |
| **Model Management** | Enable/disable models, set pricing, configure routing rules |
| **Quota & Usage** | Real-time usage monitoring, per-plan quota settings, hard/soft limits |
| **Billing** | Revenue overview, subscription breakdown, Stripe integration |
| **Feature Flags** | Toggle platform features per plan (Composer, Agent, YOLO, MCP, etc.) |
| **Logs & Monitoring** | Real-time logs, API request tracking, error monitoring |

### IDE (`/ide`)

| Feature | Description |
|---------|-------------|
| **AI Chat** | Multi-provider AI chat with streaming, context-aware responses |
| **Composer** | Multi-file AI editing with diff preview, accept/reject workflow |
| **Agent System** | Autonomous AI agent with 15+ tools (file ops, terminal, web search, MCP) |
| **Cursor Tab** | Intelligent inline code completion |
| **Cmd+K / Quick Edit** | Floating inline edit interface |
| **Background Agent** | Cloud-based async AI tasks |
| **Code Review** | AI-powered PR & diff review |
| **MCP Support** | Model Context Protocol server integration |
| **BYO API Keys** | Use your own API keys for any provider |

## 🔗 Cursor API Integration

X-CURSOR connects to the Cursor backend API infrastructure:

- **Main API**: `api2.cursor.sh` — Authentication, Dashboard, AI services
- **Chat/Completion**: `api3.cursor.sh` — Real-time AI chat and completions
- **Tab Completion**: `api4.cursor.sh` — Geo-routed inline completions
- **Agent**: `*.api5.cursor.sh` — Background agent (8 regional endpoints)
- **Indexing**: `repo42.cursor.sh` — Codebase indexing & retrieval

### Authentication
PKCE OAuth2 flow via `prod.authentication.cursor.sh` with token polling.

### Transport
gRPC-Web protocol via `@bufbuild/connect` with protobuf serialization.

## 🚀 Getting Started

### Dashboard

```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:5173
```

### IDE (Development)

```bash
cd ide
npm install
npm run tauri dev
```

### IDE (Build)

```bash
cd ide
npm run tauri build
```

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| Dashboard Frontend | React 18, TypeScript, Tailwind CSS, Recharts, shadcn/ui |
| IDE Frontend | React 18, TypeScript, Tailwind CSS, CodeMirror 6, Zustand |
| IDE Backend | Tauri v2 (Rust), SQLite |
| API Protocol | gRPC-Web, Protocol Buffers, Connect-RPC |
| Build Tool | Vite 5 |
| State Management | Zustand + Immer |

## 📚 Documentation

- [Cursor API Reference](docs/cursor-api-reference.md)
- [Cursor Features Analysis](docs/cursor-features-analysis.md)
- [Athas Architecture](docs/athas-analysis.md)

## 📝 License

AGPL-3.0 — See [LICENSE](LICENSE) for details.

---

<div align="center">
  <p><strong>X-CURSOR</strong> — Built with ❤️ by analyzing the best of Cursor IDE and Athas</p>
</div>
