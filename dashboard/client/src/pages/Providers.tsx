import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Settings2,
  Play,
  Key,
  Globe,
  AlertTriangle,
  Loader2,
  Cpu,
  BarChart3,
} from "lucide-react";
import { mockProviders } from "../data/mock-data";
import { useToast } from "@/hooks/use-toast";
import type { AIProvider } from "../types";

// Màu sắc cho từng provider
const providerColors: Record<string, string> = {
  openai: "from-green-500/20 to-green-500/5",
  anthropic: "from-orange-500/20 to-orange-500/5",
  google: "from-blue-500/20 to-blue-500/5",
  deepseek: "from-cyan-500/20 to-cyan-500/5",
  mistral: "from-amber-500/20 to-amber-500/5",
  groq: "from-purple-500/20 to-purple-500/5",
  openrouter: "from-pink-500/20 to-pink-500/5",
  ollama: "from-gray-500/20 to-gray-500/5",
};

export default function Providers() {
  const [providers, setProviders] = useState(mockProviders);
  const [configuring, setConfiguring] = useState<AIProvider | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTest = (id: string) => {
    setTesting(id);
    setTimeout(() => {
      setTesting(null);
      toast({ title: "Connection successful", description: "Provider is responding normally" });
    }, 1500);
  };

  const toggleProvider = (id: string) => {
    setProviders(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === "active" ? "inactive" as const : "active" as const } : p
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">AI Provider Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure and monitor AI provider connections</p>
      </div>

      {/* Provider summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-lg font-bold mt-0.5">{providers.filter(p => p.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Requests</p>
            <p className="text-lg font-bold mt-0.5">{(providers.reduce((s, p) => s + p.totalRequests, 0) / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Avg Error Rate</p>
            <p className="text-lg font-bold mt-0.5">
              {(providers.filter(p => p.status === "active").reduce((s, p) => s + p.errorRate, 0) / providers.filter(p => p.status === "active").length).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Models</p>
            <p className="text-lg font-bold mt-0.5">{providers.reduce((s, p) => s + p.modelsAvailable, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className={`bg-card border-card-border relative overflow-hidden`}
            data-testid={`card-provider-${provider.slug}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${providerColors[provider.slug] || providerColors.ollama} pointer-events-none`} />
            <CardContent className="p-4 relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{provider.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{provider.baseUrl}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] font-medium ${
                    provider.status === "active"
                      ? "bg-green-500/15 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {provider.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Key className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">
                    {provider.apiKeyConfigured ? (
                      <span className="text-green-500">Configured</span>
                    ) : (
                      <span className="text-yellow-500">Not set</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{provider.modelsAvailable} models</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{(provider.totalRequests / 1000).toFixed(0)}K req</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-xs ${provider.errorRate > 0.2 ? "text-yellow-500" : ""}`}>
                    {provider.errorRate}% err
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-[11px] flex-1"
                  onClick={() => setConfiguring(provider)}
                  data-testid={`button-configure-${provider.slug}`}
                >
                  <Settings2 className="mr-1 h-3 w-3" />
                  Configure
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-[11px]"
                  disabled={testing === provider.id || provider.status === "inactive"}
                  onClick={() => handleTest(provider.id)}
                  data-testid={`button-test-${provider.slug}`}
                >
                  {testing === provider.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configure Dialog */}
      <Dialog open={!!configuring} onOpenChange={() => setConfiguring(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Configure {configuring?.name}</DialogTitle>
          </DialogHeader>
          {configuring && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enabled</Label>
                <Switch
                  checked={configuring.status === "active"}
                  onCheckedChange={() => toggleProvider(configuring.id)}
                  data-testid="switch-provider-enabled"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">API Key</Label>
                <Input
                  type="password"
                  placeholder="sk-••••••••••••"
                  className="h-8 text-sm font-mono"
                  defaultValue={configuring.apiKeyConfigured ? "sk-configured" : ""}
                  data-testid="input-provider-api-key"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Base URL</Label>
                <Input
                  defaultValue={configuring.baseUrl}
                  className="h-8 text-sm font-mono"
                  data-testid="input-provider-base-url"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Rate Limit (requests/min)</Label>
                <Input
                  type="number"
                  defaultValue="500"
                  className="h-8 text-sm"
                  data-testid="input-provider-rate-limit"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setConfiguring(null)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              setConfiguring(null);
              toast({ title: "Saved", description: "Provider configuration updated" });
            }} data-testid="button-save-provider">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
