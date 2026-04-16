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
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import type { AIProviderEnhanced } from "@/types";

type ModalState = "idle" | "waiting" | "input" | "success" | "error";

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
  const [token, setToken] = useState("");
  const [usePkce, setUsePkce] = useState(true);
  const [deviceCode] = useState("ABCD-EFGH");
  const [error, setError] = useState("");

  const reset = () => {
    setState("idle");
    setConnectionName("");
    setApiKey("");
    setToken("");
    setError("");
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
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
    } else if (provider?.authMethod === "token-import") {
      if (!token.trim()) { setError("Token is required"); return; }
      setState("waiting");
      setTimeout(() => {
        setState("success");
        onSuccess?.(connectionName);
      }, 1200);
    } else if (provider?.authMethod === "device-code") {
      setState("waiting");
      setTimeout(() => {
        setState("success");
        onSuccess?.(connectionName);
      }, 3000);
    } else {
      // OAuth flows
      setState("waiting");
      setTimeout(() => {
        setState("success");
        onSuccess?.(connectionName);
      }, 2000);
    }
  };

  if (!provider) return null;

  const renderAuthFlow = () => {
    switch (provider.authMethod) {
      case "api-key":
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
          </div>
        );

      case "oauth-pkce":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-purple-500/10 border border-purple-500/20">
              <Shield className="h-4 w-4 text-purple-400 shrink-0" />
              <span className="text-xs text-purple-300">OAuth Authorization Code + PKCE</span>
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
            <div className="flex items-center justify-between">
              <Label className="text-xs">Use PKCE (S256)</Label>
              <Switch checked={usePkce} onCheckedChange={setUsePkce} />
            </div>
            {state === "waiting" && (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                <p className="text-xs text-muted-foreground">Waiting for authorization...</p>
                <p className="text-[10px] text-muted-foreground">A browser window should open automatically</p>
              </div>
            )}
          </div>
        );

      case "oauth-basic":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20">
              <ExternalLink className="h-4 w-4 text-blue-400 shrink-0" />
              <span className="text-xs text-blue-300">OAuth Authorization Code</span>
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
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                <p className="text-xs text-muted-foreground">Waiting for authorization...</p>
              </div>
            )}
          </div>
        );

      case "device-code":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-green-500/10 border border-green-500/20">
              <Smartphone className="h-4 w-4 text-green-400 shrink-0" />
              <span className="text-xs text-green-300">Device Code Flow</span>
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
              <div className="space-y-3">
                <div className="flex flex-col items-center gap-3 py-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Enter this code at</p>
                  <a
                    href={provider.oauthConfig?.authUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {provider.oauthConfig?.authUrl || provider.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-mono font-bold tracking-[0.3em] text-foreground">{deviceCode}</code>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigator.clipboard.writeText(deviceCode)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Waiting for authorization...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "token-import":
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
                value={token}
                onChange={(e) => { setToken(e.target.value); setError(""); }}
                className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {provider.id === "cursor"
                ? "Token is auto-imported from Cursor IDE's SQLite database. Paste manually if auto-import fails."
                : "Paste the token from your IDE's authentication settings."}
            </p>
          </div>
        );

      case "none":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-gray-500/10 border border-gray-500/20">
              <Monitor className="h-4 w-4 text-gray-400 shrink-0" />
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
          </div>
        );

      default:
        return null;
    }
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
              {provider.alias.slice(0, 2).toUpperCase()}
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
            <p className="text-xs text-muted-foreground">"{connectionName}" is now active</p>
          </div>
        ) : state === "error" || error ? (
          <>
            {renderAuthFlow()}
            {error && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="text-xs text-red-300">{error}</span>
              </div>
            )}
          </>
        ) : (
          renderAuthFlow()
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
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : provider.authMethod === "api-key" ? (
                  "Save & Test"
                ) : provider.authMethod === "device-code" ? (
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
