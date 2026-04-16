import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Play,
  Loader2,
  Wifi,
  Clock,
  Shield,
  Globe,
  Settings2,
  Trash2,
  Timer,
} from "lucide-react";
import {
  mockEnhancedProviders,
  mockEnhancedModels,
  tierColors,
  tierLabels,
  connectionStatusColors,
} from "../data/mock-data";
import OAuthModal from "@/components/shared/OAuthModal";
import KiroAuthModal from "@/components/shared/KiroAuthModal";
import CursorAuthModal from "@/components/shared/CursorAuthModal";
import PricingModal from "@/components/shared/PricingModal";
import { useToast } from "@/hooks/use-toast";
import type { ProviderConnection } from "../types";

export default function ProviderDetail() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [testing, setTesting] = useState<string | null>(null);
  const [showOAuth, setShowOAuth] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const provider = useMemo(() => {
    return mockEnhancedProviders.find((p) => p.id === params.id) || null;
  }, [params.id]);

  if (!provider) {
    return (
      <div className="space-y-4">
        <Link href="/providers">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Providers
          </Button>
        </Link>
        <div className="text-center py-12 text-muted-foreground">Provider not found</div>
      </div>
    );
  }

  const handleTest = (connId: string) => {
    setTesting(connId);
    setTimeout(() => {
      setTesting(null);
      toast({ title: "Test passed", description: "Connection is responding normally" });
    }, 1500);
  };

  const providerModels = mockEnhancedModels.filter(
    (m) =>
      m.provider === provider.name ||
      m.provider === provider.alias ||
      m.provider.toLowerCase() === provider.id ||
      m.providerOverrides[provider.id] !== undefined
  );

  const activeConns = provider.connections.filter(c => c.status === "connected").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/providers">
            <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-1 -ml-2 mb-1">
              <ArrowLeft className="h-3 w-3" />
              Providers
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: provider.color }}
            >
              {provider.alias.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                {provider.name}
                <Badge variant="secondary" className={`text-[10px] ${tierColors[provider.tier].bg} ${tierColors[provider.tier].text}`}>
                  {tierLabels[provider.tier]}
                </Badge>
                {provider.deprecated && (
                  <Badge variant="secondary" className="text-[10px] bg-red-500/15 text-red-400">DEPRECATED</Badge>
                )}
              </h1>
              <p className="text-xs text-muted-foreground font-mono">{provider.baseUrl}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={() => setShowPricing(true)}>
            Pricing
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => setShowOAuth(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Connection
          </Button>
        </div>
      </div>

      {/* Provider info row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Auth Method</p>
            <p className="text-sm font-medium mt-0.5">{provider.authMethod}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Connections</p>
            <p className="text-sm font-medium mt-0.5">
              <span className="text-green-400">{activeConns}</span>/{provider.connections.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Strategy</p>
            <p className="text-sm font-medium mt-0.5">{provider.strategy}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Total Requests</p>
            <p className="text-sm font-medium mt-0.5">{(provider.totalRequests / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Cooldown</p>
            <p className="text-sm font-medium mt-0.5">{provider.cooldownMs / 1000}s</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy selector */}
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Routing Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Account Strategy</Label>
              <Select defaultValue={provider.strategy}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fill-first">Fill First</SelectItem>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sticky Limit</Label>
              <Input type="number" defaultValue={provider.stickyLimit} className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max Retries</Label>
              <Input type="number" defaultValue={provider.maxRetries} className="h-8 text-sm" />
            </div>
          </div>
          {provider.quotaSupported && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] text-blue-300">This provider supports quota tracking via API</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connections */}
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Connections ({provider.connections.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {provider.connections.map((connection) => (
              <ConnectionRow
                key={connection.id}
                connection={connection}
                testing={testing === connection.id}
                onTest={() => handleTest(connection.id)}
              />
            ))}
            {provider.connections.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">No connections yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Models */}
      {providerModels.length > 0 && (
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Models</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">Model</TableHead>
                  <TableHead className="text-[11px] text-right">Input $/1M</TableHead>
                  <TableHead className="text-[11px] text-right">Output $/1M</TableHead>
                  <TableHead className="text-[11px] text-right">Context</TableHead>
                  <TableHead className="text-[11px] text-right">Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providerModels.map((model) => {
                  const override = model.providerOverrides[provider.id];
                  const pricing = override || model.pricing;
                  return (
                    <TableRow key={model.id}>
                      <TableCell className="text-xs font-mono">
                        {model.name}
                        {override && (
                          <Badge variant="secondary" className="ml-1.5 text-[9px] px-1 bg-amber-500/15 text-amber-400">
                            {override.input === 0 ? "FREE" : "OVERRIDE"}
                          </Badge>
                        )}
                        {model.isFreeTier && (
                          <Badge variant="secondary" className="ml-1.5 text-[9px] px-1 bg-green-500/15 text-green-400">FREE</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {pricing.input === 0 ? <span className="text-green-400">$0</span> : `$${pricing.input.toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {pricing.output === 0 ? <span className="text-green-400">$0</span> : `$${pricing.output.toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">{(model.contextWindow / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-xs text-right tabular-nums">{(model.totalRequests / 1000).toFixed(0)}K</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Kiro uses its own multi-method modal */}
      {provider.id === 'kiro' && (
        <KiroAuthModal
          provider={provider}
          open={showOAuth}
          onOpenChange={setShowOAuth}
          onSuccess={(name) => {
            toast({ title: "Connected", description: `${name} added to ${provider.name}` });
          }}
        />
      )}

      {/* Cursor uses its own token import modal */}
      {provider.id === 'cursor' && (
        <CursorAuthModal
          provider={provider}
          open={showOAuth}
          onOpenChange={setShowOAuth}
          onSuccess={(name) => {
            toast({ title: "Connected", description: `${name} added to ${provider.name}` });
          }}
        />
      )}

      {/* All other providers use the generic OAuthModal */}
      {provider.id !== 'kiro' && provider.id !== 'cursor' && (
        <OAuthModal
          provider={provider}
          open={showOAuth}
          onOpenChange={setShowOAuth}
          onSuccess={(name) => {
            toast({ title: "Connected", description: `${name} added to ${provider.name}` });
          }}
        />
      )}

      <PricingModal
        open={showPricing}
        onOpenChange={setShowPricing}
        selectedModel={providerModels[0]?.name}
      />
    </div>
  );
}

// ---- Connection Row Component ----

function ConnectionRow({
  connection,
  testing,
  onTest,
}: {
  connection: ProviderConnection;
  testing: boolean;
  onTest: () => void;
}) {
  const [cooldownLeft, setCooldownLeft] = useState("");

  // Countdown for model locks
  useEffect(() => {
    const locks = Object.entries(connection.modelLocks).filter(
      ([, ts]) => new Date(ts).getTime() > Date.now()
    );
    if (locks.length === 0) {
      setCooldownLeft("");
      return;
    }

    const tick = () => {
      const nearest = Math.min(...locks.map(([, ts]) => new Date(ts).getTime()));
      const diff = nearest - Date.now();
      if (diff <= 0) {
        setCooldownLeft("");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCooldownLeft(`${m}:${s.toString().padStart(2, "0")}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [connection.modelLocks]);

  const statusDot = connectionStatusColors[connection.status];
  const lockedModels = Object.entries(connection.modelLocks).filter(
    ([, ts]) => new Date(ts).getTime() > Date.now()
  );

  return (
    <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border border-transparent hover:border-border transition-colors">
      {/* Status dot */}
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDot}`} title={connection.status} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{connection.connectionName}</span>
          <Badge variant="secondary" className="text-[9px] px-1">{connection.status}</Badge>
          {connection.proxyEnabled && (
            <Badge variant="secondary" className="text-[9px] px-1 bg-cyan-500/15 text-cyan-400">
              <Globe className="h-2 w-2 mr-0.5" />
              Proxy
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
          <span>Priority: {connection.priority}</span>
          <span>{(connection.totalRequests / 1000).toFixed(0)}K requests</span>
          {connection.errorCount > 0 && (
            <span className="text-red-400">{connection.errorCount} errors</span>
          )}
          {connection.expiresAt && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              Expires: {new Date(connection.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* Model locks */}
        {lockedModels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {lockedModels.map(([model]) => (
              <Badge key={model} variant="secondary" className="text-[9px] px-1 bg-yellow-500/15 text-yellow-400">
                <Timer className="h-2 w-2 mr-0.5" />
                {model} {cooldownLeft && `(${cooldownLeft})`}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={testing}
          onClick={onTest}
        >
          {testing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
