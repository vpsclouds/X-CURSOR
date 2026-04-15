# Athas IDE — Comprehensive Feature Analysis

## Overview

Athas is a lightweight, cross-platform code editor built with **Tauri v2** (Rust backend) and **React 19** (TypeScript frontend). It targets desktop platforms (macOS, Windows, Linux) and combines a familiar IDE feature set with built-in AI agent integration via both direct HTTP APIs and a CLI-based Agent Client Protocol (ACP). Version: **0.4.5**, identifier `com.code.athas`. Licensed under AGPL-3.0.

---

## Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 19.2.1 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite (vite-plus) | 0.1.11 | Build tool |
| Tailwind CSS v4 | 4.1.17 | Styling |
| Zustand | 5.0.9 | State management |
| Immer | 10.2.0 | Immutable state updates |
| Radix UI / Base UI | Various | Headless UI primitives |
| class-variance-authority | 0.7.1 | Component variant system |
| Framer Motion | 12.34.3 | Animations |
| xterm.js (@xterm/xterm) | 5.5.0 | Terminal emulator |
| web-tree-sitter | 0.25.10 | Syntax highlighting via WASM parsers |
| vscode-languageserver-protocol | 3.17.5 | LSP types |
| pdfjs-dist | 5.4.296 | PDF rendering |
| Lucide React | 1.8.0 | Icons |
| Sonner | 2.0.7 | Toast notifications |
| @tanstack/react-virtual | 3.13.12 | Virtualised lists |
| use-debounce | 10.0.6 | Input debouncing |

### Backend (Rust crates)
| Crate | Purpose |
|---|---|
| `athas-ai` | ACP bridge: starts/manages CLI AI agents, streams events via Tauri events |
| `athas-database` | Multi-database driver: SQLite, DuckDB, PostgreSQL, MySQL, MongoDB, Redis |
| `athas-lsp` | Language Server Protocol client and manager |
| `athas-terminal` | PTY-based terminal management |
| `athas-version-control` | git2-based Git operations (diff, blame, staging, stash, branches, remotes, tags, worktrees) |
| `athas-github` | GitHub REST API client |
| `athas-remote` | SSH remote file operations and terminal |
| `athas-runtime` | Node.js / Bun runtime downloader and manager |
| `athas-tooling` | External tool installer and registry |
| `athas-extensions` | Extension installer and type definitions |
| `athas-project` | Project detection |

### Key Tauri Plugins Used
- `@tauri-apps/plugin-fs` — file system access
- `@tauri-apps/plugin-http` — bypass-CORS HTTP fetch for AI providers
- `@tauri-apps/plugin-store` — key-value persistence (used for settings)
- `@tauri-apps/plugin-shell` — shell commands
- `@tauri-apps/plugin-dialog` — native dialogs
- `@tauri-apps/plugin-updater` — auto-update (endpoint: GitHub releases)
- `@tauri-apps/plugin-deep-link` — `athas://` URL scheme

### Package Manager & Toolchain
- **Bun** 1.3.2 (package manager and runtime for scripts)
- **Rust** (edition 2024, via `rust-toolchain.toml`)
- **tree-sitter** parsers compiled to WASM for 30+ languages

---

## Complete Feature Directory List

Each directory under `src/features/` is a self-contained vertical slice (components, hooks, stores, types, utils).

