import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, Users, CreditCard, Save } from "lucide-react";
import { mockRevenueData, mockTransactions } from "../data/mock-data";
import { useToast } from "@/hooks/use-toast";

const subscriptionBreakdown = [
  { plan: "Free", count: 1842, color: "bg-muted" },
  { plan: "Pro", count: 645, color: "bg-primary" },
  { plan: "Ultra", count: 278, color: "bg-chart-2" },
  { plan: "Enterprise", count: 82, color: "bg-chart-3" },
];

const planPricing = [
  { plan: "Free", monthly: "0", annual: "0" },
  { plan: "Pro", monthly: "20", annual: "192" },
  { plan: "Ultra", monthly: "40", annual: "384" },
  { plan: "Enterprise", monthly: "400", annual: "3,840" },
];

const statusColors: Record<string, string> = {
  completed: "bg-green-500/15 text-green-500",
  pending: "bg-yellow-500/15 text-yellow-500",
  failed: "bg-red-500/15 text-red-500",
};

export default function Billing() {
  const { toast } = useToast();
  const totalRevenue = 74200;
  const totalSubscribers = subscriptionBreakdown.reduce((s, b) => s + b.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Billing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Revenue overview and subscription management</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">MRR</p>
              <DollarSign className="h-4 w-4 text-chart-1" />
            </div>
            <p className="text-2xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-500 mt-0.5">+15.8% vs last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Total Subscribers</p>
              <Users className="h-4 w-4 text-chart-3" />
            </div>
            <p className="text-2xl font-bold mt-2">{totalSubscribers.toLocaleString()}</p>
            <p className="text-xs text-green-500 mt-0.5">+8.2% vs last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">ARPU</p>
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </div>
            <p className="text-2xl font-bold mt-2">${(totalRevenue / totalSubscribers * 12).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Annual per user</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Churn Rate</p>
              <CreditCard className="h-4 w-4 text-chart-2" />
            </div>
            <p className="text-2xl font-bold mt-2">2.1%</p>
            <p className="text-xs text-green-500 mt-0.5">-0.3% vs last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="lg:col-span-2 bg-card border-card-border" data-testid="card-revenue-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue — Last 7 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(173, 58%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(173, 58%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 18%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(228, 10%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(228, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(228, 14%, 12%)", border: "1px solid hsl(228, 10%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(220, 14%, 92%)" }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(173, 58%, 55%)" strokeWidth={2} fill="url(#revGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription breakdown */}
        <Card className="bg-card border-card-border" data-testid="card-subscription-breakdown">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Subscription Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscriptionBreakdown.map((sub) => (
              <div key={sub.plan} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${sub.color}`} />
                  <span className="text-sm">{sub.plan}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-1.5">
                    <div
                      className={`h-full ${sub.color} rounded-full`}
                      style={{ width: `${(sub.count / totalSubscribers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground w-12 text-right">{sub.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-card border-card-border" data-testid="card-transactions">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">User</TableHead>
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                  <TableCell className="text-sm">{tx.userName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.plan}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums font-medium">${tx.amount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] font-medium capitalize ${statusColors[tx.status]}`}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Plan Pricing Configuration */}
      <Card className="bg-card border-card-border" data-testid="card-plan-pricing">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Plan Pricing Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {planPricing.map((pp) => (
              <div key={pp.plan} className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <Label className="text-xs">{pp.plan} Plan</Label>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Monthly ($)</Label>
                  <Input defaultValue={pp.monthly} className="h-8 text-sm" data-testid={`input-pricing-monthly-${pp.plan.toLowerCase()}`} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Annual ($)</Label>
                  <Input defaultValue={pp.annual} className="h-8 text-sm" data-testid={`input-pricing-annual-${pp.plan.toLowerCase()}`} />
                </div>
              </div>
            ))}
            <Button size="sm" className="h-8 text-sm" onClick={() => toast({ title: "Saved", description: "Pricing updated" })} data-testid="button-save-pricing">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
