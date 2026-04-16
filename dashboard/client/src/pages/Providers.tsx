import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  ChevronRight,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  BarChart3,
  Shield,
  Key,
  Smartphone,
  ExternalLink,
  Upload,
  Monitor,
} from "lucide-react";
import {
  mockEnhancedProviders,
  tierColors,
  tierLabels,
  serviceKindLabels,
  connectionStatusColors,
} from "../data/mock-data";
import OAuthModal from "@/components/shared/OAuthModal";
import type { AIProviderEnhanced, ProviderTier, ServiceKind } from "../types";

const authMethodIcons: Record<string, typeof Key> = {
  "api-key": Key,
  "oauth-pkce": Shield,
  "oauth-basic": ExternalLink,
  "device-code": Smartphone,
  "token-import": Upload,
  "none": Monitor,
};

export default function Providers() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | ProviderTier>("all");
  const [kindFilter, setKindFilter] = useState<"all" | ServiceKind>("all");
  const [connectProvider, setConnectProvider] = useState<AIProviderEnhanced | null>(null);

  const filteredProviders = useMemo(() => {
    return mockEnhancedProviders.filter((p) => {
      if (tierFilter !== "all" && p.tier !== tierFilter) return false;
      if (kindFilter !== "all" && !p.serviceKinds.includes(kindFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.alias.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, tierFilter, kindFilter]);

  const groupedByTier = useMemo(() => {
    const groups: Record<ProviderTier, AIProviderEnhanced[]> = {
      free: [], "free-tier": [], subscription: [], "api-key": [],
    };
    filteredProviders.forEach((p) => groups[p.tier].push(p));
    return groups;
  }, [filteredProviders]);

  const tierOrder: ProviderTier[] = ["free", "free-tier", "subscription", "api-key"];

  const stats = useMemo(() => {
    const all = mockEnhancedProviders;
    const totalConns = all.reduce((s, p) => s + p.connections.length, 0);
    const activeConns = all.reduce((s, p) => s + p.connections.filter(c => c.status === "connected").length, 0);
    const totalReqs = all.reduce((s, p) => s + p.totalRequests, 0);
    return { total: all.length, totalConns, activeConns, totalReqs };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Provider Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">9router-style multi-tier provider routing</p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => setConnectProvider(mockEnhancedProviders[0])}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Connect Provider
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Providers</p>
            <p className="text-lg font-bold mt-0.5">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Active Connections</p>
            <p className="text-lg font-bold mt-0.5">
              <span className="text-green-400">{stats.activeConns}</span>
              <span className="text-muted-foreground text-sm font-normal">/{stats.totalConns}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Requests</p>
            <p className="text-lg font-bold mt-0.5">{(stats.totalReqs / 1_000_000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Tiers Active</p>
            <div className="flex gap-1 mt-1">
              {tierOrder.map(t => (
                <Badge key={t} variant="secondary" className={`text-[9px] px-1.5 ${tierColors[t].bg} ${tierColors[t].text}`}>
                  {tierLabels[t]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Tabs value={tierFilter} onValueChange={(v) => setTierFilter(v as typeof tierFilter)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-[11px] h-6 px-2.5">All</TabsTrigger>
            <TabsTrigger value="free" className="text-[11px] h-6 px-2.5">Free</TabsTrigger>
            <TabsTrigger value="free-tier" className="text-[11px] h-6 px-2.5">Free Tier</TabsTrigger>
            <TabsTrigger value="subscription" className="text-[11px] h-6 px-2.5">Subscription</TabsTrigger>
            <TabsTrigger value="api-key" className="text-[11px] h-6 px-2.5">API Key</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Service kind filter */}
      <div className="flex flex-wrap gap-1.5">
        {(["all", "llm", "embedding", "tts", "stt", "image", "webSearch"] as const).map((kind) => (
          <Button
            key={kind}
            variant={kindFilter === kind ? "default" : "secondary"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setKindFilter(kind as typeof kindFilter)}
          >
            {kind === "all" ? "All Services" : serviceKindLabels[kind] || kind}
          </Button>
        ))}
      </div>

      {/* Provider cards grouped by tier */}
      {tierOrder.map((tier) => {
        const providers = groupedByTier[tier];
        if (providers.length === 0) return null;

        return (
          <div key={tier} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-[10px] ${tierColors[tier].bg} ${tierColors[tier].text}`}>
                {tierLabels[tier]}
              </Badge>
              <span className="text-xs text-muted-foreground">{providers.length} providers</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {providers.map((provider) => {
                const AuthIcon = authMethodIcons[provider.authMethod] || Key;
                const activeConns = provider.connections.filter(c => c.status === "connected").length;
                const errorConns = provider.connections.filter(c => c.status === "error" || c.status === "expired").length;

                return (
                  <Link key={provider.id} href={`/providers/${provider.id}`}>
                    <Card
                      className="bg-card border-card-border hover:border-primary/30 transition-colors cursor-pointer group relative overflow-hidden"
                      style={{ borderLeftColor: provider.color, borderLeftWidth: "3px" }}
                      data-testid={`card-provider-${provider.slug}`}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-start justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: provider.color }}
                            >
                              {provider.alias.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold leading-tight">{provider.name}</h3>
                              <p className="text-[10px] text-muted-foreground font-mono">{provider.alias}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            {activeConns > 0 ? (
                              <Wifi className="h-3 w-3 text-green-400" />
                            ) : (
                              <WifiOff className="h-3 w-3 text-gray-500" />
                            )}
                            <span className="text-[11px]">
                              <span className="text-green-400">{activeConns}</span>
                              <span className="text-muted-foreground">/{provider.connections.length} conn</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BarChart3 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px]">{(provider.totalRequests / 1000).toFixed(0)}K req</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <AuthIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">{provider.authMethod}</span>
                          </div>
                          {errorConns > 0 && (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="h-3 w-3 text-red-400" />
                              <span className="text-[11px] text-red-400">{errorConns} error</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {provider.serviceKinds.map((kind) => (
                            <Badge key={kind} variant="secondary" className="text-[9px] px-1 py-0 h-4">
                              {serviceKindLabels[kind] || kind}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredProviders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No providers match your filters
        </div>
      )}

      <OAuthModal
        provider={connectProvider}
        open={!!connectProvider}
        onOpenChange={(open) => !open && setConnectProvider(null)}
      />
    </div>
  );
}