| Feature Directory | Purpose |
|---|---|
| `ai` | Full AI integration: multi-provider HTTP chat, ACP CLI agent bridge, chat history, mentions, slash commands, session modes |
| `binary-viewer` | Renders non-text binary file content |
| `command-palette` | Fuzzy-search command launcher; also hosts theme and icon-theme selectors |
| `database` | GUI client for SQLite, DuckDB, PostgreSQL, MySQL, MongoDB, Redis with connection management |
| `diagnostics` | LSP diagnostics display panel; errors/warnings wired to editor gutter |
| `editor` | Core code editor: CodeMirror-like architecture with completions, diff view, minimap, gutter, HTML preview, Markdown, formatters, linters, LSP integration, tree-sitter parsing, snippets, history |
| `file-explorer` | File tree view with icons, git status badges, context menus |
| `file-system` | File system operations controller (open, create, rename, delete, move, drag-drop), project switching |
| `git` | Full Git UI: status, staged/unstaged diff, commit, stash, branch manager, blame gutter, inline diff, git-gutter |
| `github` | GitHub integration: pull requests, issues, Actions workflows viewed in sidebar |
| `global-search` | Full-text content search across the project (Rust-backed ripgrep-style search) |
| `image-editor` | Basic image editing canvas |
| `image-viewer` | Image preview panel |
| `keymaps` | Keyboard shortcut management: default bindings, custom overrides, command registration, display |
| `layout` | Main application shell: `MainLayout`, `ResizablePane`, `MainSidebar`, `BottomPane`, `Footer`, toast context |
| `onboarding` | First-run onboarding dialog flow |
| `panes` | Split-view pane system: split/unsplit, tabs per pane, keyboard navigation between panes |
| `pdf-viewer` | PDF rendering via pdf.js |
| `quick-open` | Fuzzy-search file opener (Cmd/Ctrl+P) |
| `references` | "Find all references" results pane (LSP-backed) |
| `remote` | SSH remote workspace support: file operations over SSH, remote terminal |
| `settings` | Settings store, dialog, all tab panels, persistence, font management, theme/icon-theme stores, update hooks |
| `tabs` | Tab bar for open buffers within a pane |
| `telemetry` | Optional telemetry service (disabled by default) |
| `terminal` | Integrated terminal: multiple sessions, shell profiles, xterm.js rendering, search, font configuration |
| `vim` | Vim modal editing mode: full keymap with motions, operators, actions, command bar, search bar, relative line numbers |
| `web-viewer` | In-app web browser pane (Tauri WebView or iframe) |
| `window` | Window chrome: custom title bar, menu bar, workspace tabs, project store, UI state, auth store, desktop sign-in |

---

## AI Integration Architecture

### Two Integration Paths

#### 1. Custom (HTTP API) — `AgentType: "custom"`
Direct streaming chat completions over HTTP. The `getChatCompletionStream` function in `src/features/ai/services/ai-chat-service.ts` orchestrates this flow:

1. Resolves provider and model from the static registry.
2. Fetches the stored API key via `ai-token-service` (backed by Tauri plugin-store).
3. Builds a system prompt incorporating workspace context (open buffers, selected files, project root).
4. Issues a streaming POST request — uses Tauri's `plugin-http` fetch for providers that block browser CORS (Anthropic, Gemini, Ollama), native `fetch` for others.
5. Streams delta chunks via `processStreamingResponse` → `onChunk` callback → updates Zustand store.

**Supported Providers (HTTP)**
| Provider | Default Model | API Base |
|---|---|---|
| Anthropic | claude-sonnet-4-6 | `https://api.anthropic.com/v1/messages` |
| OpenAI | gpt-4o | `https://api.openai.com/v1/chat/completions` |
| Google Gemini | gemini-2.5-pro | `https://generativelanguage.googleapis.com/v1beta/models` |
| xAI Grok | grok-4 | `https://api.x.ai/v1/chat/completions` |
| DeepSeek | deepseek-chat | `https://api.deepseek.com/chat/completions` |
| Mistral AI | mistral-large-3 | `https://api.mistral.ai/v1/chat/completions` |
| Qwen | qwen3.6-plus | DashScope API |
| OpenRouter | (all above re-routed) | `https://openrouter.ai/api/v1/chat/completions` |
| Ollama (local) | dynamic | `http://localhost:11434/v1/chat/completions` |

Each provider implements the abstract `AIProvider` class (`buildHeaders`, `buildPayload`, `validateApiKey`, optional `buildUrl`, optional `getModels`).

#### 2. ACP (Agent Client Protocol) — CLI Agents
For `AgentType` values: `claude-code`, `codex-cli`, `gemini-cli`, `kimi-cli`, `opencode`, `qwen-code`.

These agents run as external CLI processes managed by the Rust `athas-ai` crate. Communication goes through Tauri `invoke` commands and event subscriptions.

**Flow:**
1. `AcpStreamHandler.start()` calls `invoke("get_acp_status")` to check if the target agent is running.
2. If not running, calls `invoke("start_acp_agent", { agentId, workspacePath, sessionId })`. If the binary is missing and `canInstall` is true, automatically installs it via `invoke("install_acp_agent")`.
3. Sends the user message via `invoke("send_acp_prompt", { prompt })`.
4. Subscribes to Tauri event `"acp-event"` and dispatches typed `AcpEvent` variants:
   - `content_chunk` → text/image/resource streaming
   - `tool_start` / `tool_complete` → tool-use display
   - `permission_request` → permission approval UI
   - `session_complete` / `prompt_complete` → completion
   - `status_changed` → agent crash detection with reconnect flag
   - `session_mode_update` / `current_mode_update` → mode state sync
   - `slash_commands_update` → dynamic slash command list
   - `config_options_update` → session config sync
   - `ui_action` → agent-requested UI actions (open web viewer, open terminal)
