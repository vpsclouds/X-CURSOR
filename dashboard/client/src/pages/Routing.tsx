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
  ArrowRight,
  Play,
  Plus,
  Route,
  Trash2,
  Zap,
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { mockRoutingRules, mockEnhancedProviders, tierColors, tierLabels } from "../data/mock-data";
import { useToast } from "@/hooks/use-toast";
import type { RoutingRule } from "../types";

export default function Routing() {
  const [rules, setRules] = useState<RoutingRule[]>(mockRoutingRules);
  const [showCreate, setShowCreate] = useState(false);
  const [simModel, setSimModel] = useState("");
  const [simResult, setSimResult] = useState<{
    provider: string;
    path: { provider: string; status: "skip" | "try" | "success" | "error" }[];
  } | null>(null);
  const { toast } = useToast();

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast({ title: "Deleted", description: "Routing rule removed" });
  };

  const activeRule = rules.find(r => r.isActive);

  // Simulate routing
  const simulateRouting = () => {
    if (!simModel.trim() || !activeRule) return;

    const path: { provider: string; status: "skip" | "try" | "success" | "error" }[] = [];
    let found = false;

    for (const providerId of activeRule.fallbackOrder) {
      const prov = mockEnhancedProviders.find(p => p.id === providerId);
      if (!prov) continue;

      const hasModel = prov.modelsAvailable > 0;
      const hasActiveConn = prov.connections.some(c => c.status === "connected");

      if (!hasModel || !hasActiveConn) {
        path.push({ provider: providerId, status: "skip" });
        continue;
      }

      // Simulate: first provider with connections succeeds (with some randomness)
      if (!found && Math.random() > 0.3) {
        path.push({ provider: providerId, status: "success" });
        found = true;
      } else if (!found) {
        path.push({ provider: providerId, status: "error" });
      } else {
        path.push({ provider: providerId, status: "skip" });
      }
    }

    // If none succeeded, last tried one succeeds
    if (!found && path.length > 0) {
      const lastTried = path.findIndex(p => p.status === "error");
      if (lastTried >= 0) {
        // Try the next one as success
        for (let i = lastTried + 1; i < path.length; i++) {
          if (path[i].status === "skip") {
            path[i].status = "success";
            found = true;
            break;
          }
        }
      }
    }

    const successProvider = path.find(p => p.status === "success")?.provider || "none";
    setSimResult({ provider: successProvider, path });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Routing Rules</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tier-based fallback routing configuration</p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          New Rule
        </Button>
      </div>

      {/* Active rule flow diagram */}
      {activeRule && (
        <Card className="bg-card border-card-border border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Active Routing: {activeRule.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Tier flow */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-[11px] text-muted-foreground">Tier Order:</span>
              {activeRule.tiers.map((tier, i) => (
                <span key={tier} className="flex items-center gap-1">
                  {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  <Badge variant="secondary" className={`text-[10px] ${tierColors[tier].bg} ${tierColors[tier].text}`}>
                    {tierLabels[tier]}
                  </Badge>
                </span>
              ))}
            </div>

            {/* Provider fallback chain */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground">Fallback Chain:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeRule.fallbackOrder.map((providerId, i) => {
                  const prov = mockEnhancedProviders.find(p => p.id === providerId);
                  if (!prov) return null;
                  return (
                    <span key={providerId} className="flex items-center gap-1">
                      {i > 0 && <ChevronDown className="h-3 w-3 text-muted-foreground rotate-[-90deg]" />}
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5"
                        style={{ borderColor: prov.color, borderWidth: "1px" }}
                      >
                        <div
                          className="w-3 h-3 rounded-sm mr-1 flex items-center justify-center text-[6px] font-bold text-white"
                          style={{ backgroundColor: prov.color }}
                        >
                          {prov.alias.slice(0, 2).toUpperCase()}
                        </div>
                        {prov.name}
                      </Badge>
                    </span>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routing simulation */}
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Play className="h-4 w-4" />
            Routing Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Type a model name (e.g., claude-sonnet-4)"
                value={simModel}
                onChange={(e) => setSimModel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && simulateRouting()}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={simulateRouting} disabled={!simModel.trim()}>
              <Zap className="mr-1 h-3.5 w-3.5" />
              Simulate
            </Button>
          </div>

          {simResult && (
            <div className="space-y-2 p-3 rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Route for:</span>
                <code className="text-xs font-mono text-primary">{simModel}</code>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {simResult.path.map((step, i) => {
                  const prov = mockEnhancedProviders.find(p => p.id === step.provider);
                  if (!prov) return null;

                  return (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 ${
                          step.status === "success"
                            ? "bg-green-500/15 text-green-400 border-green-500/30"
                            : step.status === "error"
                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : "opacity-40"
                        }`}
                      >
                        {step.status === "success" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                        {step.status === "error" && <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                        {prov.alias}
                      </Badge>
                    </span>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {simResult.provider !== "none"
                  ? `Routed to ${mockEnhancedProviders.find(p => p.id === simResult.provider)?.name || simResult.provider}`
                  : "No provider could handle this request"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules list */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">All Rules</h2>
        {rules.map((rule) => (
          <Card
            key={rule.id}
            className={`bg-card border-card-border ${rule.isActive ? "border-primary/30" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Route className="h-4 w-4 text-muted-foreground" />
                    {rule.name}
                    {rule.isActive && (
                      <Badge variant="secondary" className="text-[9px] bg-green-500/15 text-green-400">ACTIVE</Badge>
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Tier order */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] text-muted-foreground w-12">Tiers:</span>
                {rule.tiers.map((tier, i) => (
                  <span key={tier} className="flex items-center gap-1">
                    {i > 0 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                    <Badge variant="secondary" className={`text-[9px] px-1 ${tierColors[tier].bg} ${tierColors[tier].text}`}>
                      {tierLabels[tier]}
                    </Badge>
                  </span>
                ))}
              </div>

              {/* Provider order */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-muted-foreground w-12">Order:</span>
                {rule.fallbackOrder.map((providerId, i) => {
                  const prov = mockEnhancedProviders.find(p => p.id === providerId);
                  if (!prov) return null;
                  return (
                    <span key={providerId} className="flex items-center gap-0.5">
                      {i > 0 && <span className="text-[10px] text-muted-foreground">→</span>}
                      <span
                        className="text-[10px] px-1 py-0.5 rounded bg-muted"
                        style={{ borderLeft: `2px solid ${prov.color}` }}
                      >
                        {prov.alias}
                      </span>
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">New Routing Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Rule Name</Label>
              <Input placeholder="e.g., Cost-Optimized" className="h-8 text-sm" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              After creating, drag to reorder tiers and providers in the rule card.
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              setShowCreate(false);
              toast({ title: "Created", description: "New routing rule added" });
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
