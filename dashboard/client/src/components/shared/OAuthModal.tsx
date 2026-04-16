import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Key,
  ExternalLink,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Monitor,
  Smartphone,
  Upload,
  Shield,
  Lock,
  LockOpen,
} from "lucide-react";
import type { AIProviderEnhanced } from "@/types";

type ModalState = "idle" | "waiting" | "success" | "error";

interface OAuthModalProps {
  provider: AIProviderEnhanced | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (connectionName: string) => void;
}

export default function OAuthModal({ provider, open, onOpenChange, onSuccess }: OAuthModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [connectionName, setConnectionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Simulated device code data
  const [deviceCode] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${part()}-${part()}`;
  });

  const reset = () => {
    setState("idle");
    setConnectionName("");
    setApiKey("");
    setError("");
    setCopied(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    if (!connectionName.trim()) {
      setError("Connection name is required");
      return;
    }

    if (provider?.authMethod === "api-key") {
      if (!apiKey.trim()) { setError("API key is required"); return; }
      setState("waiting");
      setTimeout(() => {
        setState("success");
        onSuccess?.(connectionName);
      }, 1500);
    } else if (provider?.authMethod === "noAuth") {
      setState("waiting");
      setTimeout(() => {
        setState("success");
        onSuccess?.(connectionName);
      }, 500);
    } else if (provider?.authMethod === "device-code" || provider?.authMethod === "device-code-pkce") {
      setState("waiting");
      setTimeout(() => {
        setState("success");
        onSuccess?.(connectionName);
      }, 4000);
    } else {
      // OAuth flows (pkce, authcode)
      setState("waiting");
      setTimeout(() => {
        setState("success");
        onSuccess?.(connectionName);
      }, 3000);
    }
  };

  if (!provider) return null;

  // Get the API key URL for this provider
  const getApiKeyUrl = (): string | undefined => {
    return provider.oauthConfig?.apiKeyUrl || provider.notice?.apiKeyUrl || provider.website;
  };

  // Get provider-specific verification URL for device code
  const getDeviceCodeVerificationUrl = (): string => {
    if (provider.id === "github") return "https://github.com/login/device";
    if (provider.id === "qwen") return "https://chat.qwen.ai/device";
    if (provider.id === "kilocode") return "https://app.kilo.ai/device";
    return provider.oauthConfig?.authUrl || "#";
  };

  const renderAuthFlow = () => {
    // ============ API Key providers ============
    if (provider.authMethod === "api-key") {
      const apiKeyUrl = getApiKeyUrl();
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-orange-500/10 border border-orange-500/20">
            <Key className="h-4 w-4 text-orange-400 shrink-0" />
            <span className="text-xs text-orange-300">Enter your API key for {provider.name}</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder={`${provider.name} Production`}
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">API Key</Label>
            <Input
              type="password"
              placeholder="sk-••••••••••••"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setError(""); }}
              className="h-8 text-sm font-mono"
            />
          </div>
          {apiKeyUrl && (
            <a
              href={apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              Get your API key at {new URL(apiKeyUrl).hostname}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
          {provider.notice && (
            <p className="text-[10px] text-muted-foreground">{provider.notice.text}</p>
          )}
        </div>
      );
    }

    // ============ No Auth providers ============
    if (provider.authMethod === "noAuth") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-gray-500/10 border border-gray-500/20">
            <LockOpen className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-300">No authentication required</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder="Public Connection"
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {provider.name} does not require authentication. Simply add the connection.
          </p>
        </div>
      );
    }

    // ============ GitHub Device Code ============
    if (provider.id === "github") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-gray-500/10 border border-gray-500/20">
            <Smartphone className="h-4 w-4 text-gray-300 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-gray-300">Device Code Flow</span>
              <p className="text-[10px] text-muted-foreground">
                Client ID: {provider.oauthConfig?.clientId}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder="GitHub Copilot Account"
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          {state === "waiting" ? (
            <div className="flex flex-col items-center gap-3 py-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">Enter this code at</p>
              <a
                href="https://github.com/login/device"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                github.com/login/device
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-2">
                <code className="text-2xl font-mono font-bold tracking-[0.3em] text-foreground">{deviceCode}</code>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleCopy(deviceCode)}>
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Polling for authorization...</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                GitHub token → Copilot token via api.github.com/copilot_internal/v2/token
              </p>
            </div>
          ) : (
            <Button
              size="sm" variant="secondary" className="w-full"
              onClick={() => window.open("https://github.com/login/device", "_blank")}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Open GitHub Device Authorization
            </Button>
          )}
        </div>
      );
    }

    // ============ Claude OAuth PKCE ============
    if (provider.id === "claude") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-purple-500/10 border border-purple-500/20">
            <Shield className="h-4 w-4 text-purple-400 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-purple-300">OAuth Authorization Code + PKCE (S256)</span>
              <p className="text-[10px] text-muted-foreground">
                Client ID: {provider.oauthConfig?.clientId}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder="Claude Max Account"
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] text-muted-foreground">Scopes:</span>
            {(provider.oauthConfig?.scopes || []).map((scope) => (
              <span key={scope} className="text-[9px] bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded">
                {scope}
              </span>
            ))}
          </div>
          {state === "waiting" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              <p className="text-xs text-muted-foreground">Waiting for authorization at claude.ai...</p>
              <p className="text-[10px] text-muted-foreground">Token exchange via api.anthropic.com/v1/oauth/token (JSON format)</p>
            </div>
          )}
        </div>
      );
    }

    // ============ Codex OAuth PKCE ============
    if (provider.id === "codex") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20">
            <Shield className="h-4 w-4 text-blue-400 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-blue-300">OAuth Authorization Code + PKCE (S256)</span>
              <p className="text-[10px] text-muted-foreground">
                Client ID: {provider.oauthConfig?.clientId}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder="Codex Pro Account"
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <p>Extra params: codex_cli_simplified_flow, originator=codex_cli_rs</p>
          </div>
          {state === "waiting" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <p className="text-xs text-muted-foreground">Waiting for authorization at auth.openai.com...</p>
              <p className="text-[10px] text-muted-foreground">Token exchange via auth.openai.com/oauth/token</p>
            </div>
          )}
        </div>
      );
    }

    // ============ Qwen Device Code + PKCE ============
    if (provider.id === "qwen") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-green-500/10 border border-green-500/20">
            <Smartphone className="h-4 w-4 text-green-400 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-green-300">Device Code + PKCE (S256)</span>
              <p className="text-[10px] text-muted-foreground">
                Client ID: {provider.oauthConfig?.clientId}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder="Qwen Account"
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          {state === "waiting" && (
            <div className="flex flex-col items-center gap-3 py-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">Enter this code at</p>
              <a
                href="https://chat.qwen.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                chat.qwen.ai
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-2">
                <code className="text-2xl font-mono font-bold tracking-[0.3em] text-foreground">{deviceCode}</code>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleCopy(deviceCode)}>
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Polling for authorization...</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ============ iFlow OAuth Auth Code ============
    if (provider.id === "iflow") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
            <ExternalLink className="h-4 w-4 text-indigo-400 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-indigo-300">Standard OAuth Authorization Code</span>
              <p className="text-[10px] text-muted-foreground">
                Client ID: {provider.oauthConfig?.clientId}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder="iFlow Account"
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          {state === "waiting" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              <p className="text-xs text-muted-foreground">Waiting for authorization at iflow.cn/oauth...</p>
              <p className="text-[10px] text-muted-foreground">Login method: phone</p>
            </div>
          )}
        </div>
      );
    }

    // ============ KiloCode Device Code ============
    if (provider.id === "kilocode") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-orange-500/10 border border-orange-500/20">
            <Smartphone className="h-4 w-4 text-orange-400 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-orange-300">Custom Device Auth Flow</span>
              <p className="text-[10px] text-muted-foreground">
                Endpoint: api.kilo.ai/api/device-auth/codes
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder="KiloCode Account"
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          {state === "waiting" && (
            <div className="flex flex-col items-center gap-3 py-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <code className="text-2xl font-mono font-bold tracking-[0.3em] text-foreground">{deviceCode}</code>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleCopy(deviceCode)}>
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Polling for authorization...</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ============ Cline OAuth Auth Code ============
    if (provider.id === "cline") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20">
            <Lock className="h-4 w-4 text-blue-400 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-blue-300">OAuth Authorization Code (local callback)</span>
              <p className="text-[10px] text-muted-foreground">
                Endpoint: api.cline.bot/api/v1/auth/authorize
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder="Cline Account"
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          {state === "waiting" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <p className="text-xs text-muted-foreground">Waiting for authorization at api.cline.bot...</p>
              <p className="text-[10px] text-muted-foreground">Token exchange via /api/v1/auth/token</p>
            </div>
          )}
        </div>
      );
    }

    // ============ Generic Device Code ============
    if (provider.authMethod === "device-code" || provider.authMethod === "device-code-pkce") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-green-500/10 border border-green-500/20">
            <Smartphone className="h-4 w-4 text-green-400 shrink-0" />
            <span className="text-xs text-green-300">
              Device Code Flow{provider.authMethod === "device-code-pkce" ? " + PKCE" : ""}
            </span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder={`${provider.name} Account`}
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          {state === "waiting" && (
            <div className="flex flex-col items-center gap-3 py-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">Enter this code at</p>
              <a
                href={getDeviceCodeVerificationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {getDeviceCodeVerificationUrl().replace("https://", "")}
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-2">
                <code className="text-2xl font-mono font-bold tracking-[0.3em] text-foreground">{deviceCode}</code>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleCopy(deviceCode)}>
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Waiting for authorization...</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ============ Generic OAuth (PKCE or AuthCode) ============
    if (provider.authMethod === "oauth-pkce" || provider.authMethod === "oauth-authcode") {
      const isPkce = provider.authMethod === "oauth-pkce";
      return (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 p-2.5 rounded-md ${isPkce ? "bg-purple-500/10 border border-purple-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
            {isPkce ? (
              <Shield className={`h-4 w-4 shrink-0 ${isPkce ? "text-purple-400" : "text-blue-400"}`} />
            ) : (
              <Lock className="h-4 w-4 text-blue-400 shrink-0" />
            )}
            <div className="flex-1">
              <span className={`text-xs ${isPkce ? "text-purple-300" : "text-blue-300"}`}>
                OAuth Authorization Code{isPkce ? " + PKCE" : ""}
              </span>
              {provider.oauthConfig?.clientId && (
                <p className="text-[10px] text-muted-foreground">
                  Client ID: {provider.oauthConfig.clientId.slice(0, 20)}...
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder={`${provider.name} Account`}
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          {provider.oauthConfig?.scopes && provider.oauthConfig.scopes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-muted-foreground">Scopes:</span>
              {provider.oauthConfig.scopes.map((scope) => (
                <span key={scope} className="text-[9px] bg-muted px-1.5 py-0.5 rounded">
                  {scope}
                </span>
              ))}
            </div>
          )}
          {state === "waiting" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className={`h-6 w-6 animate-spin ${isPkce ? "text-purple-400" : "text-blue-400"}`} />
              <p className="text-xs text-muted-foreground">Waiting for authorization...</p>
              <p className="text-[10px] text-muted-foreground">A browser window should open automatically</p>
            </div>
          )}
        </div>
      );
    }

    // ============ Token Import (fallback) ============
    if (provider.authMethod === "token-import") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
            <Upload className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-cyan-300">Import Token from {provider.name}</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Connection Name</Label>
            <Input
              placeholder={`${provider.name} Account`}
              value={connectionName}
              onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Access Token</Label>
            <textarea
              placeholder="Paste your access token here..."
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setError(""); }}
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      );
    }

    // ============ Multi-method (should use KiroAuthModal, but fallback) ============
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-gray-500/10 border border-gray-500/20">
          <Monitor className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-300">Connect to {provider.name}</span>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Connection Name</Label>
          <Input
            placeholder={`${provider.name} Account`}
            value={connectionName}
            onChange={(e) => { setConnectionName(e.target.value); setError(""); }}
            className="h-8 text-sm"
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: provider.color }}
            >
              {(provider.textIcon || provider.alias).slice(0, 2).toUpperCase()}
            </div>
            Connect {provider.name}
          </DialogTitle>
        </DialogHeader>

        {state === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-sm font-medium">Connected successfully!</p>
            <p className="text-xs text-muted-foreground">&quot;{connectionName}&quot; is now active</p>
          </div>
        ) : (
          <>
            {renderAuthFlow()}
            {error && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="text-xs text-red-300">{error}</span>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          {state === "success" ? (
            <Button size="sm" onClick={() => handleClose(false)}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => handleClose(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={state === "waiting"}
              >
                {state === "waiting" ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Connecting...</>
                ) : provider.authMethod === "api-key" ? (
                  "Save & Test"
                ) : provider.authMethod === "noAuth" ? (
                  "Add Connection"
                ) : provider.authMethod === "device-code" || provider.authMethod === "device-code-pkce" ? (
                  "Start Device Flow"
                ) : provider.authMethod === "token-import" ? (
                  "Import Token"
                ) : (
                  "Authorize"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