5. Static methods on `AcpStreamHandler`: `cancelPrompt()`, `stopAgent()`, `respondToPermission()`.
6. 10-second inactivity timeout triggers completion; 60-second timeout on active tools triggers error.

**Agent session persistence:** Each `Chat` stores an `acpSessionId` in SQLite, enabling session continuity across app restarts.

### AI Chat Store (`useAIChatStore`)

Built with Zustand + Immer + persist middleware. Persists to localStorage only: `mode`, `outputStyle`, `selectedAgentId`, `sessionModeState`. Chat messages are persisted to **SQLite** via `ai-chat-history-service`.

**Key state:**
- `chats[]` — loaded from SQLite on startup
- `currentChatId` — active chat
- `selectedAgentId` — default agent for new chats
- `mode: "chat" | "plan"`
- `outputStyle: "default" | "explanatory" | "learning" | "custom"`
- `mentionState` — `@file` mention dropdown position/search/selection
- `slashCommandState` — `/command` dropdown for ACP slash commands
- `sessionModeState` — ACP session mode (agent-defined modes like "code", "ask")
- `sessionConfigOptions` — agent-defined config options
- `providerApiKeys` — Map of providerId → has-key boolean
- `streamingMessageId` — currently streaming message ID

### AI Components
- `AIChat` — root chat container
- `ChatInputBar` — textarea with mention/slash autocomplete overlays, image paste, send/stop controls
- `ChatMessage` — renders user/assistant messages with markdown, tool calls, images, resources, plan blocks
- `FileMentionDropdown` / `SlashCommandDropdown` — floating autocomplete panels
- `MarkdownRenderer` — DOMPurify-sanitised markdown with code block "Apply" buttons
- `ToolCallDisplay` / `PlanBlockDisplay` / `PlanStepDisplay` — structured agent output
- `AgentSelector` / `ProviderModelSelector` / `ModeSelector` / `AcpConfigSelector` / `ContextSelector` — chat header controls
- `AgentLauncher` — modal to launch ACP agents from the command palette
- `HistorySidebar` — slide-in chat history list
- `ProviderApiKeyModal` — API key entry with validation

---

## Layout Structure

### Component Hierarchy
```
App
└── MainLayout
    ├── CustomTitleBarWithSettings        (macOS overlay / native title bar toggle)
    ├── ResizablePane [left]              (sidebar OR AI chat, position-dependent)
    │   └── MainSidebar | AIChat
    ├── Main content column
    │   ├── SplitViewRoot                 (editor panes with tabs)
    │   └── BottomPane [optional]        (when terminalWidthMode === "editor")
    ├── ResizablePane [right]             (sidebar OR AI chat, position-dependent)
    │   └── MainSidebar | AIChat
    ├── BottomPane [full-width optional] (when terminalWidthMode === "full")
    │   ├── Terminal tabs
    │   ├── DiagnosticsPane
    │   └── ReferencesPane
    └── Footer                           (status bar)
    + Global overlays:
        QuickOpen, ContentGlobalSearch, VimCommandBar, VimSearchBar,
        CommandPalette, AgentLauncher, ProjectNameMenu,
        ThemeSelector, IconThemeSelector, ConnectionDialog, ExtensionDialogs
```

### Sidebar Position
Controlled by `settings.sidebarPosition`:
- `"left"` (default): sidebar on the left, AI chat on the right
- `"right"`: AI chat on the left, sidebar on the right

### MainSidebar Views
Tabs controlled by `useUIState()`:
- **Files** — `FileExplorerTree` (default)
- **Git** — `GitView` (when `coreFeatures.git` enabled)
- **GitHub** — `GitHubPRsView` (when `coreFeatures.github` enabled)
- **Extension views** — dynamically registered by extensions

### ResizablePane
Mouse-drag resize with configurable `widthKey` (persisted in settings), collapse threshold, and `onCollapse` callback. Supports both left and right positioning.

### BottomPane
Two modes via `terminalWidthMode`:
- `"editor"` — bottom pane appears below the editor split view only
- `"full"` — bottom pane spans the full window width

Contains: terminal tabs (xterm.js), Diagnostics, References. Height is user-resizable (min 200px, max 80% screen height).

