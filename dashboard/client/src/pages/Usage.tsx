import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
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
import { mockUserUsage, mockModelUsage, mockFeatureUsage } from "../data/mock-data";
import { Save } from "lucide-react";
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

export default function Usage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Quota & Usage</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor usage patterns and configure quotas</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics" className="text-sm" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="quotas" className="text-sm" data-testid="tab-quotas">Quotas</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Usage by user */}
            <Card className="bg-card border-card-border" data-testid="card-user-usage">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Users by API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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

            {/* Usage by model */}
            <Card className="bg-card border-card-border" data-testid="card-model-usage">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Usage by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockModelUsage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mockModelUsage.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(228, 14%, 12%)", border: "1px solid hsl(228, 10%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(220, 14%, 92%)" }}
                        formatter={(value: number) => [`${(value / 1000).toFixed(0)}K`, "Requests"]}
                      />
                      <Legend
                        formatter={(value) => <span style={{ color: "hsl(228, 10%, 55%)", fontSize: "11px" }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature usage */}
          <Card className="bg-card border-card-border" data-testid="card-feature-usage">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usage by Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFeatureUsage.map((feature) => (
                  <div key={feature.name} className="flex items-center gap-3">
                    <span className="text-sm w-36 shrink-0">{feature.name}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${feature.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-right tabular-nums">
                      {(feature.requests / 1000).toFixed(0)}K ({feature.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
