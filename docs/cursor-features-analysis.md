# Cursor IDE — Unique Feature Analysis for X-CURSOR Porting

**Source:** Decompiled Cursor IDE at `/home/user/workspace/decompiled/`  
**Analysis Date:** 2025  
**Scope:** Extensions (`cursor-*`), workbench main bundle (`workbench.desktop.main.js`), product configuration

---

## Table of Contents

1. [AI Agent System](#1-ai-agent-system)
2. [Composer (Multi-file AI Editor)](#2-composer-multi-file-ai-editor)
3. [Background Agent / Cloud Agent](#3-background-agent--cloud-agent)
4. [Cursor Tab (AI Tab Completion)](#4-cursor-tab-ai-tab-completion)
5. [Cmd+K / Quick Edit (Inline Edit)](#5-cmdk--quick-edit-inline-edit)
6. [Shadow Workspace](#6-shadow-workspace)
7. [Codebase Indexing & Retrieval (RAG)](#7-codebase-indexing--retrieval-rag)
8. [Model Context Protocol (MCP)](#8-model-context-protocol-mcp)
9. [BugBot (AI Bug Detection)](#9-bugbot-ai-bug-detection)
10. [Browser Automation (Agent Browser)](#10-browser-automation-agent-browser)
11. [AI Commit Messages](#11-ai-commit-messages)
12. [Terminal AI (Generate in Terminal)](#12-terminal-ai-generate-in-terminal)
13. [Cursor Rules System](#13-cursor-rules-system)
14. [Cursor Skills & Agents Config](#14-cursor-skills--agents-config)
15. [Worktrees (Parallel Agent Tasks)](#15-worktrees-parallel-agent-tasks)
16. [Deep Linking System](#16-deep-linking-system)
17. [Real-time Socket Communication](#17-real-time-socket-communication)
18. [NDJSON Debug Ingest Server](#18-ndjson-debug-ingest-server)
19. [AI Code Review (PR & Diff Review)](#19-ai-code-review-pr--diff-review)
20. [Plan Mode (Structured Task Planning)](#20-plan-mode-structured-task-planning)
21. [Cursor Blame (AI-annotated Git Blame)](#21-cursor-blame-ai-annotated-git-blame)
22. [YOLO Mode (Autonomous Agent)](#22-yolo-mode-autonomous-agent)
23. [Sub-agent / Parallel Agent Orchestration](#23-sub-agent--parallel-agent-orchestration)
24. [Knowledge Base Tool](#24-knowledge-base-tool)
25. [WYSIWYG Markdown Chat](#25-wysiwyg-markdown-chat)
26. [Shared Chat Links](#26-shared-chat-links)
27. [Glass Mode Window](#27-glass-mode-window)
28. [Tinder Diff Editor](#28-tinder-diff-editor)
29. [Image Attachments in Chat](#29-image-attachments-in-chat)
30. [Usage / Billing Awareness in UI](#30-usage--billing-awareness-in-ui)
31. [Custom Model Configuration (BYO Keys)](#31-custom-model-configuration-byo-keys)
32. [Deep Search Tool](#32-deep-search-tool)
33. [Create Diagram Tool](#33-create-diagram-tool)
34. [Notepads](#34-notepads)
35. [Smart Review (Semantic Diff Review)](#35-smart-review-semantic-diff-review)
36. [Context Window Monitor](#36-context-window-monitor)
37. [Plugin / Hook System](#37-plugin--hook-system)

---

## Feature Detail Entries

---

### 1. AI Agent System

**Extension:** `cursor-agent-exec` (package: `cursor-agent-exec`, v0.0.1)  
**Priority:** HIGH

**Description:**  
The core agentic execution layer that runs AI-driven tool loops. The agent can read files, edit code, run terminal commands, grep codebases, browse the web, invoke MCP servers, and spawn sub-agents — all with user-configurable approval policies. An embedded sandbox binary optionally enforces network and filesystem restrictions on agent operations.

**How it works (technical brief):**  
- Activates on `*` events and uses Cursor's custom `cursor` API proposal.
- Implements a **tool execution loop**: the agent receives a list of `supportedTools`, decides which tool to call, and the extension executes it locally and streams results back.
- Supported tools (from the `ToolType` enum):
  - `READ_SEMSEARCH_FILES` — semantic codebase search
  - `RIPGREP_SEARCH` — fast regex/literal file search (ripgrep)
  - `READ_FILE`, `LIST_DIR`, `EDIT_FILE`, `FILE_SEARCH` — filesystem operations
  - `SEMANTIC_SEARCH_FULL` — full vector-based semantic search
  - `DELETE_FILE`, `REAPPLY` — file management
  - `RUN_TERMINAL_COMMAND_V2` — run shell commands
  - `FETCH_RULES` — fetch `.cursor/rules` context
  - `WEB_SEARCH` — live web search
  - `MCP` — call any registered MCP server tool
  - `SEARCH_SYMBOLS` — LSP symbol search
  - `BACKGROUND_COMPOSER_FOLLOWUP` — spawn background tasks
  - `KNOWLEDGE_BASE` — query attached knowledge docs
  - `FETCH_PULL_REQUEST` — read GitHub PR data
  - `DEEP_SEARCH` — deep multi-hop search
  - `CREATE_DIAGRAM` — generate Mermaid/visual diagrams
  - `FIX_LINTS` / `READ_LINTS` — auto-fix linter errors
- **Sandbox mode:** an optional binary (`sandboxBinaryPath`) wraps executions with network allowlist/denylist policies; `HARDCODED_NETWORK_DENYLIST` and `CURSOR_ALLOWED_WRITE_SUBDIRS` enforce safety.
- **Terminal execution service:** manages shell state (`BashState`, `initBashState`, `initZshState`, `initPowerShellState`), captures environment, and handles long-running processes.
- **Plugin hooks system:** scans for `.cursor/plugins/`, `.cursor/skills/`, `.claude/plugins/` directories and registers local plugins with hook callbacks.
- **YOLO mode:** when `enableYoloMode=true`, agent executes without per-action user approval (see feature #22).
- **MCP file system writer:** a dedicated `McpFileSystemWriter` handles file mutations requested by MCP servers with an optional snapshot provider.
- Communicates with Cursor backend via gRPC/protobuf to `api2.cursor.sh`.

**Cursor API services used:**
- `vscode.cursor` (proposed API)
- `cursor.getUseLegacyTerminalTool()`
- `cursor.checkFeatureGate()`
- `cursor.getMcpSnapshotPushEnabled()`
- gRPC: `aiserver.v1` and `agent.v1` protobuf services at `https://api2.cursor.sh`

---

### 2. Composer (Multi-file AI Editor)

**Source:** `workbench.desktop.main.js` (grep: `composer-*` CSS classes, composer command strings)  
**Priority:** HIGH

**Description:**  
Cursor's flagship multi-file AI editing panel. Users write a natural-language task; the AI generates, modifies, creates, and deletes files across the entire project in one conversation thread. Supports multiple chat modes: `Ask`, `Edit`, and `Agent`.

**How it works (technical brief):**  
- Rendered as a webview panel (custom React/Lexical editor inside) with id `cursor.composer`.
- **Modes:** `ask` (chat only), `edit` (inline multi-file diff generation), `agent` (full agentic loop with tool use).
- **Lexical-based rich text input** (`composer-lexical-display`): supports `@mention` tokens for files, symbols, docs, Git objects, URLs, folders, terminal selections, notepads.
- **Streaming diffs:** files are edited in a streamed fashion; each changed file shows a `composer-edit-file-ping-border` indicator. "Keep All" / "Reject All" buttons apply or revert all diffs atomically.
- **Checkpoint commits:** agent operations automatically create Git checkpoint commits (`checkpoint_commit_hash`) so partial work can be restored. Tracked in `bubbleCheckpoints`.
- **Context items:** the request payload carries `relevantFiles`, `notepads`, `toolResults`, `suggestedCodeBlocks`, `diffsForCompressingFiles`, `multiFileLinterErrors`, `diffHistories`, `editTrailContexts`, `capabilityContexts`.
- **Composer plan / Todos:** `CreatePlanParams` / `CreatePlanResult` — the AI can propose an explicit step-by-step plan with todo items before executing.
- **History & forking:** `composer-history-menu`, `composer.forkSharedChat` — sessions are persistent and can be forked.
- **Model selection:** per-session model switcher (`cursorai.action.switchToModel`, `cursorai.action.addModelToSwitcher`), max mode toggle, thinking mode.
- **Chime notification:** plays audio after long runs finish (`cursor.composer.shouldChimeAfterChatFinishes`, custom chime path `cursor.composer.customChimeSoundPath`).
- **Sub-composer:** `SUB_COMPOSER` context type — a composer can spawn nested composer sessions as sub-tasks.
- **Queue behavior:** `cursor.composer.queueMessageDefaultBehavior` — new messages can queue while agent is running.
- **Usage summary:** `cursor.composer.usageSummaryDisplay` shows token/request cost per session.
- **Infinite Composer Session:** dev command `workbench.action.startInfiniteComposerSession` / `stopInfiniteComposerSession` — loops the agent indefinitely for testing.

**Cursor API services used:**
- `composer.createNew`, `composer.focusComposer`, `Pgt="composer.createNew"`
- gRPC: `CreatePlanParams`, `CreatePlanStream`, `CreateDiagramStream`
- `cursor.composer.*` configuration namespace

---

### 3. Background Agent / Cloud Agent

**Extension:** `cursor-resolver` (remote authority resolver), `cursor-socket` (TCP/TLS transport)  
**Source:** `workbench.desktop.main.js` (grep: `background-composer`, `cloud-agent`)  
**Priority:** HIGH

**Description:**  
Runs long-horizon AI agent tasks asynchronously in a cloud VM (or local worktree), completely detached from the user's editor session. The user can close Cursor and the task continues. Results appear in a dedicated "Background Agent" sidebar panel.

**How it works (technical brief):**  
- **Remote authority:** `cursor-resolver` registers `onResolveRemoteAuthority:background-composer` — when a workspace is opened with authority `background-composer+*`, Cursor connects to a remote cloud VM running the agent.
- **Resource label:** workspaces opened by background agents show suffix `"cloud-agent"` in the title bar.
- **Transport:** `cursor-socket` provides TCP/TLS `SocketConnectionProvider` over the remote authority (`onResolveRemoteAuthority:background-composer`).
- **Setup flow:** `background-composer-setup-modal` UI guides user through GitHub auth, VM provisioning (`background-composer-setup-start-default-vm-step`, `background-composer-setup-start-testing-vm-step`).
- **Cloud agent panel:** `workbench.view.backgroundAgent` — shows running/completed tasks, each with status, logs, and "peek" view (`background-composer-peek`).
- **Deep link integration:** `cursor://anysphere.cursor-deeplink/background-agent/setup` opens setup modal; `cursor://anysphere.cursor-deeplink/settings/background-composer` opens settings.
- **Notification types:** `PLAN_EXECUTION`, `COMMIT_REMINDER`, `BACKGROUND_TASK_COMPLETION` trigger IDE notifications when background tasks reach milestones.
- **Cloud agent cache:** `cloudAgentCacheService`, `cloudAgentStorageService` — caches agent state locally.
- **Worktree max count:** `cursor.worktreeMaxCount`, `cursor.worktreeCleanupIntervalHours` — controls how many parallel background worktrees can exist.
- **Personal environment JSON:** `cursor.personalenvironmentjson` — user-defined environment variable overrides injected into cloud VMs.
- Feature gates: `cloud_agent_setup_v2`, `cloud_agent_checkout_convert_to_local`.

**Cursor API services used:**
- `vscode.resolvers` API proposal
- `cursor.registerSocketConnectionProvider()`
- gRPC: `agent.v1.SubagentStartRequestQuery`, cloud environment APIs

---

### 4. Cursor Tab (AI Tab Completion)

**Source:** `workbench.desktop.main.js` (grep: `cursorTab`, `tabPrediction`, `cursorPrediction`, `ghostText`)  
**Priority:** HIGH

**Description:**  
Cursor's proprietary inline code completion system (distinct from GitHub Copilot). Predicts multi-line, context-aware code edits and file navigations. Tab accepts the full prediction; partial acceptance is supported. Includes a "go-to-file" prediction that jumps to the most relevant next file.

**How it works (technical brief):**  
- **Prediction service:** `cursorPredictionService` — an injectable VS Code service backed by `HFn="cursorPrediction"`.
- **Ghost text rendering:** shown inline in the editor using the `ghostText` decoration system. The prediction is rendered as faded text at the cursor position.
- **Accept action:** `editor.action.acceptCursorTabSuggestion` (keybinding: Tab) — applies the full prediction.
- **Partial accept:** `cursor.cpp.enablePartialAccepts` — allows accepting word-by-word.
- **Go-to-file prediction:** `tabPredictionGoToFileVisibleKey` — when Cursor predicts the user should navigate to another file, it shows a ghost indicator for Tab-to-navigate.
- **Code preview prediction:** `tabPredictionCodePreviewVisibleKey` — shows a preview of what the target file will look like after the predicted edit.
- **Import prediction:** `importPredictionService` — separately handles auto-import suggestions.
- **Context:** `tabPrediction` uses the current file, recent edits, cursor position, and `cursorPredictionOptions` from config.
- **Accept tracking:** `tabsAcceptedRank`, `tabs_accepted_rank` — telemetry for measuring acceptance quality.
- **Feature flag:** `cursor.cpp.disabledLanguages` — disable Cursor Tab for specific languages.
- **Legacy terminal tool toggle:** `cursor.getUseLegacyTerminalTool()` — controls terminal tool behavior within Tab context.
- **Disable action:** `workbench.action.disableAutocompletes` — quick toggle off.

**Cursor API services used:**
- `vscode.cursor` (proposed API) — `cursorPredictionService`
- `cursor.cpp.*` configuration namespace
- `editor.action.acceptCursorTabSuggestion`

---

### 5. Cmd+K / Quick Edit (Inline Edit)

**Source:** `workbench.desktop.main.js` (grep: `cmdK`, `inlineChat`, `inlineEdit`)  
**Priority:** HIGH

**Description:**  
Cmd+K (or Ctrl+K) opens a floating prompt bar in the editor at the cursor position. The user types a natural-language instruction; the AI applies a targeted edit to the selected code or generates new code at the cursor. Supports diff preview, accept/reject, follow-up prompts, and history.

**How it works (technical brief):**  
- **Service:** `cmdKService` / `cmdKService2` / `cmdKStateService` — manages lifecycle of a Cmd+K session.
- **Context capture:** `cmdKCurrentFile`, `cmdKDefinitions`, `cmdKImmediateContext`, `cmdKSelection` — captures surrounding code, type definitions, and selected text.
- **Query history:** `cmdKQueryHistory`, `cmdKQueryHistoryInDiffSession` — persists past Cmd+K prompts per file.
- **Diff session:** the result is shown as a diff (`cmdKEscapeFocusesEditorOnDiff`) with inline Before/After blocks; the user can Accept or Reject.
- **Resolve conflicts via Cmd+K:** `cmdK.resolveConflictInCmdK` — Cmd+K can be triggered inside merge conflict blocks.
- **Clear prompt bar:** `cmdK.clearPromptBar` — keyboard shortcut to dismiss.
- **Themed diff background:** `cursor.cmdk.useThemedDiffBackground2` — visual option.
- **Inline multi-diff editor:** `cursor.editor.IInlineMultiDiffEditor` — allows multiple simultaneous Cmd+K diff blocks in a file.
- **Smooth streaming:** `cursor.chat.smoothStreaming` — streams the AI response progressively.
- **Terminal Cmd+K:** `cursorai.action.generateInTerminal` / `acceptGenerateInTerminal` / `acceptAndRunGenerateInTerminal` — Ctrl+K inside terminal generates a shell command inline.
- **Feedback:** `cursorai.action.reportBadCmdK`, `cursorai.action.reportGoodCmdK`.

**Cursor API services used:**
- `cmdKService`, `cmdKStateService`
- `cursor.cmdk.*` configuration namespace
- gRPC: `CmdKDebugInfo_PastThought`, `CmdKDebugInfo_CppFileDiffHistory` protobuf types

---

### 6. Shadow Workspace

**Extension:** `cursor-shadow-workspace` (v1.0.0)  
**Priority:** HIGH

**Description:**  
A hidden, background virtual workspace that runs language server diagnostics (type errors, lint errors) on speculatively-edited files — before the user accepts AI changes. This allows Cursor to pre-validate AI edits and surface compile errors or type errors in the AI's proposals.

**How it works (technical brief):**  
- **Shadow server:** a local Unix domain socket server (`ShadowWorkspaceLogger`, `socketPath`) provides a gRPC/Connect service for file operations inside the virtual workspace.
- **Shadow client:** connects via `createConnectTransport` to the shadow socket server using HTTP/1.1.
- **Virtual file system:** files edited by the AI are written into the shadow workspace; LSP diagnostics are computed there and returned as `Diagnostic` and `Lint` protobuf messages.
- **Browser extension:** has both a `./dist/extension` (workspace) and `./dist/browser/extension` (browser host) build — can run in remote environments.
- **Enabling:** `cursor.general.enableShadowWorkspace` — user-controllable toggle.
- **Multiple shadow workspaces:** `shadowWindowForWorkspaceId` — one shadow workspace per editor window.
- **Close command:** `shadow-workspace-close` — lifecycle management.
- **Protobuf types:** `Diagnostic`, `Diagnostic_DiagnosticSeverity`, `Diagnostic_RelatedInformation`, `Lint` — rich diagnostic data transferred between shadow and main workspace.
- Feature gate: `enable_ex_hs` (extended host shadow).

**Cursor API services used:**
- `vscode.cursor` (proposed API)
- Connect transport (gRPC-web) over Unix socket
- `cursor.general.enableShadowWorkspace` setting

---

### 7. Codebase Indexing & Retrieval (RAG)

**Extension:** `cursor-retrieval` (v0.0.1)  
**Priority:** HIGH

**Description:**  
Builds and maintains a semantic + keyword index of the user's entire codebase. This index is queried to inject highly relevant code snippets into AI prompts without requiring the user to manually `@mention` files. Supports `.cursorignore` and `.cursorindexingignore` files to control what gets indexed.

**How it works (technical brief):**  
- **Indexing pipeline:** crawls the workspace, chunks files into `ChunkType` blocks (`CODEBASE`, `LONG_FILE`, `DOCS`), computes embeddings, and uploads packfiles to the Cursor backend.
- **Vector search:** `SearchType.vector` — semantic similarity search using embedding vectors. `SearchType.keyword` — BM25 keyword search. Both types are surfaced as `READ_SEMSEARCH_FILES` and `SEMANTIC_SEARCH_FULL` agent tools.
- **Simhash fingerprinting:** `IndexingRetrievalLogger.info("Computed simhash vector of length: ")` — near-duplicate file detection to avoid re-indexing unchanged files.
- **GitHub integration:** `cursor-retrieval.canAttemptGithubLogin` — optionally uses a GitHub OAuth session to augment retrieval with private repo context.
- **Snapshot service:** `Cursor Snapshot Service` — tracks which commits have been indexed (`snapshot_commit_hash`). Uploads packfile chunks with content-hash-based deduplication.
- **Grep client:** `cursor.grepClient.debug` — fast ripgrep-backed local search integrated with retrieval.
- **Codebase telemetry:** `cursor.codebaseTelemetry.triggerSnapshot` — forces an immediate index snapshot upload.
- **Ignore files:** `.cursorignore` (privacy exclusions), `.cursorindexingignore` (indexing-only exclusions) are recognized as `ignore` language files with syntax support.
- **Global ignore list:** `cursor.general.globalCursorIgnoreList` — workspace-agnostic patterns to exclude.
- **Git graph indexing:** `cursor.general.gitGraphIndexing` — indexes Git commit history for richer context.
- **Feature gates:** `codebase_telemetry_v2`, `instant_grep_indexing`, `instant_grep_user_search`.
- **Specific model fields:** the retrieval system respects model-specific context field names: `["cmd-k", "background-composer", "composer", "composer-ensemble", "plan-execution"]`.

**Cursor API services used:**
- `vscode.textSearchProvider2` (proposed API)
- gRPC: `aiserver.v1.createPackfileUpload`, snapshot registration
- `cursor-retrieval.*` configuration namespace

---

### 8. Model Context Protocol (MCP)

**Extension:** `cursor-mcp` (v0.0.1)  
**Priority:** HIGH

**Description:**  
Full implementation of Anthropic's Model Context Protocol — allows the AI agent to call external tools, read resources, and get prompts from any MCP-compatible server. Supports `stdio`, `SSE`, and `streamableHttp` transports. Includes OAuth 2.0 authentication, automatic reconnection, and a UI chip for MCP tool calls in chat.

**How it works (technical brief):**  
- **Multi-transport:** `stdio` (local process), `SSE` (server-sent events), `streamableHttp` (HTTP/2 streaming) transports. Falls back from `streamableHttp` to `SSE` on error.
- **OAuth support:** fetches OAuth scopes from `/.well-known/oauth-authorization-server`; stores auth tokens per server identifier.
- **Client lifecycle:** `mcp.reloadClient` command — hot-reloads an MCP server without restarting Cursor. `mcp.updateStatus` — UI status updates (initializing, connected, error).
- **Tool caching:** `toolsCache`, `instructionsCache`, `resourcesCache` — AsyncCache with 24-hour TTL for server capabilities.
- **Snapshot synchronization:** `mcp_snapshot_synchronization` feature gate — syncs MCP server state with Cursor backend for cloud agents.
- **Structured logging:** `mcp_structured_logging`, `mcp_structured_logging_for_ui` — detailed per-server logs.
- **Team MCPs:** `team_mcps_in_ide` feature gate — org-level MCP server configurations shared across team members.
- **MCP browser chip:** `browser_mcp_chip` — visual indicator in the composer for active MCP tool calls.
- **Direct client tools:** `mcp_direct_client_tool_fetch` feature gate — bypasses the extension host for tool calls.
- **Meta MCP tool:** `meta_mcp_tool` feature gate — an MCP tool that can itself manage other MCP servers.
- **Deep link install:** `cursor://anysphere.cursor-deeplink/mcp/install` — one-click MCP server installation from browser.
- **MCP in agent:** `MCP=19` in the agent tool enum; tool calls show as `composer-mcp-tool-call-block` in the UI.
- **Config:** `cursor-mcp` contributes `configuration: {}` — server list stored in `.cursor/mcp.json` or VS Code settings.

**Cursor API services used:**
- `vscode.cursor` (proposed API)
- `mcp.reloadClient`, `mcp.updateStatus`, `workbench.action.openMCPSettings` commands
- `cursor-mcp.*` configuration namespace

---

### 9. BugBot (AI Bug Detection)

**Source:** `workbench.desktop.main.js` (1085+ matches for `bugbot`)  
**Priority:** HIGH

**Description:**  
An automated AI-powered bug detector that runs in the background (and can auto-run after each Composer session finishes). It annotates the editor with inline bug markers, shows a popover with explanation and fix button, and supports a "deep review" mode for more thorough analysis.

**How it works (technical brief):**  
- **Editor markers:** `bugbot_editor_markers` feature gate — injects inline diagnostic markers directly into the code editor (not just as chat messages).
- **Auto-run triggers:** `bugbot_autorun_killswitch`, `bugbot_editor_autorun_on_composer_finish` — BugBot can automatically run after each Agent/Composer session completes.
- **Playwright auto-run:** `playwright_autorun` feature gate — BugBot can also trigger Playwright browser tests to validate runtime behavior.
- **UI components:** `bugbot-comment-zone`, `bugbot-fix-button`, `bugbot-dismiss-button`, `bugbot-deep-review-row`, `bugbot-footer-left/right`, `bugbot-avatar`, `bugbot-reply-avatar`, `bugbot-mode-cell`, `bugbot-open-settings`, `bugbot-learn-more`.
- **Deep review popup:** `.bugbot-review-popup` — expanded analysis view with a detailed explanation of the issue.
- **BugBot panel command:** `cursor.openBugbotPane` — opens the BugBot side panel.
- **BugBot fix in Cursor (deeplink):** `cursor://anysphere.cursor-deeplink/createchat` — deeplink from GitHub/external triggers a BugBot fix session.
- **Run BugBot:** `cursor.runEditorBugbot` — manually trigger bug analysis on current file.
- **Semantic review:** `cursor.semanticReview.cachedData` — caches BugBot results per file state.
- **Smart review:** `enable_smart_review` (general code review), `enable_smart_review_pr` (PR-specific review) feature gates.
- **View:** `cursor.bugbot` — dedicated panel/view.
- **Auto-run protection:** `autoRunControls.disableMcpAutoRun` — prevents over-eager auto-runs.

**Cursor API services used:**
- `cursor.bugbot` view identifier
- `cursor.semanticReview.*` settings
- gRPC: semantic review backend at `api2.cursor.sh`

---

### 10. Browser Automation (Agent Browser)

**Extension:** `cursor-browser-automation` (v1.0.0, `extensionKind: ["ui"]`)  
**Priority:** HIGH

**Description:**  
An embedded browser that the AI agent can control — navigate to URLs, take screenshots, click elements, type text, run JavaScript, read console logs and network requests. Used by the agent to validate frontend changes, run end-to-end tests, and interact with web applications during development. Includes a headless mode for background agents.

**How it works (technical brief):**  
- **Browser view:** a webview-based browser embedded in the Cursor sidebar/panel. Commands:
  - `cursor.browserView.navigate`, `navigateWebview` — load a URL
  - `cursor.browserView.takeScreenshot`, `updateScreenshot` — visual capture
  - `cursor.browserView.executeJavaScript` — run JS in page context
  - `cursor.browserView.getConsoleLogs`, `getNetworkRequests` — read browser state
  - `cursor.browserView.click` (implicit via CDP) — element interaction
  - `cursor.browserView.sendCDPCommand` — raw Chrome DevTools Protocol access
  - `cursor.browserView.newTab`, `selectTab`, `listTabs`, `closeTab` — tab management
  - `cursor.browserView.newHeadlessTab`, `showHeadlessTab`, `isHeadless` — headless mode
  - `cursor.browserView.resize`, `setRecordingType`, `getRecordingType`
  - `cursor.browserView.setLocked`, `isLocked` — locks browser from user interaction when agent is controlling
  - `cursor.browserView.getURL`, `getTitle`, `goBack`, `goForward`, `reload`
  - `cursor.browserView.configureDialogHandling`
- **"Take Control" button:** when the agent locks the browser, user can click "Take Control" to unlock it.
- **Canvas server:** `cursor.browserAutomation.getCanvasUrl` — supports a live HTML canvas for agent-generated visualizations.
- **UI script injection:** `cursor.browserAutomation.reinjectUIScript` — re-injects accessibility helpers into the page.
- **Accessibility tree snapshot:** `buildPageSnapshot()` — builds a structured DOM accessibility snapshot for the AI to understand page layout.
- **ARIA utilities:** `BROWSER_UTILS` — injected JS helpers for accessibility tree traversal (`isElementHiddenForAria`).
- **Screenshot back-fill:** `cursor.browserAutomation.requestSnapshotBackfill` — retro-actively captures a screenshot after navigation.
- **Browser origin allowlist:** `cursor.browserOriginAllowlist.ensureNavigationAllowed` — security check before navigating.
- **Feature gate:** `show_browser_popup`, `use_ide_browser_script`.

**Cursor API services used:**
- `vscode.cursor` (proposed API, `extensionKind: ["ui"]`)
- Chrome DevTools Protocol (CDP) via webview
- `cursor.browserView.*`, `cursor.browserAutomation.*` commands

---

### 11. AI Commit Messages

**Extension:** `cursor-commits` (v0.0.1)  
**Priority:** MEDIUM

**Description:**  
One-click AI-generated Git commit messages. Analyzes the current staged diff and generates a conventional, descriptive commit message. Tracked for online metrics and usage analytics.

**How it works (technical brief):**  
- **Trigger command:** `cursor.generateGitCommitMessage` — calls Cursor backend with the current staged diff.
- **Extension dependency:** `vscode.git` — uses VS Code's built-in Git extension to access diff data.
- **Metrics tracking:** the extension name says "Tracks requests and commits for Cursor online metrics" — every AI commit message generation is tracked via `aiserver.v1` analytics.
- **Feature types:** `FeatureType.EDIT`, `FeatureType.GENERATE`, `FeatureType.INLINE_LONG_COMPLETION` — commit message is `GENERATE` type.
- **Context:** sends `SelectedGitDiff`, `SelectedGitCommit`, `SelectedGitDiffFromBranchToMain` protobuf context objects to the backend.
- **Workers:** `worker/` directory suggests a Web Worker for background diff processing.

**Cursor API services used:**
- `vscode.git` extension API
- gRPC: `aiserver.v1` generate endpoint at `api2.cursor.sh`
- `cursor.generateGitCommitMessage` command

---

### 12. Terminal AI (Generate in Terminal)

**Source:** `workbench.desktop.main.js` (grep: `generateInTerminal`, `terminal.enableAiChecks`)  
**Priority:** HIGH

**Description:**  
Ctrl+K inside the integrated terminal generates a shell command based on natural language. The AI understands the current shell context (working directory, recent output). Accepts or runs the generated command. Also includes AI-powered terminal output analysis ("AI Checks").

**How it works (technical brief):**  
- **Trigger:** `cursorai.action.generateInTerminal` — Ctrl+K in terminal opens an inline prompt overlay.
- **Accept only:** `cursorai.action.acceptGenerateInTerminal` — pastes the generated command into the terminal prompt.
- **Accept and run:** `cursorai.action.acceptAndRunGenerateInTerminal` — immediately executes the generated command.
- **Hide/cancel:** `cursorai.action.hideGenerateInTerminal`, `cursorai.action.cancelGenerateInTerminal`.
- **Preview box:** `cursor.terminal.usePreviewBox` — shows a floating preview before execution.
- **AI checks:** `cursor.terminal.enableAiChecks` — monitors terminal output for errors and offers AI-powered fixes.
- **Terminals as files:** `terminals_are_files` feature gate — agent can read/write terminal streams as if they were files (`WriteShellStdinSuccess`, `shellId`, `terminalFileLengthBeforeInputWritten`).
- **Terminal execution service v2:** `terminal_execution_service_2` feature gate — improved terminal interaction for agent.
- **IDE shell exec:** `terminal_ide_shell_exec` feature gate — direct shell command execution path.
- **External terminal tracking:** `external_terminal_tracking` feature gate — tracks commands run in external terminals.

**Cursor API services used:**
- `cursorai.action.generateInTerminal` command
- `cursor.terminal.*` configuration namespace
- gRPC: same `aiserver.v1` as Cmd+K

---

### 13. Cursor Rules System

**Source:** `workbench.desktop.main.js`, `cursor-retrieval` extension  
**Priority:** HIGH

**Description:**  
Project-level and user-level AI behavior rules stored in `.cursor/rules/`. Rules are always injected into AI context and can constrain or guide how the AI responds (coding style, project conventions, forbidden patterns). Rules v2 supports per-file matching with glob patterns.

**How it works (technical brief):**  
- **Rule files:** stored at `.cursor/rules/` (workspace) and user-level rules directory. `.cursor/rules` is watched for changes.
- **Rule matching:** `matching_cursor_rules` field in AI request proto — rules are filtered by `glob` patterns against the files being edited. Only matching rules are sent.
- **Rules v2:** `rules_v2` feature gate — updated format with richer matching capabilities.
- **FETCH_RULES tool:** `FETCH_RULES=16` in agent tool enum — agent can explicitly fetch applicable rules during execution.
- **Legacy conversion:** `cursor.rules.convertLegacyAgentAppliedRules` — migrates old `.cursorrules` format to new `.cursor/rules/` structure.
- **Generate rules from selection:** `cursor.createRuleFromSelection` — select code in editor and auto-generate a rule from it.
- **Open created rule:** `cursor.openCreatedRule` — navigates to a newly created rule file.
- **Rules generation prompt:** `use_generate_rules_prompt` proto field — special prompt path for rule generation.
- **Worktree-textmate syntax:** `.cursor/worktrees/**/*.{ts,tsx,js,jsx,py,go,rs,...}` files get TextMate syntax highlighting (no LSP) — indicating rules and worktrees share the `.cursor/` config directory.

**Cursor API services used:**
- `cursor.rules.*` settings
- `cursor.createRuleFromSelection` command
- gRPC: `matching_cursor_rules` in `aiserver.v1` request protos

---

### 14. Cursor Skills & Agents Config

**Source:** `workbench.desktop.main.js` (grep: `skills`, `agents`, `.cursor/agents`)  
**Priority:** MEDIUM

**Description:**  
`.cursor/skills/` and `.cursor/agents/` directories allow users to define reusable AI skills (prompt templates/instructions) and named agents with specific configurations. Skills can be referenced in prompts; agents have dedicated configurations including tool permissions and model preferences.

**How it works (technical brief):**  
- **Skills paths:** `kzp=[".cursor/skills/",".cursor/skills-cursor/",".cursor/cloud-skills/",".cursor/plugins/",".claude/skills/",".claude/plugins/",".codex/skills/",".agents/skills/"]` — multiple compatible directories for portability.
- **Agents config:** `dlu=Gnt("**/.cursor/agents/**")` — glob watcher for agent config files.
- **Plugin system:** `LocalPluginCommandsService`, `LocalPluginHooksService` — skills can expose commands and hooks.
- **Plugin marketplace:** `marketplaces_enabled` feature gate, `enable_cc_plugin_import`, `enable_local_3p_plugin_imports` — skills/plugins can be installed from a marketplace.
- **Plugin nudge:** `enable_plugin_nudge` — prompts users to install relevant plugins.
- **Plugin approval:** `submitPluginForApproval`, `approvePlugin` — team-level plugin governance.
- **Skills recently used:** `cursor.skills.recentlyUsed`, `cursor.subagents.recentlyUsed` — MRU tracking.
- **Sync built-in skills:** `syncBuiltinSkills` function in agent-exec — syncs Cursor's built-in skill templates.
- **Hooks:** skills can define `hooks.config` with `hooksCount` tracked in telemetry.
- **MCP servers in skills:** `mcpConfig.mcpServers` from skill config — skills can bundle MCP server definitions.

**Cursor API services used:**
- `cursor.skills.*`, `cursor.subagents.*` settings
- `agent.v1.SubagentStartRequestQuery` — `subagentType`, `task`, `parentConversationId`, `isParallelWorker`

---

### 15. Worktrees (Parallel Agent Tasks)

**Extension:** `cursor-worktree-textmate` + `workbench.desktop.main.js`  
**Priority:** MEDIUM

**Description:**  
Cursor's parallel agent task system using Git worktrees. Multiple agent sessions can run simultaneously in isolated worktrees, each in a separate directory. TextMate syntax highlighting is provided for code files inside worktrees without activating full LSPs (for performance).

**How it works (technical brief):**  
- **Worktree TextMate extension:** registers `worktree-typescript`, `worktree-python`, `worktree-go`, `worktree-rust`, `worktree-javascript`, `worktree-java`, `worktree-c`, `worktree-cpp`, `worktree-css`, `worktree-html`, `worktree-json`, `worktree-php`, `worktree-ruby`, `worktree-sql`, `worktree-swift`, `worktree-terraform-*`, `worktree-protobuf` language IDs for `**/.cursor/worktrees/**/*` glob patterns.
- **Syntax only:** `description: "Provides TextMate-only syntax highlighting for .cursor/worktrees files without activating language servers"` — avoids expensive LSP instances per worktree.
- **Settings:** `cursor.worktreeMaxCount` — cap on parallel worktrees, `cursor.worktreeCleanupIntervalHours` — GC interval.
- **Parallel agents disabled recommender:** `cursor.localParallelAgentsDisableRecommender` — can disable the suggestion to use parallel worktrees.
- **Worktrees docs:** `https://cursor.com/docs/configuration/worktrees` hardcoded in workbench.
- **Worktrees setup:** `cursor.worktreesSetup` — onboarding flow for first-time use.
- **CURSOR_WORKTREES_GLOB:** constant in agent-exec for fast glob matching.

**Cursor API services used:**
- `cursor.worktree*` settings
- Git worktree filesystem APIs

---

### 16. Deep Linking System

**Extension:** `cursor-deeplink` (v0.0.1)  
**Priority:** MEDIUM

**Description:**  
URI handler system that enables external applications (browsers, CI systems, GitHub) to deep-link into specific Cursor features. Links open Cursor to specific panels, trigger chats, install MCPs, open PR reviews, and initiate background agent tasks.

**How it works (technical brief):**  
- **URI handler:** `vscode.window.registerUriHandler` handles `cursor://anysphere.cursor-deeplink/*` URIs.
- **Supported paths:**
  - `/createchat` — opens a BugBot fix chat with pre-populated context
  - `/mcp/install` — installs an MCP server from a URL
  - `/pr-review` — opens PR review view
  - `/prompt` — opens Composer with a pre-filled prompt
  - `/rule` — creates a new Cursor rule
  - `/command` — creates a new `.cursor/commands/` entry (name + content params)
  - `/settings` — opens Cursor settings
  - `/settings/background-composer` — opens background agent settings
  - `/settings/plugins` — opens plugin settings
  - `/background-agent/setup` — opens background agent setup modal
  - `/background-agent` — opens background agent view
- **Versioning:** `SUPPORTED_PAYLOAD_VERSIONS` — deeplinks include a version number; old versions show "This deeplink format is no longer supported."
- **Debug command:** `cursor-deeplink.debug.triggerDeeplink` (developer mode only) — test any deeplink by entering a URL.

**Cursor API services used:**
- `vscode.externalUriOpener` (proposed API)
- `vscode.cursor` (proposed API)
- `cursor-deeplink.debug.triggerDeeplink` command

---

### 17. Real-time Socket Communication

**Extension:** `cursor-socket` (v0.0.1, `extensionKind: ["ui"]`)  
**Priority:** MEDIUM

**Description:**  
A lightweight TCP/TLS socket connection provider that bridges the Cursor UI extension host to remote Cursor services (especially the Background Agent remote authority). Provides reliable, low-latency bidirectional streaming for agent communication.

**How it works (technical brief):**  
- **Socket provider:** `cursor.registerSocketConnectionProvider({ provideConnection: async (e) => ... })` — registered with Cursor's custom socket API.
- **TCP/TLS:** creates a `net.connect()` / `tls.connect()` socket based on options, with event emitters for `onDidReceiveData`, `onDidClose`.
- **Connection identifier:** each connection gets an auto-incrementing ID for logging (`[socket ${t}]`).
- **Event interface:** `send(data)`, `close()`, `onDidReceiveData.event`, `onDidClose.event` — standard duplex stream interface.
- **Server mode:** also implements a server socket (`onDidAccept`, `write(e, t)`, `onDidCloseConnection`) for local-listening use cases.
- **Remote authority activation:** `onResolveRemoteAuthority:background-composer` — the socket extension activates specifically to provide transport for background agent remote workspaces.

**Cursor API services used:**
- `vscode.cursor` (proposed API, `cursorNoDeps`)
- `cursor.registerSocketConnectionProvider()` — Cursor-specific API

---

### 18. NDJSON Debug Ingest Server

**Extension:** `cursor-ndjson-ingest` (v0.0.1)  
**Priority:** LOW

**Description:**  
A local HTTP server that accepts NDJSON (newline-delimited JSON) log streams and writes them to `.cursor/debug.log`. Used by agents and external tools to stream structured debug logs into the IDE for inspection.

**How it works (technical brief):**  
- **HTTP server:** binds to `127.0.0.1` (configurable) on a port auto-allocated in range 7242–7942 (`ndjson.port` config).
- **Security warning:** explicitly warns that binding to `0.0.0.0` exposes the endpoint to the network.
- **Commands:**
  - `cursor.ndjsonIngest.start` — starts the server
  - `cursor.ndjsonIngest.stop` — stops the server
  - `cursor.ndjsonIngest.copyCurl` — copies a curl command to test the endpoint
  - `cursor.ndjsonIngest.showStatus` — shows port and status
- **Log output:** writes to `workspace/.cursor/debug.log`.
- **Use case:** background agents running in cloud VMs stream their structured logs back to the developer's IDE via this endpoint.

**Cursor API services used:**
- None (self-contained HTTP server)
- `cursor.ndjsonIngest.*` command namespace

---

### 19. AI Code Review (PR & Diff Review)

**Source:** `workbench.desktop.main.js` (grep: `reviewPr`, `reviewChanges`, `semanticReview`, `smart_review`)  
**Priority:** HIGH

**Description:**  
AI-powered review of staged diffs and entire pull requests. Shows inline review comments, suggested fixes, and a summary. Can be triggered on the current diff or fetched from GitHub PRs. Includes "smart review" for semantic code understanding and PR review via the `FETCH_PULL_REQUEST` agent tool.

**How it works (technical brief):**  
- **Views:** `cursor.reviewchanges` (staged diff review), `cursor.reviewpr` (PR review), `cursor.allpullrequests` (PR list in sidebar).
- **GitHub PR sidebar:** `github_prs_in_sidebar` feature gate — PR list integrated into source control.
- **FETCH_PULL_REQUEST tool:** `FETCH_PULL_REQUEST=26` in agent tool enum — agent can fetch full PR data including diff, comments, status.
- **Smart review:** `enable_smart_review` (inline diff), `enable_smart_review_pr` (PR-level) — semantic analysis beyond line-level diffs.
- **Semantic review cache:** `cursor.semanticReview.cachedData` — caches review results per file state hash.
- **Review comments UI:** `bugbot-comment-zone`, `bugbot-comment-content`, `bugbot-comment-header`, `bugbot-reply-avatar` — shared with BugBot UI.
- **Diff review speed:** `review_changes_fast_multi_diff` feature gate — faster multi-file diff rendering.
- **Semantic search in commits:** `cursor.semanticSearch.includeCommitsWithFiles` — includes commit context in review.
- **Review PR deeplink:** `cursor://anysphere.cursor-deeplink/pr-review` — open review from browser.
- **Review data in bubble:** `reviewData` field in `RUN_TERMINAL_COMMAND_V2` bubble — agent attaches review context to command results.

**Cursor API services used:**
- `cursor.reviewchanges`, `cursor.reviewpr` view identifiers
- gRPC: `FetchPullRequestParams`, `FetchPullRequestResult`
- GitHub API (via `vscode.authentication` GitHub provider)

---

### 20. Plan Mode (Structured Task Planning)

**Source:** `workbench.desktop.main.js` (grep: `createPlan`, `planMode`, `plan-execution`)  
**Priority:** HIGH

**Description:**  
Before executing a complex multi-file task, the agent can generate an explicit step-by-step plan with a todo list. The user can review, approve, modify, or reject the plan before execution begins. Each plan step is tracked as it executes.

**How it works (technical brief):**  
- **Plan creation:** `CreatePlanParams`, `CreatePlanStream` — streaming plan generation protocol.
- **Plan outcomes:** `CreatePlanResult_Accepted`, `CreatePlanResult_Modified`, `CreatePlanResult_Rejected` — three states for user response to a proposed plan.
- **Plan UI:** `composer-create-plan-container`, `composer-create-plan-todo-item`, `composer-create-plan-todos-header-empty`, `composer-create-plan-expander`, `composer-create-plan-export`, `composer-create-plan-view-plan-button`.
- **Plan execution:** `PLAN_EXECUTION=1` in `SimulatedMsgReason` enum — plan steps are tracked as they execute.
- **Auto-open on plan build:** `auto_open_review_during_plan_build` feature gate — automatically opens review panel as plan builds.
- **Plan mode prompt:** `plan_mode_prompt` feature gate — uses a specialized system prompt for plan generation.
- **File-based plan edits:** `file_based_plan_edits` feature gate — stores plan in a file for auditability.
- **Step structure:** each `Step` has `id`, `instructions`, `prerequisites`, `subComposerId` — supports step dependencies and parallel execution.
- **Todo indicator:** `composer-plan-todo-indicator-cancelled` — visual state for cancelled steps.

**Cursor API services used:**
- gRPC: `CreatePlanParams`, `CreatePlanResult`, `CreatePlanStream`
- `Step` protobuf type in `aiserver.v1`

---

### 21. Cursor Blame (AI-annotated Git Blame)

**Source:** `workbench.desktop.main.js` (grep: `cursorBlame`, `cursor.blame`, `cursor-blame-*`)  
**Priority:** MEDIUM

**Description:**  
An enhanced Git blame view that uses AI to explain *why* code was written — beyond just who wrote it and when. Inline gutter annotations show blame info with AI-generated summaries of the change's intent.

**How it works (technical brief):**  
- **Views:** `cursor.blame` (file blame), `cursor.fileblame` (detailed file-level blame view).
- **Gutter decorations:** `cursor-blame-glyph-agent`, `cursor-blame-glyph-tab`, `cursor-blame-gutter-hover` — different visual indicators for AI-written vs. human-written code.
- **Line-level blame:** `cursor-blame-line-agent`, `cursor-blame-line-tab`, `cursor-blame-agent-line`, `cursor-blame-tab-line` — shows whether the line was written by Agent, Tab (autocomplete), or human.
- **File blame revision:** `cursor-file-blame-revision`, `cursor-file-blame-line` — per-revision and per-line markers.
- **Hover delay:** `cursor.blame.hoverDelay` — configurable delay before blame hover appears.
- **Feature gate:** `cursor_blame` — server-side gate for enabling the feature.
- **Attribution in Composer:** `composer-ai-attribution-empty`, `composer-ai-attribution-layout`, `composer-ai-attribution-output`, `composer-ai-attribution-section-content` — tracks which lines in the diff were AI-generated.

**Cursor API services used:**
- `cursor.blame`, `cursor.fileblame` view identifiers
- `cursor.blame.*` settings

---

### 22. YOLO Mode (Autonomous Agent)

**Source:** `workbench.desktop.main.js`, `cursor-agent-exec/dist/main.js`  
**Priority:** HIGH

**Description:**  
A mode where the AI agent executes all tool calls (file edits, terminal commands, MCP calls) without pausing for user approval on each action. The user trusts the agent completely within a session. Can be combined with a custom YOLO prompt to constrain behavior.

**How it works (technical brief):**  
- **Proto field:** `enable_yolo_mode` (field 31, boolean) in the agent request — sent to backend to indicate autonomous mode.
- **YOLO prompt:** `yolo_prompt` (field 32, string) — a custom instruction string appended when YOLO mode is active (e.g., "never run destructive commands").
- **UI:** no per-tool confirmation dialogs appear; edits are applied immediately.
- **Sandboxing integration:** `sandboxingControls: { sandboxing, sandboxNetworking, sandboxGit }` — YOLO mode is designed to be paired with sandbox controls.
- **MCP auto-run protection:** `autoRunControls.disableMcpAutoRun`, `playwrightProtection` — specific flags to partially constrain even YOLO mode.
- **Allowlist mode:** `allowlist_in_ask_every_time_mode` feature gate — even in non-YOLO mode, an allowlist of pre-approved tool types can skip confirmation.

**Cursor API services used:**
- `enable_yolo_mode`, `yolo_prompt` in `aiserver.v1` agent request proto

---

### 23. Sub-agent / Parallel Agent Orchestration

**Source:** `workbench.desktop.main.js`, `cursor-agent-exec/dist/main.js`  
**Priority:** HIGH

**Description:**  
The main agent can spawn parallel sub-agents to complete subtasks concurrently. Each sub-agent runs its own tool loop and reports results back to the parent. This enables divide-and-conquer approaches for large tasks (e.g., "fix all failing tests" — one sub-agent per test file).

**How it works (technical brief):**  
- **SubagentStartRequestQuery:** protobuf type `agent.v1.SubagentStartRequestQuery` with fields: `subagent_id` (string), `subagent_type` (string), `task` (string), `parentConversationId` (string), `isParallelWorker` (bool).
- **BACKGROUND_COMPOSER_FOLLOWUP tool:** `BACKGROUND_COMPOSER_FOLLOWUP=24` — the parent agent uses this tool to spawn a sub-composer session.
- **SUB_COMPOSER context type:** `n[n.SUB_COMPOSER=29]="SUB_COMPOSER"` — sub-composers are tracked as a distinct context type.
- **Context channel types:** `MEMORIES=25`, `RCP_LOGS=26`, `KNOWLEDGE_FETCH=27`, `SLACK_INTEGRATION=28`, `SUB_COMPOSER=29`, `THINKING=30`, `CONTEXT_WINDOW=31` — rich pipeline of context signals feeding into the agent.
- **Plan step sub-composer:** each `Step` in a plan has a `sub_composer_id` — allowing independent composer sessions per plan step.
- **Parallel workers disabled recommender:** `cursor.localParallelAgentsDisableRecommender` — can suppress the recommendation to use parallel agents.
- **Ensemble mode:** `composer-ensemble` — a meta-mode where multiple models/agents vote on edits.

**Cursor API services used:**
- `agent.v1.SubagentStartRequestQuery` gRPC
- `BACKGROUND_COMPOSER_FOLLOWUP` tool in agent tool enum

---

### 24. Knowledge Base Tool

**Source:** `workbench.desktop.main.js` (grep: `KNOWLEDGE_BASE`, `knowledgeItem`, `knowledgeBase`)  
**Priority:** MEDIUM

**Description:**  
Users can attach documentation files, web pages, or custom knowledge documents to their workspace. The agent has a dedicated `KNOWLEDGE_BASE` tool to query these documents during task execution.

**How it works (technical brief):**  
- **Tool:** `KNOWLEDGE_BASE=25` in agent tool enum — dedicated retrieval action for attached knowledge.
- **Knowledge items:** `knowledgeItems` array in agent state — tracks knowledge documents available to the current session.
- **KnowledgeBaseParams/Result/Stream:** protobuf types for knowledge queries — `KnowledgeBaseParams`, `KnowledgeBaseResult`, `KnowledgeBaseStream`.
- **KNOWLEDGE_FETCH context channel:** `n[n.KNOWLEDGE_FETCH=27]="KNOWLEDGE_FETCH"` — a dedicated channel in the agent context pipeline for knowledge document retrieval results.
- **Docs retrieval:** `ChunkType.DOCS=3` in the retrieval system — documentation chunks are indexed separately from code.
- **New docs command:** `cursor.newdocs` — command to add a new documentation source.
- **Documentation context:** `"docs":"Final Documentation Context"` — the last section of the agent context assembly is documentation.

**Cursor API services used:**
- `KNOWLEDGE_BASE` tool in agent protocol
- gRPC: `KnowledgeBaseParams`, `KnowledgeBaseResult`

---

### 25. WYSIWYG Markdown Chat

**Source:** `workbench.desktop.main.js` (grep: `wysiwyg_markdown`)  
**Priority:** MEDIUM

**Description:**  
The Composer chat input renders markdown in a WYSIWYG (What You See Is What You Get) style — bold, italics, code blocks, links are rendered live as the user types rather than showing raw markdown syntax.

**How it works (technical brief):**  
- **Feature gates:** `wysiwyg_markdown`, `wysiwyg_markdown_default` — the feature is server-controlled and can be on by default.
- **Lexical editor:** the Composer input uses Facebook's Lexical rich-text editor (`composer-lexical-display`) which natively supports WYSIWYG modes.
- **Undo/Redo:** `editor.action.undoLexical`, `editor.action.redoLexical` — Lexical-specific undo/redo actions (separate from VS Code's standard undo).
- **Smooth streaming:** `cursor.chat.smoothStreaming` — AI response markdown is rendered progressively with smooth animations.
- **Slim codeblock render:** `slim_codeblock_render` feature gate — optimized rendering for code blocks in AI responses.
- **Markdown hover:** `cursor.composer.shouldShowMarkdownHoverParticipantAction` — markdown formatting hints shown on hover.

**Cursor API services used:**
- Lexical editor (embedded library)
- `wysiwyg_markdown` feature gate

---

### 26. Shared Chat Links

**Source:** `workbench.desktop.main.js` (grep: `shared_chats`, `composer.shareChat`, `forkSharedChat`)  
**Priority:** MEDIUM

**Description:**  
Composer chat sessions can be exported as shareable URLs. Others can view the conversation and "fork" it to continue from any point. Enterprise organizations can make shared conversations publicly visible.

**How it works (technical brief):**  
- **Share command:** `composer.shareChat` — generates a shareable URL for the current chat.
- **Fork command:** `composer.forkSharedChat` — creates a new session branching from a shared conversation.
- **Export as Markdown:** `composer.exportChatAsMd` — downloads the conversation as a `.md` file.
- **Feature gates:** `shared_chats` (basic sharing), `shared_chats_view_public` (public URLs), `enterprise_public_shared_conversations` (enterprise-level public sharing).
- **Copy request ID:** `composer.copyRequestId`, `composer.copyRequestIdFromPane`, `composer.copyRequestIdFromEditor` — copies internal request identifier for debugging.
- **Download request content:** `composer-controls-and-feedback-download-request-content` — downloads full request/response payload.
- **Open in prompt quality:** `composer-controls-and-feedback-open-in-prompt-quality` — internal Anysphere tool to evaluate prompt quality.

**Cursor API services used:**
- `composer.shareChat` command
- Cursor backend chat storage API at `api2.cursor.sh`

---

### 27. Glass Mode Window

**Source:** `workbench.desktop.main.js` (grep: `glass_mode`, `openGlassModeWindow`)  
**Priority:** LOW

**Description:**  
A special transparent/overlay window mode that renders Cursor with a "glass" visual effect (frosted background). Available on supported platforms and toggled via a dedicated command.

**How it works (technical brief):**  
- **Command:** `cursor.openGlassModeWindow` — opens Cursor in glass/transparent window mode.
- **Action:** `show_glass_mode_action` feature gate — controls whether the action is shown in the UI.
- **Subpixel antialias:** `enable_glass_subpixel_antialias` feature gate — enables subpixel font rendering in glass mode.
- **Isolation:** in glass mode, `cursor.extensions.isolation` is forced disabled: `"(forced disabled in glass mode)"` — extension isolation cannot run alongside glass mode.
- **No titlebar:** `hide_titlebar_default` feature gate — glass mode typically hides the OS title bar.

**Cursor API services used:**
- `cursor.openGlassModeWindow` command
- `show_glass_mode_action`, `enable_glass_subpixel_antialias` feature gates

---

### 28. Tinder Diff Editor

**Source:** `workbench.desktop.main.js` (grep: `tinderDiffEditor`, `cursor.tinderdiffeditor`)  
**Priority:** MEDIUM

**Description:**  
A swipe-style diff review UI where the user reviews AI-suggested changes one at a time — "swipe right" to accept, "swipe left" to reject. Named after the swipe UX pattern.

**How it works (technical brief):**  
- **Scheme:** `cursor.tinderdiffeditor` — uses a custom URI scheme to open diffs in the tinder UI.
- **AI attribution:** `composer-ai-attribution-*` CSS classes track which diffs came from AI.
- **Inline multi-diff:** `cursor.editor.IInlineMultiDiffEditor` — related to showing multiple diffs simultaneously.
- **Accept/reject flow:** connected to the overall diff acceptance system (`acceptAllEdits`, `keepAll`).

**Cursor API services used:**
- `cursor.tinderdiffeditor` custom URI scheme

---

### 29. Image Attachments in Chat

**Source:** `workbench.desktop.main.js` (grep: `addImage`, `imageAttach`, `vision`)  
**Priority:** MEDIUM

**Description:**  
Users can paste or attach screenshots, mockups, and UI images directly into the Composer chat. The AI receives the image as vision input and can reference it in code generation (e.g., "implement this design").

**How it works (technical brief):**  
- **Add image command:** `gYe` command — triggered by paste events; filters clipboard items by `kind === "file"`.
- **Model capability check:** `supportsVision` flag — if the current model doesn't support vision, adds a warning class `"warning"` and shows a tooltip "Model X does not support images."
- **Telemetry:** `copilot.attachImage` event with `{ currentModel, supportsVision }`.
- **Image size limit:** `claude-image-too-large` error code — backend returns this when an image exceeds the limit.
- **MCP images:** `mcp_enable_ui` + image support in MCP tool responses — agent can receive screenshots from browser automation as MCP tool results.

**Cursor API services used:**
- `vscode.cursor` (proposed API)
- gRPC: image data in `aiserver.v1` request protos (base64 encoded)

---

### 30. Usage / Billing Awareness in UI

**Source:** `workbench.desktop.main.js` (grep: `usagePricing`, `fast.request`, `slow.request`, `billingBanner`)  
**Priority:** MEDIUM

**Description:**  
The Composer and settings show real-time usage (token/request counts) and billing information. Users see which requests consume "fast" vs "slow" quota and are warned when approaching limits. Billing banners appear when payments fail.

**How it works (technical brief):**  
- **Usage modal:** `cursorai.action.showUsagePricingModal` — opens a detailed usage breakdown.
- **Fast/slow requests:** `is_using_slow_request` proto field — backend marks expensive requests differently. Usage summary: `cursor.composer.usageSummaryDisplay`.
- **Billing banners:** `cursor.billingBanner.paymentFailedDismissed`, `cursor.billingBanner.pendingCancellationDismissed` — persistent banners with dismiss state saved.
- **Feature gate:** `display_ide_billing_banners` — server-controlled billing banner visibility.
- **Credit grants:** `cursor.creditGrantPrimaryDismissedPromos`, `cursor.dismissedCreditGrantIds` — tracks dismissed credit grant promotions.
- **Upgrade CTA:** `cursor.titlebar.upgradeToPro` — upgrade button in the title bar.
- **Subscription tiers modal:** `cursor.showSubscriptionTiersModal`.
- **Quota:** `user_is_professional` feature gate — controls which features are available based on subscription tier.
- **Multiplier indicator:** `composer-multiplier-indicator` — shows request cost multiplier in the composer toolbar.

**Cursor API services used:**
- `cursorai.action.showUsagePricingModal`
- `cursor.billingBanner.*`, `cursor.composer.usageSummaryDisplay` settings
- gRPC: billing/usage APIs at `api2.cursor.sh`

---

### 31. Custom Model Configuration (BYO Keys)

**Source:** `workbench.desktop.main.js` (grep: `apiKey`, `AzureState`, `customModelIds`, `use_model_parameters`)  
**Priority:** MEDIUM

**Description:**  
Users can configure their own API keys (OpenAI, Anthropic, Azure, custom endpoints) and use custom model IDs. Supports Azure OpenAI deployment configurations. Custom models are selectable in the composer model switcher.

**How it works (technical brief):**  
- **AzureState proto:** fields: `api_key`, `base_url`, `deployment`, `use_azure` (bool) — full Azure OpenAI configuration.
- **Custom model IDs:** `GetUsableModelsRequest.custom_model_ids[]` — user-defined model identifiers sent to the backend.
- **Thinking model:** `GetDefaultModelResponse` has `model`, `thinking_model`, `max_mode`, `next_default_set_date` — dedicated thinking model field.
- **Max mode:** `max_mode` flag — enables maximum context/reasoning for supported models.
- **Model parameters:** `use_model_parameters` feature gate — allows per-model parameter overrides.
- **Model switcher:** `cursorai.action.switchToModel`, `cursorai.action.addModelToSwitcher` — in-session model switching.
- **Supported models in retrieval:** `specificModelFields: ["cmd-k", "background-composer", "composer", "composer-ensemble", "plan-execution"]` — different models can be configured per feature.
- **Open AI settings:** `cursor.openCursorSettings`, `cursor.aisettings` — dedicated AI settings view.
- **Select backend:** `cursor.selectBackend` — switch between Cursor's backend and custom endpoints.
- **Inference proxy:** `use_inference_proxy_for_georeplicated_agent` feature gate — routes agent requests through geo-replicated inference proxy.

**Cursor API services used:**
- `agent.v1.GetUsableModelsRequest`
- `aiserver.v1.AzureState`, `aiserver.v1.GetDefaultModelResponse`
- `cursor.aisettings` view

---

### 32. Deep Search Tool

**Source:** `workbench.desktop.main.js` (grep: `DEEP_SEARCH`, `DeepSearchParams`)  
**Priority:** MEDIUM

**Description:**  
A multi-hop semantic search tool available to the agent. Goes beyond single-query retrieval — iteratively searches, follows code references, and synthesizes a comprehensive answer from multiple sources across the codebase.

**How it works (technical brief):**  
- **Tool:** `DEEP_SEARCH=27` in the agent tool enum.
- **Proto types:** `DeepSearchParams`, `DeepSearchResult`, `DeepSearchStream` — streaming search results.
- **Distinction from semantic search:** `SEMANTIC_SEARCH_FULL=9` is single-pass; `DEEP_SEARCH=27` is multi-hop/iterative.
- **Used for:** answering architecture questions, finding all usages of a pattern, understanding complex codepaths.

**Cursor API services used:**
- gRPC: `DeepSearchParams`, `DeepSearchResult`, `DeepSearchStream` at `api2.cursor.sh`

---

### 33. Create Diagram Tool

**Source:** `workbench.desktop.main.js` (grep: `CREATE_DIAGRAM`, `CreateDiagramStream`)  
**Priority:** MEDIUM

**Description:**  
The agent can generate visual diagrams (Mermaid, flowcharts, sequence diagrams) representing code architecture, data flows, or system designs. Diagrams are rendered inline in the Composer panel.

**How it works (technical brief):**  
- **Tool:** `CREATE_DIAGRAM=28` in agent tool enum.
- **Proto types:** `CreateDiagramParams`, `CreateDiagramResult`, `CreateDiagramStream`.
- **Rendering:** the Composer webview renders Mermaid or similar diagram syntax from the agent's output.
- **Agent changelog:** `"0.50": "Background Agent and refreshed Quick Edit"`, `"0.49": "Rules generation, improved agent terminal, MCP images"`, `"0.48": "Multi-chat support, custom modes, faster indexing"` — diagram support part of ongoing agent capability expansion.

**Cursor API services used:**
- gRPC: `CreateDiagramParams`, `CreateDiagramResult`, `CreateDiagramStream`

---

### 34. Notepads

**Source:** `workbench.desktop.main.js` (grep: `notepads`, `Notepad`)  
**Priority:** MEDIUM

**Description:**  
Persistent, named text documents that can be attached as context in Composer sessions via `@mention`. Users write notes, system prompts, reference documentation, or recurring instructions once and reuse them across sessions.

**How it works (technical brief):**  
- **Proto field:** `notepads[]` in the AI request — array of `eNh` (Notepad) messages.
- **Mention type:** notepad entries are addressable via `@mention` tokens in the Composer input with `mentionType` attribute.
- **Persistence:** notepads are stored in VS Code's reactive storage (`reactiveStorageService`).
- **Usage in requests:** sent as part of `relevantFiles` / `notepads` arrays in the agent context.
- **Distinction from Rules:** Rules are auto-injected based on glob matching; Notepads require explicit `@mention`.

**Cursor API services used:**
- `notepads[]` field in `aiserver.v1` request proto
- Reactive storage service

---

### 35. Smart Review (Semantic Diff Review)

**Source:** `workbench.desktop.main.js` (grep: `enable_smart_review`, `semanticReview`)  
**Priority:** MEDIUM

**Description:**  
An AI-powered code review that goes beyond syntax — understands the semantic intent of changes and flags logical issues, performance problems, and security concerns. Available for both in-editor diffs and PR reviews.

**How it works (technical brief):**  
- **Feature gates:** `enable_smart_review` (editor diffs), `enable_smart_review_pr` (PR-level) — separately controlled.
- **Cache:** `cursor.semanticReview.cachedData` — per-state cache to avoid redundant analysis.
- **Semantic includes commits:** `cursor.semanticSearch.includeCommitsWithFiles` — semantic review can include commit history for better context.
- **UI integration:** uses the BugBot comment zone UI (`bugbot-*` CSS classes) for displaying review annotations.
- **Fast multi-diff:** `review_changes_fast_multi_diff` — performance optimization for large PRs.

**Cursor API services used:**
- `cursor.semanticReview.*` settings
- gRPC: smart review API at `api2.cursor.sh`

---

### 36. Context Window Monitor

**Source:** `workbench.desktop.main.js` (grep: `CONTEXT_WINDOW`, `contextWindow`)  
**Priority:** MEDIUM

**Description:**  
Real-time display and management of the AI context window. Shows how much context is being used, warns when approaching limits, and provides mechanisms to compress or prune context automatically.

**How it works (technical brief):**  
- **Context channel:** `CONTEXT_WINDOW=31` — dedicated context type in the agent pipeline.
- **Max context window setting:** `cursor.composer.usageSummaryDisplay` — shows token usage per session.
- **Compression:** `diffsForCompressingFiles` in agent state — files can be compressed when context is full.
- **Long file chunking:** `ChunkType.LONG_FILE=2` — large files are chunked for context management.
- **Thinking channel:** `THINKING=30` — separate context slot for chain-of-thought reasoning (Claude extended thinking).
- **Context bank session:** `contextBankSessionId` in agent request — tracks context state across turns.
- **Model fallbacks:** `allowModelFallbacks`, `numberOfTimesShownFallbackModelWarning` — graceful degradation when primary model is unavailable.

**Cursor API services used:**
- `CONTEXT_WINDOW` channel in agent proto
- `aiserver.v1` context management fields

---

### 37. Plugin / Hook System

**Source:** `cursor-agent-exec/dist/main.js` (grep: `plugin`, `hooks`, `LocalPlugin`)  
**Priority:** MEDIUM

**Description:**  
An extensible plugin architecture for the Cursor agent. Plugins are directories in `.cursor/plugins/` or `.cursor/skills/` that can define commands, hooks (event callbacks), MCP server configurations, and custom agent behaviors. A marketplace allows community plugin discovery and installation.

**How it works (technical brief):**  
- **Plugin discovery:** scans `kzp=[".cursor/skills/", ".cursor/skills-cursor/", ".cursor/cloud-skills/", ".cursor/plugins/", ".claude/skills/", ".claude/plugins/", ".codex/skills/", ".agents/skills/"]`.
- **Plugin services:** `LocalPluginCommandsService` (registers plugin-defined commands), `LocalPluginHooksService` (registers event hooks).
- **Hook config:** plugins define `hooks.config` — a map of event names to handler functions.
- **MCP server config:** `plugin.mcpConfig.mcpServers` — plugins can bundle MCP server definitions.
- **Plugin metadata:** `name`, `displayName`, `description`, `sources`, `marketplaceName` — structured metadata for marketplace display.
- **Plugin approval flow:** `submitPluginForApproval`, `approvePlugin` gRPC calls — team admins approve plugins before they run.
- **Plugin reload:** `notifyPluginsChanged()` via `cursor.notifyPluginsChanged` — hot-reload without IDE restart.
- **Claude plugin root:** scans for Claude-style plugin roots via `findClaudePluginRootWithHooks`.
- **Feature gates:** `enable_cc_plugin_import`, `enable_local_3p_plugin_imports`, `enable_plugin_nudge`, `enable_self_healing_mcp_ext_host_restart`.
- **Marketplace:** `marketplaces_enabled` feature gate — plugin marketplace UI.
- **Plugin nudge:** suggests installing plugins relevant to current task context.

**Cursor API services used:**
- `cursor.notifyPluginsChanged()` (Cursor proposed API)
- gRPC: `submitPluginForApproval`, `approvePlugin`
- `cursor.hooks`, `cursor.hooks.initializeUserHooks` commands

---

## Summary Priority Matrix

| Feature | Priority | Effort | Value |
|---|---|---|---|
| AI Agent System (tool loop, sandbox) | HIGH | HIGH | CRITICAL |
| Composer (multi-file AI editor) | HIGH | HIGH | CRITICAL |
| Cursor Tab (AI tab completion) | HIGH | HIGH | CRITICAL |
| Cmd+K / Quick Edit | HIGH | MEDIUM | CRITICAL |
| Background Agent / Cloud Agent | HIGH | HIGH | HIGH |
| Codebase Indexing & RAG | HIGH | HIGH | HIGH |
| MCP (Model Context Protocol) | HIGH | MEDIUM | HIGH |
| BugBot | HIGH | MEDIUM | HIGH |
| Browser Automation | HIGH | HIGH | HIGH |
| Terminal AI (Ctrl+K in terminal) | HIGH | MEDIUM | HIGH |
| Cursor Rules System | HIGH | LOW | HIGH |
| Plan Mode | HIGH | MEDIUM | HIGH |
| YOLO Mode | HIGH | LOW | HIGH |
| Sub-agent / Parallel Orchestration | HIGH | HIGH | HIGH |
| Shadow Workspace | HIGH | HIGH | MEDIUM |
| AI Code Review (PR/Diff) | HIGH | MEDIUM | HIGH |
| Deep Linking System | MEDIUM | LOW | MEDIUM |
| AI Commit Messages | MEDIUM | LOW | HIGH |
| Knowledge Base Tool | MEDIUM | MEDIUM | HIGH |
| Custom Model Config (BYO keys) | MEDIUM | MEDIUM | HIGH |
| Cursor Skills & Agents Config | MEDIUM | MEDIUM | HIGH |
| Worktrees (Parallel Agent Tasks) | MEDIUM | HIGH | MEDIUM |
| Cursor Blame (AI git blame) | MEDIUM | MEDIUM | MEDIUM |
| WYSIWYG Markdown Chat | MEDIUM | MEDIUM | MEDIUM |
| Shared Chat Links | MEDIUM | LOW | MEDIUM |
| Notepads | MEDIUM | LOW | MEDIUM |
| Smart Review (Semantic) | MEDIUM | MEDIUM | MEDIUM |
| Context Window Monitor | MEDIUM | LOW | MEDIUM |
| Image Attachments | MEDIUM | LOW | MEDIUM |
| Usage / Billing Awareness | MEDIUM | LOW | MEDIUM |
| Deep Search Tool | MEDIUM | MEDIUM | MEDIUM |
| Create Diagram Tool | MEDIUM | LOW | MEDIUM |
| Plugin / Hook System | MEDIUM | HIGH | HIGH |
| Tinder Diff Editor | MEDIUM | MEDIUM | LOW |
| Real-time Socket | MEDIUM | MEDIUM | LOW |
| NDJSON Debug Ingest | LOW | LOW | LOW |
| Glass Mode Window | LOW | LOW | LOW |

---

## Key Cursor API Services

The following Cursor-proprietary APIs (via `enabledApiProposals`) are used across extensions:

| API Proposal | Used By | Purpose |
|---|---|---|
| `cursor` | All cursor-* extensions | Core Cursor API surface |
| `cursorTracing` | cursor-agent-exec, cursor-retrieval | Distributed tracing |
| `cursorNoDeps` | cursor-socket, cursor-resolver | Lightweight API without heavy deps |
| `control` | cursor-agent-exec, cursor-browser-automation, cursor-deeplink | Privileged control operations |
| `resolvers` | cursor-resolver | Remote authority resolution |
| `textSearchProvider2` | cursor-retrieval | Custom text search provider |

### Key gRPC Services at `https://api2.cursor.sh`

- `aiserver.v1.*` — AI inference, context assembly, retrieval, analytics
- `agent.v1.*` — Agent execution, sub-agents, plan management
- `aiserver.v1.AnalyticsService/UploadIssueTrace` — telemetry

### Key Configuration Namespaces

- `cursor.cpp.*` — Cursor Tab (completions)
- `cursor.composer.*` — Composer settings  
- `cursor-retrieval.*` — Indexing/RAG settings
- `cursor.general.*` — General Cursor settings
- `cursor.blame.*` — Git blame settings
- `cursor.terminal.*` — Terminal AI settings
- `cursor.worktree*` — Parallel worktree settings