### Footer (Status Bar)
Shows: git branch status (with branch manager dropdown), diagnostics count, AI chat toggle button, terminal toggle, extension panel button, settings button, update indicator, auto-complete usage, auth status.

---

## Settings Management

### Store Design
`useSettingsStore` (Zustand + Immer + combine) wraps `Settings` — a flat TypeScript interface with ~80 settings across categories: General, Editor, Terminal, UI, Theme, AI, Layout, Keyboard, Language, Features, Advanced, File Tree, Telemetry.

### Persistence
Settings are persisted via `@tauri-apps/plugin-store` (a key-value JSON store on disk). On write, changes are **debounced** via `debouncedSaveSettingsToStore`. On boot, `initializeSettingsStore()` reads from disk and calls `initializeSettings()` to hydrate the store. Settings can also be bulk-updated from JSON string (`updateSettingsFromJSON`).

### Side Effects
`applySettingSideEffect(key, value)` and `applySettingsSideEffects(settings)` handle immediate DOM/app-level reactions when settings change (e.g., applying CSS variables for fonts/theme).

### Settings Tabs
The settings dialog has vertical tabs:
General, Editor, Terminal, AI, Appearance, File Tree, Git, Language, Keyboard, Extensions, Database, Features, Account, Enterprise, Advanced.

### Key Default Settings
| Setting | Default | Notes |
|---|---|---|
| `theme` | `"athas-dark"` | Bundled themes: Catppuccin, Dracula, GitHub, Nord, One, Solarized, Tokyo Night, Vitesse, Ayu |
| `iconTheme` | `"material"` | Material, Minimal, Classic, Colorful Material, Compact, None |
| `fontFamily` | `"Geist Mono Variable"` | Geist fonts bundled via @fontsource-variable |
| `fontSize` | 14 | Editor font size |
| `aiProviderId` | `"anthropic"` | Default AI provider |
| `aiModelId` | `"claude-sonnet-4-6"` | Default AI model |
| `aiCompletion` | `true` | AI autocomplete |
| `aiAutocompleteModelId` | `"mistralai/devstral-small"` | Via OpenRouter |
| `vimMode` | `false` | Vim modal editing |
| `sidebarPosition` | `"left"` | Sidebar placement |
| `formatOnSave` | `false` | Auto-format |
| `telemetry` | `false` | Telemetry opt-in |

### Search
The settings store includes a built-in search system (`runSearch`) that scores all settings against a static `settingsSearchIndex` using token-based full-text matching with keyword boosting.

### Feature Flags (`coreFeatures`)
Individual features can be toggled on/off: `git`, `github`, `remote`, `terminal`, `search`, `diagnostics`, `aiChat`, `breadcrumbs`, `persistentCommands`. Enterprise mode adds extension allowlisting.

---

## API Layer Design

### `src/utils/api-base.ts`
Minimal utility that returns the base URL for Athas's own backend services:
- Default: `https://athas.dev`
- Override via `VITE_API_URL` env variable
- In production builds, local URLs (`localhost`, `127.0.0.1`) are blocked and fall back to the default
- Used by the Footer component for autocomplete usage stats and auth/subscription endpoints

### AI Provider HTTP Calls
- Uses Tauri's `plugin-http` `fetch` for Anthropic, Gemini, Ollama (CORS bypass)
- Uses browser `fetch` for OpenAI, OpenRouter, Grok, DeepSeek, Mistral, Qwen
- All AI calls are **streaming** (Server-Sent Events / chunked transfer)
- `processStreamingResponse` in `src/utils/stream-utils.ts` handles SSE parsing

### Tauri IPC
All Rust backend calls go through `invoke(commandName, args)` from `@tauri-apps/api/core`. Events flow via `listen("event-name", handler)`. Key commands include:
- `start_acp_agent`, `stop_acp_agent`, `send_acp_prompt`, `cancel_acp_prompt`
- `get_acp_status`, `get_available_agents`, `install_acp_agent`
- `respond_acp_permission`, `set_acp_session_mode`, `set_acp_session_config_option`
- Git, LSP, file system, terminal, database commands (defined in Rust)

### Tauri CSP
The `tauri.conf.json` CSP allows `connect-src` to: `localhost:3000`, `https://athas.dev`, `https://*.athas.dev`, `https://api.anthropic.com`, `https://api.openai.com`, `https://generativelanguage.googleapis.com`, `https://*.githubusercontent.com`. Other AI provider domains (OpenRouter, xAI, DeepSeek, etc.) are accessed via Tauri's native HTTP plugin, bypassing WebView CSP.

