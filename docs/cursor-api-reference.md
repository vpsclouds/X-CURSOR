# Cursor IDE API Reference

> Extracted from decompiled source at `/home/user/workspace/decompiled/`  
> Source file: `out/vs/workbench/workbench.desktop.main.js`

---

## Table of Contents

1. [Base URLs & Environments](#base-urls--environments)
2. [Authentication](#authentication)
3. [Transport Layer](#transport-layer)
4. [Request Headers](#request-headers)
5. [AI Services (`aiserver.v1`)](#ai-services-aiserverv1)
6. [Agent Services (`agent.v1`)](#agent-services-agentv1)
7. [CursorFS Service (`cursorfs.v1`)](#cursorfs-service-cursorfsv1)
8. [REST API Endpoints](#rest-api-endpoints)
9. [AI Model Configuration](#ai-model-configuration)
10. [Key Message Types](#key-message-types)

---

## Base URLs & Environments

### Production Endpoints

| Role | URL | Purpose |
|------|-----|---------|
| Main API | `https://api2.cursor.sh` | General API, auth, bcProxy |
| Telemetry | `https://api3.cursor.sh` | Cursor Tab telemetry |
| Geo-CPP | `https://api4.cursor.sh` | Cursor Tab (geo-routed) |
| CPP Config | `https://api4.cursor.sh` | CPP config |
| CmdK / Chat | `https://api3.cursor.sh` | Chat, CmdK completions |
| Codebase indexing | `https://repo42.cursor.sh` | Repository indexing |
| Agent (default) | `https://agent.api5.cursor.sh` | Background agent (non-privacy) |
| Agent privacy | `https://agentn.api5.cursor.sh` | Background agent (privacy mode) |
| Agent US-West-1 | `https://agent-gcpp-uswest.api5.cursor.sh` | Agent regional US-West |
| Agent US-West-1 privacy | `https://agentn-gcpp-uswest.api5.cursor.sh` | Agent regional US-West (privacy) |
| Agent EU-Central-1 | `https://agent-gcpp-eucentral.api5.cursor.sh` | Agent regional EU |
| Agent EU-Central-1 privacy | `https://agentn-gcpp-eucentral.api5.cursor.sh` | Agent regional EU (privacy) |
| Agent AP-Southeast-1 | `https://agent-gcpp-apsoutheast.api5.cursor.sh` | Agent regional AP |
| Agent AP-Southeast-1 privacy | `https://agentn-gcpp-apsoutheast.api5.cursor.sh` | Agent regional AP (privacy) |
| Auth | `https://prod.authentication.cursor.sh` | Auth0 authentication domain |
| Login page | `https://authenticator.cursor.sh` | OAuth login UI |
| Sentry metrics | `https://80ec2259ebfad12d8aa2afe6eb4f6dd5@metrics.cursor.sh/4508016051945472` | Error telemetry |

### Environment Constants (Internal)

| Environment Name | Description |
|-----------------|-------------|
| `Prod` | Full production |
| `Prod (eu-central-1 agent)` | Production with EU-Central-1 agent |
| `Prod (ap-southeast-1 agent)` | Production with AP-Southeast-1 agent |
| `Staging` | `https://staging.cursor.sh` |
| `DevStaging(w/local-website)` | `https://dev-staging.cursor.sh` |
| `Full Local` | `https://localhost:<port>` |

### Auth0 Client IDs

| Environment | Client ID |
|-------------|-----------|
| Production | `KbZUR41cY7W6zRSdpSUJ7I7mLYBKOCmB` |
| Staging/Dev | `OzaBXLClY5CAGxNzUhQ2vlknpi07tGuE` |
| Prod auth domain | `prod.authentication.cursor.sh` |
| Dev auth domain | `dev.authentication.cursor.sh` |

---

## Authentication

### Overview

Cursor uses a **PKCE-based OAuth2 flow** with an Auth0 backend, polling for a token via a UUID-based handshake.

### Login Flow

1. **Generate PKCE verifier/challenge**
   ```
   verifier = base64URLEncode(32 random bytes)
   challenge = base64URLEncode(SHA-256(verifier))
   uuid = crypto.randomUUID()
   ```

2. **Open browser to login URL**
   ```
   GET {websiteUrl}/loginDeepControl?challenge={challenge}&uuid={uuid}&mode=login
   ```
   - `mode` is `"login"` or `"signup"`
   - `websiteUrl` defaults to `https://cursor.com`

3. **Poll for tokens**
   ```
   GET {backendUrl}/auth/poll?uuid={uuid}&verifier={verifier}
   Headers:
     x-ghost-mode: <privacy_mode>
     x-new-onboarding-completed: <bool>
     traceparent: <trace_id>
   ```
   - Response: `{ accessToken, refreshToken, authId }`
   - On 404: stop polling (session invalid)
   - On tokens received: store and proceed

4. **Token Storage** (in VS Code storage, scope global=`-1`, profile=`1`)
   - `cursorAuth/accessToken` — JWT access token
   - `cursorAuth/refreshToken` — OAuth refresh token
   - `cursorAuth/cachedEmail` — user email
   - `cursorAuth/cachedSignUpType` — signup type enum
   - `cursorAuth/stripeMembershipType` — plan type (`FREE`, `PRO`, `PRO_PLUS`, `ULTRA`, `ENTERPRISE`, `FREE_TRIAL`)
   - `cursorAuth/stripeSubscriptionStatus` — subscription status
   - `cursorAuth/teamId` — current team ID
   - `cursorAuth/openAIKey` — custom OpenAI API key
   - `cursorAuth/claudeKey` — custom Anthropic API key
   - `cursorAuth/googleKey` — custom Google API key

### Token Refresh

```
POST {backendUrl}/oauth/token
Body (form-encoded):
  grant_type: "refresh_token"
  client_id: <authClientId>
  refresh_token: <stored_refresh_token>
```

### REST Auth Header

For non-gRPC calls, the access token is sent as:
```
Authorization: Bearer {accessToken}
```

### gRPC Auth

gRPC calls do **not** use a standard `Authorization` header. Authentication is embedded in the **checksum header** (`x-cursor-checksum`) which encodes a time-based value plus `machineId`. The access token is passed separately via the `GetSessionToken` RPC when a session token is needed for a specific destination (portal, AI server, auth proxy).

**GetSessionToken destinations:**
- `DESTINATION_PORTAL` (1)
- `DESTINATION_AISERVER` (2)
- `DESTINATION_AUTH_PROXY` (3)

---

## Transport Layer

### Protocol

Cursor uses **`@bufbuild/connect`** (Connect-RPC) with the **gRPC-Web protocol** over HTTPS.

- **Library**: `@bufbuild/connect` (protocol-grpc-web)
- **Serialization**: Protocol Buffers (binary)
- **HTTP method**: `POST`
- **URL pattern**: `https://{baseUrl}/{package}.{ServiceName}/{MethodName}`
- **Example**: `https://api2.cursor.sh/aiserver.v1.AnalyticsService/UploadIssueTrace`

### Client Creation

Clients are created via `BackendClient` wrapper (`ZS` class) which:
1. Waits for auth readiness before first call
2. Uses a `ConnectTransportProvider` registered by the auth service
3. Supports optional `headerInjector` for per-call header augmentation

### SSE / Poll Variants

Many streaming methods have **SSE** and **Poll** variants for environments where bidirectional streaming is unavailable:
- `StreamXxx` → `StreamXxxSSE` (server-sent events)
- `StreamXxx` → `StreamXxxPoll` (polling fallback)
- `StreamBidiXxx` → `StreamBidiXxxSSE` / `StreamBidiXxxPoll`

### Retry Headers

Retry behavior can be configured via request headers:
```
X-Cursor-RetryInterceptor-Enabled: true
X-Cursor-RetryInterceptor-MaxRetries: <n>
X-Cursor-RetryInterceptor-BaseDelayMs: <ms>
X-Cursor-RetryInterceptor-MaxDelayMs: <ms>
```

---

## Request Headers

All gRPC requests include the following standard headers set by `setCommonHeaders()`:

| Header | Value | Description |
|--------|-------|-------------|
| `x-cursor-checksum` | `{base64(hmac)} {machineId} [/{macMachineId}]` | Time-based HMAC + machine ID; used for server-side integrity verification |
| `x-cursor-client-version` | e.g. `0.49.x` | Cursor IDE version string |
| `x-cursor-client-type` | `ide` | Client type identifier |
| `x-cursor-client-os` | `darwin` / `win32` / `linux` | Operating system |
| `x-cursor-client-arch` | `x64` / `arm64` | CPU architecture |
| `x-cursor-client-os-version` | e.g. `14.0.0` | OS version |
| `x-cursor-client-device-type` | `desktop` | Device type |
| `x-cursor-canary` | `true` (if Anysphere user) | Canary flag for internal users |
| `x-cursor-config-version` | config version string | Server config version for cache busting |
| `x-session-id` | session UUID | Current IDE session ID |
| `x-new-onboarding-completed` | `true` / `false` | Snippet learning eligibility flag |
| `x-ghost-mode` | privacy mode string | Privacy mode state |
| `x-client-key` | client key string | Per-client key for rate limiting |
| `x-cursor-timezone` | e.g. `America/New_York` | IANA timezone |
| `x-request-id` | UUID | Per-request correlation ID |
| `x-amzn-trace-id` | `Root={uuid}` | AWS X-Ray trace ID |
| `traceparent` | `00-{traceId}-{spanId}-{flags}` | W3C trace context |
| `backend-traceparent` | same as `traceparent` | Cursor internal tracing |

### Tracing Headers (`Kb()` function)

```
X-Request-ID: {uuid}
X-Amzn-Trace-Id: Root={uuid}
traceparent: 00-{traceId}-{spanId}-01
backend-traceparent: 00-{traceId}-{spanId}-01
```

---

## AI Services (`aiserver.v1`)

All `aiserver.v1` services are accessed via gRPC-Web POST to the configured backend URL.

> **Kind legend**: U = Unary, SS = ServerStreaming, CS = ClientStreaming, BD = BiDiStreaming

---

### `aiserver.v1.AiService`

Primary AI service. **Base URL**: `api2.cursor.sh` (CmdK), `api3.cursor.sh` (Chat/Tab)

**183 methods total.**

#### Health & Status
| Method | Kind | Description |
|--------|------|-------------|
| `ServerTime` | U | Get server timestamp |
| `HealthCheck` | U | Basic health check |
| `PrivacyCheck` | U | Check privacy mode state |
| `TimeLeftHealthCheck` | U | Check subscription time remaining |
| `ThrowErrorCheck` | U | Force error for testing |

#### Model Discovery
| Method | Kind | Description |
|--------|------|-------------|
| `AvailableModels` | U | List available AI models with metadata |
| `GetModelLabels` | U | Get model label configurations |
| `GetLastDefaultModelNudge` | U | Get last model nudge timestamp |
| `GetDefaultModelNudgeData` | U | Get model upgrade nudge data |
| `GetDefaultModel` | U | Get current default model |
| `GetUsableModels` | U | Get usable models for current user |
| `GetDefaultModelForCli` | U | Get default model for CLI usage |
| `TestModelStatus` | U | Test if a model is operational |

#### Chat / Composer
| Method | Kind | Description |
|--------|------|-------------|
| `StreamChat` | SS | Stream chat response |
| `StreamChatWeb` | SS | Stream chat for web client |
| `StreamChatTryReallyHard` | SS | High-quality chat stream |
| `WarmChatCache` | U | Pre-warm chat cache |
| `StreamComposer` | SS | Stream composer (inline edit) response |
| `StreamComposerContext` | SS | Stream composer context |
| `WarmComposerCache` | U | Pre-warm composer cache |
| `KeepComposerCacheWarm` | U | Keep-alive for composer cache |
| `GetChatTitle` | U | Generate a title for a chat session |
| `GetChatSuggestions` | U | Get AI-suggested follow-up questions |
| `StreamChatDeepContext` | SS | Chat with deep codebase context |
| `StreamChatContext` | SS | Stream chat context processing |
| `TaskStreamChatContext` | SS | Task-scoped chat context stream |
| `StreamChatToolformer` | SS | Chat with toolformer model |
| `StreamChatToolformerContinue` | SS | Continue toolformer chat |
| `StreamComposerEnhancer` | BD | Bidirectional composer enhancer |
| `StreamComposerEnhancerSSE` | SS | SSE variant |
| `StreamComposerEnhancerPoll` | SS | Poll variant |

#### CmdK / Edit / Generate
| Method | Kind | Description |
|--------|------|-------------|
| `StreamEdit` | SS | Stream inline edit |
| `PreloadEdit` | U | Preload edit context |
| `StreamFastEdit` | SS | Fast edit stream |
| `StreamGenerate` | SS | Generate code stream |
| `StreamInlineLongCompletion` | SS | Long inline completion |
| `SlashEdit` | SS | Slash command edit |
| `SlashEditFollowUpWithPreviousEdits` | SS | Slash edit follow-up |

#### Cursor Tab (CPP - Cursor Prediction)
| Method | Kind | Description |
|--------|------|-------------|
| `StreamCpp` | SS | Stream cursor prediction |
| `CppConfig` | U | Get CPP configuration |
| `CppEditHistoryStatus` | U | Get edit history status |
| `CppAppend` | U | Append to CPP edit history |
| `RefreshTabContext` | U | Refresh tab context for CPP |
| `CppEditHistoryAppend` | U | Append to edit history |
| `GetCppEditClassification` | U | Classify CPP edit |
| `ShouldTurnOnCppOnboarding` | U | Check CPP onboarding eligibility |

#### Review & BugBot
| Method | Kind | Description |
|--------|------|-------------|
| `StreamReview` | SS | Stream code review |
| `StreamReviewChat` | SS | Stream review chat |
| `StreamBugBot` | SS | Stream BugBot analysis |
| `StreamBugBotAgentic` | BD | Bidirectional agentic BugBot |
| `StreamBugBotAgenticSSE` | SS | SSE variant |
| `StreamBugBotAgenticPoll` | SS | Poll variant |
| `CheckBugBotPrice` | U | Check BugBot pricing |
| `CheckBugBotTelemetryHealthy` | U | BugBot telemetry health |
| `RecordIdeBugReaction` | U | Record thumbs up/down on bug |
| `GetSuggestedBugBotIterations` | U | Get suggested BugBot run count |
| `GetEditorBugbotAutoRunStatus` | U | Get auto-run status |
| `StreamDiffReview` | SS | Stream diff-based review |
| `StreamDiffReviewByFile` | SS | Stream per-file diff review |
| `StreamAiLintBug` | SS | Stream AI lint bug detection |
| `FindBugs` | U | Find bugs in code |

#### Agent / Task
| Method | Kind | Description |
|--------|------|-------------|
| `InterfaceAgentInit` | U | Initialize interface agent |
| `StreamInterfaceAgentStatus` | SS | Stream agent status |
| `TaskGetInterfaceAgentStatus` | SS | Task-scoped agent status |
| `TaskInit` | U | Initialize a task |
| `TaskPause` | U | Pause a running task |
| `TaskInfo` | U | Get task information |
| `TaskStreamLog` | SS | Stream task logs |
| `TaskSendMessage` | U | Send message to task |
| `TaskProvideResult` | U | Provide result to task |
| `CheckDoableAsTask` | U | Check if request is doable as task |
| `StreamDoThisForMe` | SS | "Do this for me" stream |
| `DoThisForMeCheck` | U | Check "do this for me" availability |

#### Queuing & Billing
| Method | Kind | Description |
|--------|------|-------------|
| `CheckQueuePosition` | U | Get current queue position |
| `CheckUsageBasedPrice` | U | Check price before usage-based call |
| `AcknowledgeGracePeriodDisclaimer` | U | Acknowledge grace period |

#### Codebase Indexing
| Method | Kind | Description |
|--------|------|-------------|
| `CreateExperimentalIndex` | U | Create experimental index |
| `ListExperimentalIndexFiles` | U | List indexed files |
| `ListenExperimentalIndex` | SS | Listen for index updates |
| `RegisterFileToIndex` | U | Register file for indexing |
| `SetupIndexDependencies` | U | Set up index dependencies |
| `ComputeIndexTopoSort` | U | Compute topological sort |

#### Context / Embeddings
| Method | Kind | Description |
|--------|------|-------------|
| `RerankDocuments` | U | Rerank document results |
| `StreamPotentialLocs` | SS | Stream potential code locations |
| `StreamPotentialLocsUnderneath` | SS | Stream locs underneath cursor |
| `StreamPotentialLocsInitialQueries` | SS | Stream initial location queries |
| `CountTokens` | U | Count tokens for a prompt |
| `GetCompletion` | U | Single completion request |
| `GetSimplePrompt` | U | Simple prompt completion |
| `GetPassthroughPrompt` | U | Passthrough to model |
| `CheckLongFilesFit` | U | Check if long files fit in context |
| `GetEvaluationPrompt` | U | Get evaluation prompt |
| `GetEffectiveTokenLimit` | U | Get effective token limit |
| `GetContextScores` | U | Get context relevance scores |
| `RerankResults` | U | Rerank search results |
| `ContextReranking` | U | Context reranking |
| `AutoContext` | U | Auto-select context |
| `BulkEmbed` | U | Bulk embedding generation |
| `GetFilesForComposer` | U | Get relevant files for composer |

#### Documentation
| Method | Kind | Description |
|--------|------|-------------|
| `AvailableDocs` | U | List available documentation sets |
| `DocumentationQuery` | U | Query documentation |

#### Terminal
| Method | Kind | Description |
|--------|------|-------------|
| `StreamTerminalAutocomplete` | SS | Stream terminal autocomplete |
| `GetTerminalCompletion` | U | Get terminal completion |
| `IsTerminalFinishedV2` | U | Check if terminal command finished |

#### Misc AI Features
| Method | Kind | Description |
|--------|------|-------------|
| `IsolatedTreesitter` | U | Isolated tree-sitter parsing |
| `GetComposerAutocomplete` | U | Composer autocomplete |
| `GetUserInfo` | U | Get user info from token |
| `StreamAiPreviews` | SS | Stream AI preview responses |
| `PushAiThought` | U | Push AI thought annotation |
| `ReportGroundTruthCandidate` | U | Report ground truth for eval |
| `ReportCmdKFate` | U | Report CmdK acceptance/rejection |
| `ShowWelcomeScreen` | U | Check if welcome screen needed |
| `UpdateVscodeProfile` | U | Update VS Code profile |
| `GetUserInstructions` | U | Get user AI instructions |
| `StreamCursorTutor` | SS | Cursor tutor stream |
| `CheckFeatureStatus` | U | Check feature flag status |
| `CheckFeaturesStatus` | U | Check multiple feature flags |
| `CheckFeatureStatusUnauthenticated` | U | Check feature flag (unauthed) |
| `CheckNumberConfig` | U | Check numeric config value |
| `CheckNumberConfigUnauthenticated` | U | Check numeric config (unauthed) |
| `CheckNumberConfigs` | U | Check multiple numeric configs |
| `StreamPseudocodeGenerator` | SS | Pseudocode generation |
| `StreamPseudocodeMapper` | SS | Pseudocode to code mapping |
| `StreamAiCursorHelp` | SS | AI help for Cursor itself |
| `LogUserLintReply` | U | Log user lint reply |
| `LogLinterExplicitUserFeedback` | U | Log explicit lint feedback |
| `StreamFixMarkers` | SS | Stream fix markers |
| `ReportInlineAction` | U | Report inline action taken |
| `StreamPriomptPrompt` | SS | Priompt-based prompt stream |
| `StreamLint` | SS | Stream lint analysis |
| `StreamNewLintRule` | SS | Stream new lint rule creation |
| `AiProject` | SS | AI project creation |
| `ToCamelCase` | U | Convert to camel case |
| `ReportGenerationFeedback` | U | Report generation feedback |
| `GetThoughtAnnotation` | U | Get AI thought annotation |
| `StreamWebCmdKV1` | SS | Web CmdK stream |
| `StreamNextCursorPrediction` | SS | Next cursor prediction |
| `IsCursorPredictionEnabled` | U | Check if cursor prediction is on |
| `TakeNotesOnCommitDiff` | U | Generate notes from commit diff |
| `BackgroundCmdKEval` | SS | Background CmdK evaluation |
| `BackgroundCmdK` | SS | Background CmdK |
| `StreamCursorMotion` | SS | Stream cursor motion prediction |
| `CalculateAutoSelection` | U | Calculate auto-selection |
| `GetAtSymbolSuggestions` | U | Get @ symbol suggestions |
| `GetCodebaseQuestions` | U | Get suggested codebase questions |
| `DevOnlyGetPastRequestIds` | U | Dev: get past request IDs |
| `TryParseTypeScriptTreeSitter` | U | Parse TypeScript with tree-sitter |
| `NameTab` | U | Generate name for a tab |
| `NameAgent` | U | Generate name for an agent |
| `ModelQuery` | U | Query model capabilities |
| `ModelQueryV2` | SS | Stream model query |
| `IntentPrediction` | U | Predict user intent |
| `GenerateTldr` | U | Generate TL;DR summary |
| `SummarizeWithReferences` | U | Summarize with source refs |
| `ExtractPaths` | U | Extract file paths from text |
| `ChooseCodeReferences` | U | Choose relevant code refs |
| `RegisterCodeReferences` | U | Register code references |
| `StreamChatTryReallyHard` | SS | High-effort chat stream |
| `PotentiallyGenerateMemory` | U | Maybe generate memory entry |
| `KnowledgeBaseAdd` | U | Add knowledge base entry |
| `KnowledgeBaseList` | U | List knowledge base entries |
| `KnowledgeBaseRemove` | U | Remove knowledge base entry |
| `KnowledgeBaseUpdate` | U | Update knowledge base entry |
| `FetchRelevantKnowledgeForConversation` | U | Fetch relevant knowledge |
| `InferBackgroundComposerScripts` | U | Infer agent scripts |
| `GetBackgroundComposerFeedbackLink` | U | Get agent feedback link |
| `WriteGitCommitMessage` | U | Generate commit message |
| `WriteGitBranchName` | U | Generate branch name |
| `TestBedrockCredentials` | U | Test AWS Bedrock credentials |
| `ReportCommitAiAnalytics` | U | Report commit AI analytics |
| `ReportAiCodeChangeMetrics` | U | Report code change metrics |
| `ReportProcessMetrics` | U | Report process metrics |
| `ReportProcessMetricsV2` | U | Report process metrics v2 |
| `ReportClientNumericMetrics` | U | Report client numeric metrics |
| `StreamStt` | BD | Speech-to-text stream |
| `StreamSttSSE` | SS | STT SSE variant |
| `StreamSttPoll` | SS | STT poll variant |
| `TestBidi` | BD | Test bidirectional streaming |
| `StreamUiBestOfNJudge` | BD | UI best-of-N judge |
| `StreamUiBestOfNJudgeSSE` | SS | SSE variant |
| `StreamUiBestOfNJudgePoll` | SS | Poll variant |
| `EvaluatePromptHook` | U | Evaluate a prompt hook |
| `GetAllowedModelIntents` | U | Get allowed model intents |
| `UploadConversationBlobs` | U | Upload conversation blobs |
| `NotifyConversationClone` | U | Notify conversation clone |
| `GetNewChatNudgeLegacyModelPicker` | U | Get nudge for legacy model picker |
| `GetNewChatNudgeParameterizedModelPicker` | U | Get nudge for parameterized picker |
| `CreateTranscriptOverview` | U | Create transcript overview |

---

### `aiserver.v1.ChatService`

Unified chat service with tool-use support. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `StreamUnifiedChat` | SS | Unified chat stream |
| `StreamUnifiedChatWithTools` | BD | Bidirectional chat with tools |
| `StreamUnifiedChatWithToolsSSE` | SS | SSE variant |
| `StreamUnifiedChatWithToolsPoll` | SS | Poll variant |
| `StreamUnifiedChatWithToolsIdempotent` | BD | Idempotent bidi chat with tools |
| `StreamUnifiedChatWithToolsIdempotentSSE` | SS | SSE variant |
| `StreamUnifiedChatWithToolsIdempotentPoll` | SS | Poll variant |
| `GetConversationSummary` | U | Get conversation summary |
| `StreamSpeculativeSummaries` | SS | Stream speculative summaries |
| `WarmStreamUnifiedChatWithTools` | U | Pre-warm chat with tools |
| `GetPromptDryRun` | U | Dry run prompt (token count, cost) |
| `StreamFullFileCmdK` | SS | Full-file CmdK stream |
| `WarmFullFileCmdK` | U | Pre-warm full-file CmdK |
| `ConvertOALToNAL` | U | Convert old to new AI lang format |
| `StreamReplayChat` | SS | Replay a chat session |

---

### `aiserver.v1.AuthService`

Authentication service. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `GetEmail` | U | Get user email from token |
| `GetUserMeta` | U | Get user metadata |
| `EmailValid` | U | Validate email address |
| `DownloadUpdate` | U | Check for IDE update |
| `MarkPrivacy` | U | Mark privacy settings |
| `SwitchCmdKFraction` | U | Toggle CmdK rollout fraction |
| `GetCustomerId` | U | Get Stripe customer ID |
| `SetPrivacyMode` | U | Set privacy mode |
| `GetSessionToken` | U | Get session token for destination (portal/aiserver/auth_proxy) |
| `CheckSessionToken` | U | Validate a session token |
| `ListActiveSessions` | U | List active sessions |
| `RevokeSession` | U | Revoke a session |
| `ListJwtPublicKeys` | U | List JWT public keys |

---

### `aiserver.v1.DashboardService`

Dashboard, billing, team management. **306 methods.** **Base URL**: `api2.cursor.sh`

#### Team Management
| Method | Description |
|--------|-------------|
| `GetTeams` | List user's teams |
| `GetMe` | Get current user profile |
| `CreateTeam` | Create new team |
| `CreateTeamWithFreeTrial` | Create team with free trial |
| `GetTeamMembers` | List team members |
| `SendTeamInvite` | Send team invite email |
| `GetTeamInviteLink` | Get invite link |
| `AcceptInvite` | Accept team invite |
| `RevokeTeamInviteLink` | Revoke invite link |
| `ListTeamInviteLinks` | List all invite links |
| `UpdateRole` | Update member role |
| `RemoveMember` | Remove team member |
| `JoinTeamByDomain` | Join team by email domain |
| `UpdateTeamDomainJoinSetting` | Configure domain join |
| `GetJoinableTeamsByDomain` | Find teams joinable by domain |
| `GetTeamMemberDomains` | Get allowed domains |
| `ChangeSeat` | Change seat assignment |
| `ChangeTeamSubscription` | Change subscription plan |
| `UpdateTeamName` | Rename team |

#### Billing & Usage
| Method | Description |
|--------|-------------|
| `GetCurrentPeriodUsage` | Get current period usage stats |
| `GetPlanInfo` | Get current plan info |
| `GetTeamUsage` | Get team-wide usage |
| `GetHardLimit` | Get hard spend limit |
| `SetHardLimit` | Set hard spend limit |
| `SetUserHardLimit` | Set per-user hard limit |
| `SetUserMonthlyLimit` | Set per-user monthly limit |
| `EnableOnDemandSpend` | Enable on-demand billing |
| `GetMonthlyInvoice` | Get monthly invoice |
| `ListInvoiceCycles` | List billing cycles |
| `ListInvoices` | List all invoices |
| `GetDailySpendByCategory` | Get daily spend breakdown |
| `GetPricingHistory` | Get pricing change history |
| `GetTeamSpend` | Get team total spend |
| `GetCurrentBillingCycle` | Get current billing cycle |
| `GetMonthlyBillingCycle` | Get monthly billing cycle |
| `GetUsageLimitPolicyStatus` | Get usage limit policy |
| `GetUsageLimitStatusAndActiveGrants` | Get limit status and grants |
| `GetCreditGrantsBalance` | Get credit balance |
| `GetTokenUsage` | Get token usage breakdown |
| `GetUsageBasedPremiumRequests` | Get usage-based request limit |
| `SetUsageBasedPremiumRequests` | Set usage-based request limit |
| `GetActivationCheckoutUrl` | Get Stripe checkout URL |
| `GetTeamCustomerPortalUrl` | Get Stripe customer portal URL |
| `GetServiceAccountSpendLimit` | Get service account limit |
| `SetServiceAccountSpendLimit` | Set service account limit |
| `GetRemainingRefunds` | Get refund balance |
| `GetFilteredUsageEvents` | Get filtered usage events |
| `GetAggregatedUsageEvents` | Get aggregated usage data |
| `ListUsageAlerts` | List usage alerts |
| `CreateUsageAlerts` | Create usage alert |
| `DeleteUsageAlerts` | Delete usage alert |
| `UpdateUsageAlerts` | Update usage alert |
| `GetAdvancedAnalyticsEnabled` | Check advanced analytics |
| `IsOnNewPricing` | Check if on new pricing model |
| `OptOutNewPricing` | Opt out of new pricing |
| `RequestIndividualLimitsOptOut` | Request individual limits opt-out |

#### Analytics
| Method | Description |
|--------|-------------|
| `GetTeamAnalytics` | Get team analytics |
| `GetUserAnalytics` | Get user analytics |
| `GetTeamRawData` | Get raw team data |
| `GetClientUsageData` | Get client usage data |
| `GetAuditLogs` | Get audit log entries |
| `UpdateTeamDashboardAnalyticsSetting` | Toggle dashboard analytics |

#### GitHub Integration
| Method | Description |
|--------|-------------|
| `ConnectGithubCallback` | Handle OAuth callback |
| `RegisterGithubCursorCode` | Register GitHub app code |
| `DisconnectGithub` | Disconnect GitHub |
| `PrepareSetupGithubEnterpriseApp` | Prepare GHE app setup |
| `FinishSetupGithubEnterpriseApp` | Complete GHE app setup |
| `ListGithubEnterpriseApps` | List GHE apps |
| `DeleteGithubEnterpriseApp` | Delete GHE app |
| `GetGithubInstallations` | List GitHub installations |
| `GetInstallationRepos` | List repos for installation |
| `FetchAllInstallationRepos` | Fetch all repos |
| `GetInstallationGithubUsers` | List GitHub users |
| `GetUserAdminOrganizations` | Get admin orgs |
| `GetTeamGithubUsers` | Get team GitHub users |
| `AddGithubUsersToTeam` | Add GitHub users to team |
| `GetUserPullRequests` | List user PRs |
| `GetUserReviewRequests` | List review requests |
| `GetPullRequestForBranch` | Get PR for a branch |
| `UpdateGithubRepoSettings` | Update repo settings |
| `UpdateGithubInstallationSettings` | Update installation settings |
| `UpdateAllGithubRepoSettings` | Bulk update repo settings |
| `UpdateGithubInstallationTeamScope` | Update team scope |
| `UpdateSelfGithubAllowlist` | Update self allowlist |
| `ConfirmGithubInstallation` | Confirm installation |

#### GitLab Integration
| Method | Description |
|--------|-------------|
| `SetupGitlabEnterpriseInstance` | Configure GitLab instance |
| `ListGitlabEnterpriseInstances` | List GitLab instances |
| `DeleteGitlabEnterpriseInstance` | Delete GitLab instance |
| `SyncGitlabRepos` | Sync GitLab repos |

#### MCP (Model Context Protocol)
| Method | Description |
|--------|-------------|
| `GetMcpConfig` | Get MCP configuration |
| `GetAvailableMcpServers` | List available MCP servers |
| `SetMcpConfig` | Update MCP configuration |
| `UpdateUserDefaultMcpSettings` | Update user MCP defaults |
| `MarkMcpServersSeen` | Mark MCP servers as seen |
| `StoreMcpOAuthToken` | Store MCP OAuth token |
| `DeleteMcpOAuthToken` | Delete MCP OAuth token |
| `ValidateMcpOAuthTokens` | Validate stored tokens |
| `CheckHttpMcpStatus` | Check HTTP MCP server status |
| `StoreMcpOAuthPendingState` | Store pending OAuth state |
| `GetMcpOAuthPendingState` | Get pending OAuth state |
| `GetPluginMcpConfig` | Get plugin MCP config |
| `BatchGetPluginMcpConfig` | Batch get plugin MCP configs |
| `AddMcpServersFromPlugin` | Add MCP servers from plugin |
| `ProbeMcpUrl` | Probe MCP URL for availability |

#### Team Rules & Hooks
| Method | Description |
|--------|-------------|
| `GetTeamRules` | Get team AI rules |
| `CreateTeamRule` | Create team rule |
| `UpdateTeamRule` | Update team rule |
| `DeleteTeamRule` | Delete team rule |
| `GetTeamHooks` | Get team hooks |
| `CreateTeamHook` | Create hook |
| `UpdateTeamHook` | Update hook |
| `DeleteTeamHook` | Delete hook |
| `GetTeamCommands` | Get team slash commands |
| `CreateTeamCommand` | Create slash command |
| `UpdateTeamCommand` | Update slash command |
| `DeleteTeamCommand` | Delete slash command |
| `GetGlobalCommands` | Get global commands |
| `GetProtectedGitScopes` | Get protected git scopes |
| `CreateProtectedGitScope` | Create protected scope |
| `DeleteProtectedGitScope` | Delete protected scope |

#### Privacy & Settings
| Method | Description |
|--------|-------------|
| `GetUserPrivacyMode` | Get user privacy mode |
| `SetUserPrivacyMode` | Set user privacy mode |
| `WebAcknowledgeGracePeriodDisclaimer` | Acknowledge grace period (web) |
| `SkipPrivacyModeGracePeriod` | Skip grace period |
| `NeedsPrivacyModeMigration` | Check if migration needed |
| `UpdateTeamPrivacyModeMigrationOptOut` | Opt out of privacy migration |
| `GetTeamPrivacyModeForced` | Check if privacy mode is forced |
| `SwitchTeamPrivacyMode` | Toggle team privacy mode |
| `GetTeamAdminSettings` | Get team admin settings |
| `GetTeamAdminSettingsOrEmptyIfNotInTeam` | Safe get admin settings |
| `GetBaseTeamAdminSettings` | Get base admin settings |
| `UpdateTeamAdminSettings` | Update admin settings |

#### Conversations (Sharing)
| Method | Description |
|--------|-------------|
| `ShareConversation` | Share a chat conversation |
| `GetSharedConversation` | Get shared conversation |
| `GetPublicSharedConversation` | Get public shared conversation |
| `ListSharedConversations` | List shared conversations |
| `DeleteSharedConversation` | Delete shared conversation |
| `UpdateSharedConversationVisibility` | Update share visibility |
| `GetTeamSharedConversationSettings` | Get team share settings |
| `UpdateTeamSharedConversationSettings` | Update team share settings |

#### BugBot
| Method | Description |
|--------|-------------|
| `GetBugbotSettings` | Get BugBot settings |
| `GetBugbotAnalyticsV2` | Get BugBot analytics |
| `GetBugBotPRAnalytics` | Get PR analytics |
| `GetTeamBugbotSettings` | Get team BugBot settings |
| `UpdateTeamBugbotSettings` | Update team settings |
| `GetBugbotUserSettings` | Get user BugBot settings |
| `UpdateBugbotUserSettings` | Update user settings |
| `GetBugBotProUserSettings` | Get Pro user settings |
| `UpdateBugBotProUserSettings` | Update Pro user settings |
| `GetBugbotTeamRules` | Get BugBot team rules |
| `CreateBugbotTeamRule` | Create BugBot rule |
| `UpdateBugbotTeamRule` | Update BugBot rule |
| `DeleteBugbotTeamRule` | Delete BugBot rule |
| `GetBugbotLearnedRules` | Get learned rules |
| `UpdateBugbotLearnedRule` | Update learned rule |
| `DeleteBugbotLearnedRule` | Delete learned rule |
| `GetBugbotRuleAnalytics` | Get rule analytics |
| `GetBugbotRuleById` | Get rule by ID |
| `RecordBugbotDeeplinkEvent` | Record deeplink event |
| `RecordBugbotDeeplinkEventUnauthenticated` | Record deeplink event (unauthed) |
| `RevokeBugBotLicenses` | Revoke BugBot licenses |
| `RevokeUserBugbotLicense` | Revoke user license |
| `StartBugbotBackfillLearning` | Start backfill learning |
| `GetBugbotBackfillStatus` | Get backfill status |

#### Slack Integration
| Method | Description |
|--------|-------------|
| `SetSlackAuth` | Set Slack authentication |
| `GetSlackTeamSettings` | Get Slack team settings |
| `UpdateSlackTeamSettings` | Update Slack team settings |
| `GetSlackSettings` | Get Slack settings |
| `GetSlackModelOptions` | Get available Slack models |
| `GetSlackInstallUrl` | Get Slack install URL |
| `GetSlackInstallUrlPublic` | Get public Slack install URL |
| `GetSlackInstallUrlPublicWithUserScopes` | Get URL with user scopes |
| `GetSlackUserSettings` | Get user Slack settings |
| `UpdateSlackUserSettings` | Update user settings |
| `GetSlackRepoRoutingRules` | Get repo routing rules |
| `CreateSlackRepoRoutingRule` | Create routing rule |
| `UpdateSlackRepoRoutingRule` | Update routing rule |
| `DeleteSlackRepoRoutingRule` | Delete routing rule |
| `UnlinkSlackAccess` | Unlink Slack access |
| `ListSlackConversations` | List Slack conversations |
| `LogSlackbotAuthConversionFunnel` | Log auth conversion |
| `LogClickedConnectSlack` | Log Slack connect click |
| `CompletedLinkSlackAccount` | Complete Slack link |

#### Linear Integration
| Method | Description |
|--------|-------------|
| `GetLinearAuthUrl` | Get Linear auth URL |
| `ConnectLinearCallback` | Handle Linear callback |
| `GetLinearStatus` | Get Linear connection status |
| `DisconnectLinear` | Disconnect Linear |
| `GetLinearTeams` | List Linear teams |
| `GetLinearSettings` | Get Linear settings |
| `UpdateLinearTeamSetting` | Update team setting |
| `UpdateLinearProjectSetting` | Update project setting |
| `GetLinearLabels` | List Linear labels |
| `GetLinearIssues` | List Linear issues |

#### Background Agent / Secrets
| Method | Description |
|--------|-------------|
| `ListBackgroundComposerSecrets` | List agent secrets |
| `CreateBackgroundComposerSecret` | Create agent secret |
| `CreateBackgroundComposerSecretBatch` | Batch create secrets |
| `RevokeBackgroundComposerSecret` | Revoke agent secret |
| `UpdateBackgroundComposerSecret` | Update agent secret |
| `GetTeamBackgroundAgentSettings` | Get team agent settings |
| `UpdateTeamBackgroundAgentSettings` | Update team agent settings |

#### API Keys & Service Accounts
| Method | Description |
|--------|-------------|
| `CreateTeamApiKey` | Create team API key |
| `RevokeTeamApiKey` | Revoke team API key |
| `ListTeamApiKeys` | List team API keys |
| `CreateTeamServiceAccount` | Create service account |
| `ListTeamServiceAccounts` | List service accounts |
| `DeleteTeamServiceAccount` | Delete service account |
| `ArchiveTeamServiceAccount` | Archive service account |
| `RotateServiceAccountApiKey` | Rotate service account key |
| `GetTeamRepositoriesForServiceAccountScope` | Get repos for SA scope |
| `UpdateServiceAccountRepoScope` | Update SA repo scope |
| `CreateUserApiKey` | Create user API key |
| `RevokeUserApiKey` | Revoke user API key |
| `ListUserApiKeys` | List user API keys |
| `CheckUserApiKeyAccess` | Check key access level |

#### Marketplace / Plugins
| Method | Description |
|--------|-------------|
| `ListMarketplacePlugins` | List marketplace plugins |
| `GetPlugin` | Get plugin details |
| `CreatePlugin` | Create plugin |
| `UpdatePlugin` | Update plugin |
| `ParseGitHubRepoForPlugins` | Parse GitHub repo for plugins |
| `ImportPluginsFromGitHub` | Import plugins from GitHub |
| `PreviewReindexPluginRepo` | Preview plugin repo reindex |
| `ApplyReindexPluginRepo` | Apply plugin repo reindex |
| `CheckPluginRepoUpdates` | Check for repo updates |
| `SubmitPluginForApproval` | Submit plugin for review |
| `ApprovePlugin` | Approve plugin |
| `RejectPlugin` | Reject plugin |
| `ListUserPluginInstalls` | List user installs |
| `InstallUserPlugin` | Install plugin for user |
| `UpdateUserPluginInstall` | Update user install |
| `UninstallUserPlugin` | Uninstall plugin |
| `ListTeamPluginInstalls` | List team installs |
| `InstallTeamPlugin` | Install plugin for team |
| `UpdateTeamPluginInstall` | Update team install |
| `UninstallTeamPlugin` | Uninstall team plugin |
| `GetEffectiveUserPlugins` | Get effective plugins for user |
| `ResolvePluginsByRef` | Resolve plugins by reference |
| `ListPublishers` | List plugin publishers |
| `GetPublisher` | Get publisher details |
| `CreatePublisher` | Create publisher account |
| `UpdatePublisher` | Update publisher |
| `DeprecatePlugin` | Deprecate a plugin |
| `ListMarketplaces` | List marketplaces |
| `AddMarketplace` | Add marketplace |
| `RemoveMarketplace` | Remove marketplace |
| `RefreshMarketplace` | Refresh marketplace |
| `RegisterMarketplaceAndPlugins` | Register marketplace |
| `GetManagedSkills` | Get managed skills |

#### Misc
| Method | Description |
|--------|-------------|
| `GetSignUpType` | Get signup type |
| `DeleteAccount` | Delete user account |
| `SendDownloadEmail` | Send download link email |
| `GetDownloadLink` | Get IDE download link |
| `GetCliDownloadUrl` | Get CLI download URL |
| `GetSsoConfigurationLinks` | Get SSO config links |
| `GetScimConfigurationLinks` | Get SCIM config links |
| `UpdateFastRequests` | Update fast request limit |
| `GetFastRequests` | Get fast request limit |
| `CheckPromotionEligibility` | Check promo eligibility |
| `ActivatePromotion` | Activate a promotion |
| `GetReferrals` | Get referral list |
| `GetReferralCodes` | Get referral codes |
| `CheckReferralAllowlist` | Check referral allowlist |
| `CheckReferralCode` | Validate referral code |
| `RedeemGiftCode` | Redeem gift code |
| `GetTeamIdForReactivation` | Get team for reactivation |
| `GetYearlyUpgradeEligibility` | Check yearly upgrade eligibility |
| `UpgradeToYearly` | Upgrade to yearly plan |
| `GetEnterpriseCTAEligibility` | Check enterprise CTA |
| `ValidateBedrockIamRole` | Validate AWS IAM role |
| `DeleteBedrockIamRole` | Delete IAM role |
| `AddUserToEarlyAccessList` | Add to early access |
| `NotifyTeamAdmins` | Notify team admins |
| `GetAdminNotificationStatus` | Get notification status |
| `SubmitFeedback` | Submit feedback |
| `CanStudentReverify` | Check student reverification |
| `GetActiveOffboardingBanner` | Get offboarding banner |
| `ClientAction` | Generic client action (e.g. `requestLimitIncrease`) |
| `ToggleMarketingEmailOpt` | Toggle marketing emails |
| `GetMarketingEmailOpt` | Get marketing email opt status |
| `GetGlobalLeaderboardOptIn` | Get leaderboard opt-in |
| `SetGlobalLeaderboardOptIn` | Set leaderboard opt-in |
| `UpdateUserName` | Update display name |
| `SetAdminOnlyUsagePricing` | Set admin-only usage pricing |
| `GetTeamHasValidPaymentMethod` | Check payment method |
| `IsAllowedFreeTrialUsage` | Check free trial eligibility |
| `IsNextSetupRunFree` | Check if next setup run is free |
| `GetScimConflicts` | Get SCIM conflicts |
| `GetDirectoryGroups` | Get directory groups |
| `UpdateDirectoryGroupSettings` | Update directory group settings |
| `GetGroups` | Get groups |
| `GetGroupMembers` | Get group members |
| `CreateGroup` | Create group |
| `UpdateGroup` | Update group |
| `DeleteGroup` | Delete group |
| `AddGroupMembers` | Add group members |
| `RemoveGroupMembers` | Remove group members |
| `BulkAssignGroupMembers` | Bulk assign members |
| `PreviewAttachGroupToDirectory` | Preview group attachment |
| `DetachGroupFromDirectory` | Detach group |
| `CreateTeamFreeTrialCode` | Create trial code |
| `GetTeamRepos` | Get team repositories |
| `GetTeamReposOrEmptyIfNotInTeam` | Get repos (safe) |
| `CreateTeamRepo` | Create team repo entry |
| `DeleteTeamRepo` | Delete team repo |
| `AddRepoPattern` | Add repo pattern |
| `RemoveRepoPattern` | Remove repo pattern |
| `SetTeamRepoType` | Set repo type |

---

### `aiserver.v1.AutopilotService` / `aiserver.v1.BackgroundComposerService`

Background agent (cloud runner) management. **Base URL**: `agent.api5.cursor.sh` / regional variants

> Note: `AutopilotService` and `BackgroundComposerService` share the same method set, with `BackgroundComposerService` having a few additional methods.

| Method | Kind | Description |
|--------|------|-------------|
| `StreamAutopilot` | SS | Stream autopilot agent actions (AutopilotService only) |
| `ListBackgroundComposers` | U | List background agent sessions |
| `ListDetailedBackgroundComposers` | U | List sessions with details |
| `AttachBackgroundComposer` | SS | Attach to running agent stream |
| `AttachBackgroundComposerLogs` | SS | Attach to agent logs stream |
| `StreamInteractionUpdates` | SS | Stream interaction updates |
| `StreamInteractionUpdatesSSE` | SS | SSE variant |
| `StreamConversation` | SS | Stream agent conversation |
| `GetLatestAgentConversationState` | U | Get latest conversation state |
| `GetBlobForAgentKV` | U | Get blob from agent KV store |
| `StartBackgroundComposerFromSnapshot` | U | Start agent from snapshot |
| `StartParallelAgentWorkflow` | U | Start parallel workflow |
| `StreamParallelAgentWorkflowStatus` | SS | Stream parallel workflow status |
| `MakePRBackgroundComposer` | U | Create PR from agent changes |
| `OpenPRBackgroundComposer` | U | Open PR in browser |
| `GetBackgroundComposerStatus` | U | Get agent status |
| `AddAsyncFollowupBackgroundComposer` | U | Add async followup |
| `ListPendingFollowups` | U | List pending followups |
| `UpdatePendingFollowup` | U | Update followup |
| `DeletePendingFollowup` | U | Delete followup |
| `ReorderPendingFollowup` | U | Reorder followup |
| `SubmitPendingFollowupNow` | U | Execute followup immediately |
| `GetCursorServerUrl` | U | Get cursor server download URL |
| `WarmCursorServerDownload` | U | Pre-warm server download |
| `PauseBackgroundComposer` | U | Pause agent |
| `ResumeBackgroundComposer` | U | Resume agent |
| `ArchiveBackgroundComposer` | U | Archive agent session |
| `GetBackgroundComposerInfo` | U | Get agent info |
| `GetBackgroundComposerRepositoryInfo` | U | Get repo info for agent |
| `GetMachine` | U | Get machine info |
| `GetGithubAccessTokenForRepos` | U | Get GitHub token for repos |
| `GetBackgroundComposerDiffDetails` | U | Get diff details |
| `GetOptimizedDiffDetails` | U | Get optimized diff details |
| `GetBackgroundComposerChangesHash` | U | Get changes hash |
| `GetBackgroundComposerPullRequest` | U | Get associated PR |
| `RefreshGithubAccessTokenInBackgroundComposer` | U | Refresh GitHub token |
| `CreateBackgroundComposerPod` | U | Create agent pod |
| `AttachBackgroundComposerPod` | SS | Attach to pod stream |
| `CreateBackgroundComposerPodSnapshot` | U | Create pod snapshot |
| `ChangeBackgroundComposerSnapshotVisibility` | U | Change snapshot visibility |
| `GetBackgroundComposerSnapshotInfo` | U | Get snapshot info |
| `ListBackgroundComposerSnapshotsByBcId` | U | List snapshots for agent |
| `ListBackgroundComposerSnapshotStatusesByBcIds` | U | List snapshot statuses |
| `GetBackgroundComposerSnapshotState` | U | Get snapshot state |
| `WatchBackgroundComposerSnapshotState` | SS | Watch snapshot state |
| `GetBackgroundComposerConversation` | U | Get agent conversation |
| `RenameBackgroundComposer` | U | Rename agent session |
| `CommitBackgroundComposer` | U | Commit agent changes |
| `SetPersonalEnvironmentJson` | U | Set personal env config |
| `GetPersonalEnvironmentJson` | U | Get personal env config |
| `GetEnvironmentJsonCandidates` | U | Get env config candidates |
| `ListPersonalEnvironments` | U | List personal environments |
| `DeletePersonalEnvironmentJson` | U | Delete env config |

---

### `aiserver.v1.RepositoryService`

Codebase indexing and search. **Base URL**: `repo42.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `FastRepoInitHandshake` | U | Initialize repo indexing |
| `FastRepoInitHandshakeV2` | U | V2 repo init |
| `SyncMerkleSubtree` | U | Sync Merkle subtree |
| `SyncMerkleSubtreeV2` | U | V2 Merkle sync |
| `FastUpdateFile` | U | Update single file in index |
| `FastUpdateFileV2` | U | V2 file update |
| `FastRepoSyncComplete` | U | Signal sync complete |
| `SearchRepositoryV2` | U | Search repository V2 |
| `RemoveRepositoryV2` | U | Remove repository V2 |
| `SemSearchFast` | SS | Fast semantic search |
| `SemSearch` | SS | Semantic search |
| `EnsureIndexCreated` | U | Ensure index exists |
| `GetHighLevelFolderDescription` | U | Get folder description |
| `GetEmbeddings` | U | Get text embeddings |
| `GetUploadLimits` | U | Get file upload limits |
| `GetNumFilesToSend` | U | Get recommended file batch size |
| `GetAvailableChunkingStrategies` | U | List chunking strategies |
| `GetLineNumberClassifications` | SS | Stream line classifications |
| `GetCopyStatus` | U | Get index copy status |
| `RepoHistoryInitHandshake` | U | Initialize git history sync |
| `RepoHistorySyncOne` | U | Sync one history entry |
| `RepoHistorySyncComplete` | U | Complete history sync |
| `RemoveRepoHistory` | U | Remove repo history |
| `SearchPRHistory` | U | Search PR history |
| `GetPRIndexingStatus` | U | Get PR indexing status |

---

### `aiserver.v1.CppService`

Cursor Tab (autocomplete) management. **Base URL**: `api4.cursor.sh` (geo-routed)

| Method | Kind | Description |
|--------|------|-------------|
| `MarkCppForEval` | U | Mark a CPP sample for evaluation |
| `StreamHoldCpp` | SS | Stream CPP hold state |
| `AvailableModels` | U | List available CPP models |
| `RecordCppFate` | U | Record CPP acceptance/rejection |
| `AddTabRequestToEval` | U | Add tab request to eval set |

---

### `aiserver.v1.AnalyticsService`

Telemetry and analytics. **Base URL**: `api3.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `TrackEvents` | U | Track analytics events |
| `Batch` | U | Batch event upload (Segment-compatible) |
| `BootstrapStatsig` | U | Bootstrap Statsig feature flags |
| `SubmitLogs` | U | Submit log entries |
| `IngestConversation` | U | Ingest conversation data |
| `UploadIssueTrace` | U | Upload issue trace (also exposed as REST POST) |
| `DownloadIssueTraces` | U | Download issue traces |

---

### `aiserver.v1.ServerConfigService`

Server-side configuration. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `GetServerConfig` | U | Get full server configuration |

**GetServerConfigRequest fields:**
- `telem_enabled` (bool)
- `bug_bot_dismissed_notification_last_10_times_unix_ms` (repeated int64)
- `bug_bot_viewed_notification_last_10_times_unix_ms` (repeated int64)

**GetServerConfigResponse fields:**
- `bug_config_response` — BugBot configuration
- `is_dev` — dev environment flag
- `indexing_config` — codebase indexing config
- `client_tracing_config` — distributed tracing config
- `chat_config` — chat feature config
- `config_version` — version string for cache control
- `http2_config` — HTTP/2 settings
- `profiling_config` — profiling settings
- `metrics_config` — metrics settings
- `background_composer_config` — background agent config
- `auto_context_config` — auto-context settings
- `model_migrations` — model migration rules
- `memory_monitor_config` — memory monitoring
- `folder_size_limit` — folder size limit
- `online_metrics_config` — online metrics config
- `git_indexing_config` — git indexing config
- `onboarding_config` — onboarding settings (includes `marketplacePluginNames`, `repo42AuthToken`)

---

### `aiserver.v1.ReviewService`

Code review service. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `StreamReview` | SS | Stream code review |
| `StreamReviewChat` | SS | Stream review chat |
| `StreamSlowReview` | SS | Slow, comprehensive review |
| `BugConfig` | U | Get BugBot config |
| `StreamBugBotLinter` | SS | Stream BugBot lint results |
| `StreamBugFinding` | SS | Stream bug detection |

---

### `aiserver.v1.FileSyncService`

File sync and storage. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `FSUploadFile` | U | Upload file to server |
| `FSSyncFile` | U | Sync file with server |
| `FSIsEnabledForUser` | U | Check if FS is enabled |
| `FSConfig` | U | Get FS configuration |
| `FSGetFileContents` | U | Get file contents |
| `FSGetMultiFileContents` | U | Get multiple files |
| `FSInternalSyncFile` | U | Internal file sync |
| `FSInternalUploadFile` | U | Internal file upload |
| `FSInternalHealthCheck` | U | Internal health check |

---

### `aiserver.v1.DeeplinkService`

Deeplink management. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `CreateDeeplink` | U | Create a new deeplink |
| `GetDeeplinkData` | U | Get deeplink data |
| `ListDeeplinks` | U | List deeplinks |

---

### `aiserver.v1.GitGraphService`

Git commit graph indexing. **Base URL**: `repo42.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `InitGitGraph` | U | Initialize git graph |
| `InitGitGraphChallenge` | U | Challenge/response for init |
| `BatchedUploadCommitsIntoGitGraph` | U | Upload commits in batch |
| `GetPendingCommits` | U | Get pending commits |
| `MarkPendingCommits` | U | Mark commits as processed |
| `GetGitGraphRelatedFiles` | U | Get files related to commits |
| `GetGitGraphStatus` | U | Get git graph status |
| `DeleteGitGraph` | U | Delete git graph |
| `IsGitGraphEnabled` | U | Check if git graph is enabled |

---

### `aiserver.v1.AiProjectService`

AI project (wizard-style) generation. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `AiProjectAgentInit` | SS | Initialize AI project agent |
| `AiProjectClarification` | SS | Stream clarification questions |
| `AiProjectPlan` | SS | Stream project plan generation |
| `AiProjectPlanFeedback` | SS | Stream plan feedback |
| `AiProjectBreakdown` | SS | Stream project breakdown |
| `AiProjectBreakdownFeedback` | SS | Stream breakdown feedback |
| `AiProjectStep` | SS | Stream project step execution |
| `AiProjectStepFeedback` | SS | Stream step feedback |

---

### `aiserver.v1.MetricsService`

Metrics reporting. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `ReportIncrement` | U | Report counter increment |
| `ReportDecrement` | U | Report counter decrement |
| `ReportDistribution` | U | Report distribution metric |
| `ReportGauge` | U | Report gauge metric |
| `SubmitPerformanceEvents` | U | Submit performance events |
| `SubmitProfile` | U | Submit profiling data |
| `SubmitInteractionWindow` | U | Submit interaction window data |
| `SubmitSpans` | U | Submit trace spans |
| `SubmitToolCallEvents` | U | Submit tool call events |
| `SubmitChatRequestEvents` | U | Submit chat request events |

---

### `aiserver.v1.CodebaseSnapshotService`

Codebase snapshot management. **Base URL**: `repo42.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `RegisterCodebase` | U | Register a codebase |
| `RegisterCodebaseSnapshot` | U | Register a snapshot |
| `GetCodebaseSnapshotStatus` | U | Get snapshot status |
| `CreatePackfileUpload` | U | Create packfile upload session |
| `CompletePackfileUpload` | U | Complete packfile upload |
| `UploadPackfileChunk` | U | Upload packfile chunk |
| `CursorPredictionConfig` | U | Get cursor prediction config |

---

### `aiserver.v1.AutomationsService`

Scheduled automations management. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `CreateAutomation` | U | Create automation |
| `ListAutomations` | U | List automations |
| `GetAutomation` | U | Get automation details |
| `UpdateAutomation` | U | Update automation |
| `DeleteAutomation` | U | Delete automation |
| `TestAutomation` | U | Test automation |
| `ListAutomationRuns` | U | List run history |
| `ListAutomationMemories` | U | List memories |
| `GetAutomationMemory` | U | Get memory entry |
| `UpdateAutomationMemory` | U | Update memory entry |
| `ListWorkflowTemplates` | U | List workflow templates |
| `GetWorkflowTemplate` | U | Get template details |
| `CreateWorkflowFromTemplate` | U | Create workflow from template |

---

### `aiserver.v1.ConversationsService`

Conversation metrics. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `GetCommitMetrics` | U | Get commit-level metrics |
| `GetCommitMetricsByFilePath` | U | Get metrics by file path |

---

### `aiserver.v1.FastApplyService`

Fast code apply operations. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `ReportEditFate` | U | Report edit acceptance/rejection |
| `WarmApply` | U | Pre-warm apply |
| `LintFile` | U | Lint a file |
| `LintChunk` | U | Lint a code chunk |
| `LintFimChunk` | U | Lint FIM chunk |
| `LintExplanation` | SS | Stream lint explanation |
| `LintExplanation2` | U | Get lint explanation |

---

### `aiserver.v1.InferenceService`

Model inference. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `Stream` | SS | Stream inference result |
| `RecordAgentFollowupClassification` | U | Record agent followup type |

---

### `aiserver.v1.MCPRegistryService`

MCP server registry. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `GetKnownServers` | U | Get list of known MCP servers |

---

### `aiserver.v1.MarketplaceService`

Marketplace connectivity. **Base URL**: `marketplace.cursorapi.com`

| Method | Kind | Description |
|--------|------|-------------|
| `CreateMarketplaceExtensionPublisher` | U | Create publisher account |
| `GetPublicIp` | U | Get client public IP |
| `IsConnected` | U | Check connectivity |

---

### `aiserver.v1.ShadowWorkspaceService`

Shadow workspace for linting/checking. **Base URL**: localhost (shadow workspace)

| Method | Kind | Description |
|--------|------|-------------|
| `GetLintsForChange` | U | Get lints for code change |
| `ShadowHealthCheck` | U | Shadow workspace health |
| `SwSyncIndex` | U | Sync shadow index |
| `SwProvideTemporaryAccessToken` | U | Provide temp access token |
| `SwCompileRepoIncludeExcludePatterns` | U | Compile include/exclude patterns |
| `SwCallClientSideV2Tool` | U | Call client-side V2 tool |
| `SwGetExplicitContext` | U | Get explicit context |
| `SwWriteTextFileWithLints` | U | Write file and get lints |
| `SwGetEnvironmentInfo` | U | Get environment info |
| `SwGetLinterErrors` | U | Get linter errors |
| `SwGetMcpTools` | U | Get MCP tools |
| `SwTrackModel` | U | Track model usage |
| `SwCallDiagnosticsExecutor` | U | Call diagnostics executor |

---

### `aiserver.v1.VmDaemonService`

VM daemon (background agent sandbox). **Base URL**: background agent VM

| Method | Kind | Description |
|--------|------|-------------|
| `SyncIndex` | U | Sync code index |
| `CompileRepoIncludeExcludePatterns` | U | Compile patterns |
| `Upgrade` | U | Upgrade daemon |
| `Ping` | U | Health ping |
| `Exec` | U | Execute command |
| `CallClientSideV2Tool` | U | Call client tool |
| `ReadTextFile` | U | Read text file |
| `WriteTextFile` | U | Write text file |
| `GetFileStats` | U | Get file statistics |
| `GetExplicitContext` | U | Get explicit context |
| `GetEnvironmentInfo` | U | Get environment info |
| `ProvideTemporaryAccessToken` | U | Provide temp token |
| `WarmCursorServer` | U | Warm cursor server |
| `RefreshGitHubAccessToken` | U | Refresh GitHub token |
| `GetWorkspaceChangesHash` | U | Get changes hash |
| `GetDiff` | U | Get workspace diff |
| `GetLinterErrors` | U | Get linter errors |
| `GetLogs` | U | Get agent logs |
| `InstallExtensions` | U | Install extensions |
| `GetMcpTools` | U | Get MCP tools |
| `TrackModel` | U | Track model |
| `CallDiagnosticsExecutor` | U | Call diagnostics executor |

---

### `aiserver.v1.HealthService`

Health and diagnostics.

| Method | Kind | Description |
|--------|------|-------------|
| `Ping` | U | Basic ping |
| `Unary` | U | Test unary call |
| `Stream` | SS | Test stream |
| `StreamSSE` | SS | Test SSE |
| `StreamBidi` | BD | Test bidi |
| `StreamBidiSSE` | SS | Test bidi SSE |
| `StreamBidiPoll` | SS | Test bidi poll |
| `HasSeenAd` | U | Check ad status |
| `MarkAdAsSeen` | U | Mark ad as seen |
| `ResetUserAdViews` | U | Reset ad views |

---

### `aiserver.v1.SchedulerService`

Request scheduling. **Base URL**: `api2.cursor.sh`

| Method | Kind | Description |
|--------|------|-------------|
| `Acquire` | U | Acquire scheduler slot |
| `ReportUsage` | U | Report slot usage |
| `SchedulerStream` | BD | Bidirectional scheduler stream |

---

### `aiserver.v1.TeamCreditsService`

Team credit management.

| Method | Kind | Description |
|--------|------|-------------|
| `GetTeamCredits` | U | Get team credit balance |
| `SetTeamCredits` | U | Set team credits |
| `ClearTeamCredits` | U | Clear team credits |

---

### `aiserver.v1.EnterpriseAdminService`

Enterprise contract management.

| Method | Kind | Description |
|--------|------|-------------|
| `GetManualEnterpriseContract` | U | Get contract |
| `ListManualEnterpriseContracts` | U | List contracts |
| `CreateManualEnterpriseContract` | U | Create contract |
| `CreateContractExpansion` | U | Add contract expansion |
| `UpsertManualEnterpriseContract` | U | Upsert contract |
| `DeleteManualEnterpriseContract` | U | Delete contract |
| `ListEnterpriseContracts` | U | List all contracts |
| `EnableTokenBasedPricing` | U | Enable token pricing |
| `GetEnterpriseStatus` | U | Get enterprise status |
| `StartTokenBasedTrial` | U | Start token-based trial |
| `GetTeamUsageForDateRange` | U | Get usage for date range |

---

### Other `aiserver.v1` Services

| Service | Methods | Description |
|---------|---------|-------------|
| `BidiService` | 30+ | Bidirectional service (combines multiple services) |
| `AiBranchService` | 40+ | AI branch operations |
| `BugbotService` | 30+ | BugBot combined service |
| `BugbotAdminService` | GetTeamTrialEnd, SetTeamTrialEnd, GetProUserTrialEnd, SetProUserTrialEnd, GetRepoNodeId | BugBot admin |
| `CiMetricsService` | 7 | CI metrics collection |
| `ClientLoggerService` | GetDebuggingDataUploadUrl, LogWhenTabTurnsOff | Client-side logging |
| `CmdKService` | 20+ | CmdK combined service |
| `CursorPredictionService` | CursorPredictionConfig, GitFilter, FileFilter, BugAnalysis | Prediction config |
| `DebuggerService` | GitFilter, FileFilter, BugAnalysis | Debug services |
| `DistributorService` | SchedulerStream | Distribution |
| `EvalTrackingService` | 17 | Evaluation tracking |
| `FastSearchService` | StartFastSearch, FastSearch | Fast search |
| `GitIndexService` | 6 | Git index sync |
| `HallucinatedFunctionsService` | V0ChainRun, Opus2Chain*, test methods | Hallucination detection |
| `InAppAdService` | HasSeenAd, MarkAdAsSeen, ResetUserAdViews | In-app ads |
| `LinterService` | 15 | Linting services |
| `NetworkService` | GetPublicIp, IsConnected | Network utilities |
| `OnlineMetricsService` | ReportAgentSnapshot, Health, RecordRequest, ReplayRequest | Online metrics |
| `PerformanceEventService` | 6 | Performance events |
| `ProfilingService` | 5 | Profiling |
| `ReplayChatService` | StreamReplayChat | Chat replay |
| `RequestReplayService` | Health, RecordRequest, ReplayRequest | Request replay |
| `TraceService` | SubmitSpans, SubmitToolCallEvents, SubmitChatRequestEvents | Distributed tracing |
| `UploadService` | 9 | Documentation upload |
| `UsageSimulationService` | GetSimulation, SetSimulation, ClearSimulation, GetAllSimulations, AddSyntheticUsage | Usage simulation |
| `WebProfilingService` | 4 | Web profiling |

---

## Agent Services (`agent.v1`)

Remote agent execution in cloud workers.

### `agent.v1.AgentService`

| Method | Kind | Description |
|--------|------|-------------|
| `Run` | BD | Bidirectional agent run |
| `RunSSE` | SS | SSE agent run |
| `RunPoll` | SS | Poll agent run |
| `NameAgent` | U | Generate agent name |
| `CreateTranscriptOverview` | U | Create transcript overview |
| `GetUsableModels` | U | Get usable models |
| `GetDefaultModelForCli` | U | Get default CLI model |
| `GetAllowedModelIntents` | U | Get allowed model intents |
| `UploadConversationBlobs` | U | Upload conversation blobs |
| `NotifyConversationClone` | U | Notify of conversation clone |
| `GetNewChatNudgeLegacyModelPicker` | U | Legacy model picker nudge |
| `GetNewChatNudgeParameterizedModelPicker` | U | Parameterized model picker nudge |

### `agent.v1.ControlService`

| Method | Kind | Description |
|--------|------|-------------|
| `Ping` | U | Health ping |
| `Exec` | SS | Execute command |
| `ListDirectory` | U | List directory |
| `ReadTextFile` | U | Read text file |
| `WriteTextFile` | U | Write text file |
| `ReadBinaryFile` | U | Read binary file |
| `WriteBinaryFile` | U | Write binary file |
| `GetDiff` | U | Get workspace diff |
| `GetWorkspaceChangesHash` | U | Get changes hash |
| `RefreshGithubAccessToken` | U | Refresh GitHub token |
| `WarmRemoteAccessServer` | U | Warm remote access server |
| `ListArtifacts` | U | List artifacts |
| `UploadArtifacts` | U | Upload artifacts |
| `GetMcpRefreshTokens` | U | Get MCP refresh tokens |
| `DownloadCursorServer` | U | Download cursor server |
| `UpdateEnvironmentVariables` | U | Update env vars |
| `Connect` | BD | Connect to service |

### `agent.v1.ExecService`

| Method | Kind | Description |
|--------|------|-------------|
| `Exec` | SS | Execute command |
| `Connect` | BD | Bidirectional connection |
| `ResetInstance` | U | Reset instance |
| `RenewInstance` | U | Renew instance |
| `ClaimWorker` | U | Claim a worker |
| `ReleaseWorker` | U | Release worker |

### `agent.v1.LifecycleService`

| Method | Kind | Description |
|--------|------|-------------|
| `ResetInstance` | U | Reset instance |
| `RenewInstance` | U | Renew instance |
| `ClaimWorker` | U | Claim worker |
| `ReleaseWorker` | U | Release worker |

### `agent.v1.PtyHostService`

| Method | Kind | Description |
|--------|------|-------------|
| `SpawnPty` | U | Spawn PTY session |
| `AttachPty` | SS | Attach to PTY stream |
| `SendInput` | U | Send input to PTY |
| `ResizePty` | U | Resize PTY window |
| `ListPtys` | U | List active PTYs |
| `TerminatePty` | U | Terminate PTY session |

### `agent.v1.PrivateWorkerBridgeExternalService`

| Method | Kind | Description |
|--------|------|-------------|
| `Connect` | BD | Connect to private worker bridge |
| `ResetInstance` | U | Reset instance |
| `RenewInstance` | U | Renew instance |
| `ClaimWorker` | U | Claim worker |
| `ReleaseWorker` | U | Release worker |

---

## CursorFS Service (`cursorfs.v1`)

Cursor filesystem service for background agents.

### `cursorfs.v1.CursorFSService`

| Method | Kind | Description |
|--------|------|-------------|
| `Mount` | U | Mount a filesystem |
| `Unmount` | U | Unmount filesystem |
| `GetDiff` | U | Get filesystem diff |
| `ListMounts` | U | List active mounts |
| `Shutdown` | U | Shutdown FS service |

---

## REST API Endpoints

Direct HTTP endpoints (not gRPC-Web) served by the main API backend (`api2.cursor.sh`):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/auth/poll?uuid={uuid}&verifier={verifier}` | Poll for OAuth token after browser login |
| `POST` | `/oauth/token` | Refresh access token using refresh token |
| `GET` | `/auth/full_stripe_profile` | Get full Stripe billing profile |
| `GET` | `/auth/stripe_profile` | Get basic Stripe profile |
| `GET` | `/auth/has_valid_payment_method` | Check if valid payment method exists |
| `POST` | `/auth/logout` | Logout and revoke session |
| `POST` | `/auth/start-subscription-now` | Immediately start subscription (`Bearer` auth) |
| `GET` | `/api/auth/connect-github?auth_id={id}&github_repo={repo}` | Connect GitHub account |
| `GET` | `/api/auth/checkoutDeepControl?tier={tier}&allowTrial={bool}` | Get Stripe checkout URL |

**Website URLs** (`cursor.com`):

| Path | Description |
|------|-------------|
| `/loginDeepControl?challenge={challenge}&uuid={uuid}&mode={login|signup}` | OAuth login page |
| `/settings` | User settings |
| `/pricing` | Pricing page |

**Direct gRPC-Web REST (via fetch):**

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `https://api2.cursor.sh/aiserver.v1.AnalyticsService/UploadIssueTrace` | Issue trace upload |

---

## AI Model Configuration

### Available Models (as reported by `AvailableModels` RPC)

#### GPT / OpenAI
- `gpt-4o` — GPT-4o
- `gpt-4o-mini` — GPT-4o mini
- `gpt-4.1-mini` — GPT-4.1 mini
- `gpt-5-high` — GPT-5 high
- `gpt-5-mini` — GPT-5 mini
- `gpt-5.1-codex` — GPT-5.1 Codex
- `gpt-5.1-codex-high` — GPT-5.1 Codex high
- `gpt-5.2-codex-high` — GPT-5.2 Codex high
- `o3-mini` — o3-mini

#### Claude / Anthropic
- `claude-3.5-sonnet` — Claude 3.5 Sonnet
- `claude-3-opus-20240229` — Claude 3 Opus
- `claude-3-sonnet-20240229` — Claude 3 Sonnet
- `claude-3-haiku-20240307` — Claude 3 Haiku
- `claude-4-5-sonnet-20250929` — Claude 4.5 Sonnet
- `claude-4.5-haiku` — Claude 4.5 Haiku
- `claude-4.5-opus-high` — Claude 4.5 Opus high
- `claude-4.5-opus-high-thinking` — Claude 4.5 Opus with extended thinking

#### Gemini / Google
- `gemini-1.5-flash` — Gemini 1.5 Flash
- `gemini-1.5-flash-8b` — Gemini 1.5 Flash 8B
- `gemini-1.5-preview` — Gemini 1.5 Preview
- `gemini-2.5-flash` — Gemini 2.5 Flash

#### Other Providers
- `deepseek-*` — DeepSeek models (via `deepseek` provider)
- `grok-3` — Grok 3 (via `xai` provider)

### Model Providers
- `openai` — OpenAI
- `anthropic` — Anthropic
- `google` — Google
- `deepseek` — DeepSeek
- `xai` — xAI
- `azure` — Azure OpenAI
- `bedrock` — AWS Bedrock

### `AvailableModel` Fields (from protobuf)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Model identifier |
| `default_on` | bool | Shown by default in picker |
| `is_long_context_only` | bool | Only available in long-context mode |
| `is_chat_only` | bool | Chat use only (not for edit) |
| `supports_agent` | bool | Supports agent mode |
| `degradation_status` | enum | Current degradation level |
| `price` | float | Price per request (for usage-based billing) |
| `tooltip_data` | message | UI tooltip configuration |
| `tooltip_data_for_max_mode` | message | Max mode tooltip |
| `supports_thinking` | bool | Extended thinking support |
| `supports_images` | bool | Vision/image support |
| `supports_auto_context` | bool | Auto context support |
| `auto_context_max_tokens` | int32 | Max tokens for auto context |
| `supports_max_mode` | bool | Max mode support |
| `supports_non_max_mode` | bool | Non-max mode support |

### `AvailableModelsRequest` Fields

| Field | Description |
|-------|-------------|
| `is_nightly` | Include nightly models |
| `include_long_context_models` | Include long context models |
| `exclude_max_named_models` | Exclude named max-mode models |
| `additional_model_names` | Additional model names to include |
| `use_model_parameters` | Use model parameters feature |
| `include_hidden_models` | Include hidden models |

---

## Key Message Types

### Auth

**`GetSessionTokenRequest.Destination`:**
- `0` = DESTINATION_UNSPECIFIED
- `1` = DESTINATION_PORTAL
- `2` = DESTINATION_AISERVER
- `3` = DESTINATION_AUTH_PROXY

**`GetSessionTokenResponse` fields:**
- `session_token` — JWT session token
- `id` — optional session ID
- `should_show_trial` — show trial UI
- `enable_trial_for_deep_control` — enable trial
- `was_auto_enrolled` — auto-enrolled flag

### Membership Types (`ra` enum)

| Value | Description |
|-------|-------------|
| `FREE` | Free tier |
| `PRO` | Pro plan |
| `PRO_PLUS` | Pro+ plan |
| `ULTRA` | Ultra plan |
| `ENTERPRISE` | Enterprise |
| `FREE_TRIAL` | Free trial |

### Azure State Fields (for AWS Bedrock / Azure OpenAI)

| Field | Description |
|-------|-------------|
| `api_key` | API key |
| `secret_key` | Secret key |
| `region` | AWS/Azure region |
| `use_bedrock` | Use AWS Bedrock flag |
| `session_token` | AWS session token |
| `base_url` | Azure base URL |

---

## Notes

1. **gRPC URL pattern**: All gRPC-Web calls use `POST https://{baseUrl}/{package}.{ServiceName}/{MethodName}` with binary protobuf body.

2. **Stream variants**: Methods with `SSE` suffix use `text/event-stream` and methods with `Poll` suffix use repeated short polling. The base bidirectional method uses gRPC-Web framing with WebSocket or HTTP/2.

3. **Authentication**: The JWT `accessToken` is stored in VS Code's global storage at `cursorAuth/accessToken`. It is a standard Auth0 JWT. The `sub` claim contains the user's auth ID. Token expiry is checked client-side via `isTokenExpired()`.

4. **Privacy headers**: `x-ghost-mode` carries a serialized privacy mode value. `x-new-onboarding-completed` is `"true"` only when snippet learning is eligible AND privacy mode is off.

5. **Service routing**: The backend URL used depends on the service type:
   - AI/Chat/Auth → `api2.cursor.sh` (primary) or `api3.cursor.sh` (telemetry)
   - Cursor Tab (CPP) → `api4.cursor.sh` (geo-routed)
   - Codebase indexing → `repo42.cursor.sh`
   - Background agents → `*.api5.cursor.sh` (regional)
