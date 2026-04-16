import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  mockUserUsage,
  mockModelUsage,
  mockFeatureUsage,
  mockProviderQuotas,
  mockRequestLogs,
  mockCostChartData,
  mockProviderUsageBreakdown,
  mockEnhancedProviders,
  tierColors,
  tierLabels,
  connectionStatusColors,
} from "../data/mock-data";
import { Save, Activity, Clock, DollarSign, Zap, AlertTriangle, CheckCircle2, ArrowDownRight, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PIE_COLORS = [
  "hsl(252, 85%, 63%)",
  "hsl(173, 58%, 55%)",
  "hsl(43, 74%, 62%)",
  "hsl(330, 65%, 62%)",
  "hsl(200, 80%, 60%)",
  "hsl(228, 10%, 45%)",
];

const quotaDefaults = [
  { plan: "Free", requestsDay: "500", tokensDay: "100,000" },
  { plan: "Pro", requestsDay: "5,000", tokensDay: "1,000,000" },
  { plan: "Ultra", requestsDay: "20,000", tokensDay: "5,000,000" },
  { plan: "Enterprise", requestsDay: "Unlimited", tokensDay: "Unlimited" },
];

const statusColors = {
  success: "text-green-400",
  fallback: "text-yellow-400",
  error: "text-red-400",
};

const statusBg = {
  success: "bg-green-500/15 text-green-400",
  fallback: "bg-yellow-500/15 text-yellow-400",
  error: "bg-red-500/15 text-red-400",
};

export default function Usage() {
  const { toast } = useToast();
  const [chartMode, setChartMode] = useState<"tokens" | "cost">("cost");

  const totalCost = useMemo(() => mockRequestLogs.reduce((s, l) => s + l.cost, 0), []);
  const totalTokens = useMemo(() => mockRequestLogs.reduce((s, l) => s + l.inputTokens + l.outputTokens, 0), []);
  const avgLatency = useMemo(() => {
    const successful = mockRequestLogs.filter(l => l.status === "success");
    return successful.length > 0 ? Math.round(successful.reduce((s, l) => s + l.latencyMs, 0) / successful.length) : 0;
  }, []);
  const fallbackRate = useMemo(() => {
    const fallbacks = mockRequestLogs.filter(l => l.status === "fallback").length;
    return mockRequestLogs.length > 0 ? ((fallbacks / mockRequestLogs.length) * 100).toFixed(1) : "0";
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Quota & Usage</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor usage, costs, and provider routing</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="text-sm" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="requests" className="text-sm" data-testid="tab-requests">Request Log</TabsTrigger>
          <TabsTrigger value="providers" className="text-sm" data-testid="tab-providers">By Provider</TabsTrigger>
          <TabsTrigger value="quotas" className="text-sm" data-testid="tab-quotas">Quotas</TabsTrigger>
        </TabsList>

        {/* ============ OVERVIEW ============ */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-card border-card-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                  <p className="text-[10px] text-muted-foreground">Total Cost (7d)</p>
                </div>
                <p className="text-lg font-bold">${totalCost.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-card-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Zap className="h-3.5 w-3.5 text-blue-400" />
                  <p className="text-[10px] text-muted-foreground">Total Tokens</p>
                </div>
                <p className="text-lg font-bold">{(totalTokens / 1000).toFixed(1)}K</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-card-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Clock className="h-3.5 w-3.5 text-green-400" />
                  <p className="text-[10px] text-muted-foreground">Avg Latency</p>
                </div>
                <p className="text-lg font-bold">{avgLatency}ms</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-card-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ArrowDownRight className="h-3.5 w-3.5 text-yellow-400" />
                  <p className="text-[10px] text-muted-foreground">Fallback Rate</p>
                </div>
                <p className="text-lg font-bold">{fallbackRate}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Cost/Token chart */}
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {chartMode === "cost" ? "Cost Over Time" : "Token Usage Over Time"}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={chartMode === "cost" ? "default" : "secondary"}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setChartMode("cost")}
                  >
                    Cost
                  </Button>
                  <Button
                    variant={chartMode === "tokens" ? "default" : "secondary"}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setChartMode("tokens")}
                  >
                    Tokens
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockCostChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartMode === "cost" ? "#f59e0b" : "#6366f1"} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={chartMode === "cost" ? "#f59e0b" : "#6366f1"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 18%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(228, 10%, 55%)" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(228, 10%, 55%)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={chartMode === "cost" ? (v) => `$${v}` : (v) => `${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(228, 14%, 12%)", border: "1px solid hsl(228, 10%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(220, 14%, 92%)" }}
                      formatter={(value: number) => chartMode === "cost" ? [`$${value.toFixed(2)}`, "Cost"] : [`${(value / 1000000).toFixed(2)}M`, "Tokens"]}
                    />
                    <Area
                      type="monotone"
                      dataKey={chartMode === "cost" ? "cost" : "tokens"}
                      stroke={chartMode === "cost" ? "#f59e0b" : "#6366f1"}
                      fill="url(#costGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-card-border" data-testid="card-model-usage">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Token Usage by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mockModelUsage} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value">
                        {mockModelUsage.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(228, 14%, 12%)", border: "1px solid hsl(228, 10%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(220, 14%, 92%)" }}
                        formatter={(value: number) => [`${(value / 1000).toFixed(0)}K`, "Requests"]}
                      />
                      <Legend formatter={(value) => <span style={{ color: "hsl(228, 10%, 55%)", fontSize: "11px" }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-card-border" data-testid="card-user-usage">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Users by API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockUserUsage} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 18%)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(228, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(228, 10%, 55%)" }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(228, 14%, 12%)", border: "1px solid hsl(228, 10%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(220, 14%, 92%)" }}
                        formatter={(value: number) => [value.toLocaleString(), "API Calls"]}
                      />
                      <Bar dataKey="apiCalls" fill="hsl(252, 85%, 63%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider quota bars */}
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Provider Quotas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockProviderQuotas.map((quota) => {
                const prov = mockEnhancedProviders.find(p => p.id === quota.providerId);
                const pct = (quota.used / quota.limit) * 100;
                const remaining = ((quota.limit - quota.used) / quota.limit) * 100;
                const color = remaining > 70 ? "bg-green-500" : remaining > 30 ? "bg-yellow-500" : "bg-red-500";
                const resetTime = new Date(quota.resetAt);

                return (
                  <div key={quota.providerId} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-sm flex items-center justify-center text-[7px] font-bold text-white"
                          style={{ backgroundColor: prov?.color || "#666" }}
                        >
                          {(prov?.alias || quota.providerId).slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium">{prov?.name || quota.providerId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{quota.used}/{quota.limit} {quota.period}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          Resets {resetTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ REQUEST LOG ============ */}
        <TabsContent value="requests" className="space-y-4">
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">Time</TableHead>
                      <TableHead className="text-[11px]">Provider</TableHead>
                      <TableHead className="text-[11px]">Model</TableHead>
                      <TableHead className="text-[11px]">Tier</TableHead>
                      <TableHead className="text-[11px]">Status</TableHead>
                      <TableHead className="text-[11px] text-right">Latency</TableHead>
                      <TableHead className="text-[11px] text-right">Tokens</TableHead>
                      <TableHead className="text-[11px] text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRequestLogs.map((log) => {
                      const prov = mockEnhancedProviders.find(p => p.id === log.provider);
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-4 h-4 rounded-sm flex items-center justify-center text-[7px] font-bold text-white"
                                style={{ backgroundColor: prov?.color || "#666" }}
                              >
                                {(prov?.alias || log.provider).slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[11px]">{prov?.name || log.provider}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[11px] font-mono">{log.model}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[9px] px-1 ${tierColors[log.tier].bg} ${tierColors[log.tier].text}`}>
                              {tierLabels[log.tier]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[9px] px-1.5 ${statusBg[log.status]}`}>
                              {log.status}
                            </Badge>
                            {log.fallbackFrom && (
                              <span className="text-[9px] text-yellow-400 ml-1">← {log.fallbackFrom}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-[11px] text-right tabular-nums">
                            {log.latencyMs >= 10000 ? (
                              <span className="text-red-400">{(log.latencyMs / 1000).toFixed(1)}s</span>
                            ) : (
                              `${log.latencyMs}ms`
                            )}
                          </TableCell>
                          <TableCell className="text-[11px] text-right tabular-nums">
                            {log.inputTokens > 0 ? `${log.inputTokens}/${log.outputTokens}` : "—"}
                          </TableCell>
                          <TableCell className="text-[11px] text-right tabular-nums">
                            {log.cost === 0 ? (
                              <span className="text-green-400">$0</span>
                            ) : (
                              `$${log.cost.toFixed(4)}`
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {/* Error detail for failed requests */}
              {mockRequestLogs.filter(l => l.errorMessage).length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <h4 className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Error Details
                  </h4>
                  {mockRequestLogs.filter(l => l.errorMessage).map(log => (
                    <div key={log.id} className="flex items-center gap-2 text-[10px] p-1.5 rounded bg-red-500/5 border border-red-500/10">
                      <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="font-mono">{log.provider}/{log.model}</span>
                      <span className="text-red-400">{log.errorMessage}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ BY PROVIDER ============ */}
        <TabsContent value="providers" className="space-y-4">
          {/* Provider topology */}
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Provider Topology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                <div className="relative">
                  {/* Central router node */}
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-10 relative">
                    <span className="text-xs font-bold text-primary">Router</span>
                  </div>
                  {/* Provider nodes in circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {mockProviderUsageBreakdown.slice(0, 8).map((prov, i) => {
                      const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
                      const rx = 140;
                      const ry = 90;
                      const x = Math.cos(angle) * rx;
                      const y = Math.sin(angle) * ry;

                      return (
                        <div
                          key={prov.provider}
                          className="absolute flex flex-col items-center"
                          style={{ transform: `translate(${x}px, ${y}px)` }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2"
                            style={{ backgroundColor: prov.color, borderColor: prov.requests > 200000 ? "#22c55e" : "#666" }}
                          >
                            {prov.provider.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[8px] text-muted-foreground mt-0.5 whitespace-nowrap">{prov.provider}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider usage breakdown */}
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Provider Usage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">Provider</TableHead>
                    <TableHead className="text-[11px] text-right">Requests</TableHead>
                    <TableHead className="text-[11px] text-right">Tokens</TableHead>
                    <TableHead className="text-[11px] text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProviderUsageBreakdown.map((prov) => (
                    <TableRow key={prov.provider}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: prov.color }}
                          />
                          <span className="text-xs">{prov.provider}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">{(prov.requests / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-xs text-right tabular-nums">{(prov.tokens / 1000000).toFixed(1)}M</TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {prov.cost === 0 ? (
                          <span className="text-green-400">$0</span>
                        ) : (
                          `$${prov.cost.toFixed(2)}`
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ QUOTAS ============ */}
        <TabsContent value="quotas" className="space-y-4">
          <Card className="bg-card border-card-border" data-testid="card-quota-settings">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quota Settings by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quotaDefaults.map((quota) => (
                  <div key={quota.plan} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[11px]">{quota.plan}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Requests/Day</Label>
                        <Input defaultValue={quota.requestsDay} className="h-8 text-sm" data-testid={`input-quota-requests-${quota.plan.toLowerCase()}`} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Tokens/Day</Label>
                        <Input defaultValue={quota.tokensDay} className="h-8 text-sm" data-testid={`input-quota-tokens-${quota.plan.toLowerCase()}`} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Soft Limit %</Label>
                        <Input defaultValue="80" className="h-8 text-sm" data-testid={`input-soft-limit-${quota.plan.toLowerCase()}`} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Hard Limit Action</Label>
                        <Input defaultValue="Block" className="h-8 text-sm" data-testid={`input-hard-limit-${quota.plan.toLowerCase()}`} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button size="sm" className="h-8 text-sm" onClick={() => toast({ title: "Saved", description: "Quota settings updated" })} data-testid="button-save-quotas">
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save Quotas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