---

## Key UI Patterns

### Design System
- **Color tokens**: CSS variables like `--primary-bg`, `--secondary-bg`, `--text`, `--text-lighter`, `--border`, `--accent`, `--error`, `--hover`, `--selected` — all theme-driven
- **Component variants**: `class-variance-authority` (CVA) for `Button`, producing variants: `default`, `primary`, `secondary`, `ghost`, `outline`, `danger` × sizes `xs`, `sm`, `md`, `lg`, `icon-xs`, `icon-sm`, `icon-md`
- **Utility merge**: `cn()` = `clsx + tailwind-merge` for conditional class composition
- **Font sizing**: CSS variables `--app-ui-control-font-size`, `--app-ui-control-icon-size` scale all UI controls together via the `uiFontSize` setting

### Pane Primitives (`src/ui/pane.tsx`)
Standard header/title/chip/icon-button constants used across all feature panels for visual consistency:
- `PANE_HEADER_BASE` — flex row with bg-primary-bg
- `PANE_TITLE_BASE` — semi-bold text
- `PANE_CHIP_BASE` — small labeled chip with border
- `PaneIconButton` — secondary icon-sm button for panel action buttons

### UI Primitives (`src/ui/`)
`Button`, `Badge`, `Checkbox`, `Command`, `ContextMenu`, `Dialog`, `Dropdown`, `Input`, `Keybinding`, `NumberInput`, `Search`, `Select`, `Switch`, `Table`, `TableView`, `Tabs`, `Textarea`, `Toast`, `Toggle`, `Tooltip` — all custom-built on Radix UI / Base UI headless primitives.

### State Management Pattern
Every feature follows the same Zustand pattern:
1. Create store with `create()` + `immer()` middleware
2. Export typed selectors via `createSelectors()` utility (auto-generates `.use.fieldName()` selectors)
3. Actions are co-located with state in a single `create()` call
4. Cross-feature communication via direct store `.getState()` calls (not prop drilling)

### Drag and Drop
Folder/file drag-and-drop onto the main window handled in `MainLayout` via `useFileSystemFolderDrop`. An overlay indicator appears during drag. On drop, directories open as projects; files open as buffers.

### Tree-Sitter Syntax Highlighting
30+ language WASM parsers are loaded dynamically from `/public/tree-sitter/parsers/{lang}/parser.wasm` with corresponding `highlights.scm` query files. Languages include: Bash, C, C++, C#, CSS, Dart, Go, HTML, Java, JavaScript/TypeScript, JSON, Kotlin, Lua, Markdown, Objective-C, OCaml, PHP, Python, Ruby, Rust, Scala, SQL, Svelte, Swift, and more.

### Extension System
Extensions can register sidebar views, UI components, generative UI components, and dialogs. The frontend extension registry (`useExtensionViews`, `useExtensionStore`) integrates with the Rust `athas-extensions` crate for installation. Bundled themes and icon themes ship as extensions under `src/extensions/bundled/`.

---

## Rust Crate Summary

### `crates/ai` — ACP Bridge
Core Rust logic for AI agent management. Key modules:
- `acp/bridge.rs` — manages agent process lifecycle
- `acp/bridge_commands.rs` — Tauri command handlers
- `acp/bridge_init.rs` — agent initialization
- `acp/bridge_prompt.rs` — prompt dispatch
- `acp/client.rs` — ACP protocol client
- `acp/config.rs` — agent configuration
- `acp/terminal_state.rs` — terminal context for agents
- `acp/types.rs` — shared types
- `chat_history.rs` — SQLite-based chat persistence

### `crates/database` — Multi-Database Client
- `connection_manager.rs` — manages open connections
- `providers/sqlite.rs`, `duckdb.rs`, `postgres.rs`, `mysql.rs`, `mongodb.rs`, `redis_db.rs` — provider implementations
- `sql_common.rs` — shared SQL utilities

### `crates/version-control` — Git Operations
Full Git operation set via `git2`: blame, branch management, commits, diffs, hunk-level staging, remote operations, stash, status, tags, worktrees.

### `crates/lsp` — LSP Client
- `manager.rs` — multi-server lifecycle manager
- `client.rs` — JSON-RPC LSP client
- `config.rs` — per-language server configuration
- `types.rs` — LSP type wrappers
