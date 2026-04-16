import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Key,
  Brain,
  Settings,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  ToggleLeft,
  Star,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { mockWeeklyApiCalls, mockRecentActivity } from "../data/mock-data";

const stats = [
  { title: "Total Users", value: "2,847", change: 12.5, icon: Users, color: "text-chart-1" },
  { title: "Active Sessions", value: "1,234", change: 8.2, icon: Activity, color: "text-chart-3" },
  { title: "API Calls Today", value: "324K", change: -3.1, icon: Zap, color: "text-chart-4" },
  { title: "Revenue (MTD)", value: "$74,200", change: 15.8, icon: DollarSign, color: "text-chart-2" },
];

const quickActions = [
  { label: "Add User", icon: UserPlus, href: "/users" },
  { label: "New API Key", icon: Key, href: "/api-keys" },
  { label: "Manage Providers", icon: Brain, href: "/providers" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

const activityIcons: Record<string, any> = {
  user_signup: UserPlus,
  api_alert: AlertTriangle,
  provider_error: AlertTriangle,
  billing: CreditCard,
  feature: ToggleLeft,
  model_update: Brain,
  security: ShieldCheck,
  user_upgrade: Star,
};

const activityColors: Record<string, string> = {
  user_signup: "text-chart-3",
  api_alert: "text-chart-4",
  provider_error: "text-destructive",
  billing: "text-chart-2",
  feature: "text-chart-1",
  model_update: "text-chart-5",
  security: "text-chart-4",
  user_upgrade: "text-chart-3",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your X-CURSOR platform</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          return (
            <Card key={stat.title} className="bg-card border-card-border" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* API Calls Chart */}
        <Card className="lg:col-span-2 bg-card border-card-border" data-testid="card-api-chart">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">API Calls — Last 7 Days</CardTitle>
              <Badge variant="secondary" className="text-xs font-normal">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWeeklyApiCalls} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="apiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(252, 85%, 63%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(252, 85%, 63%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 18%)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(228, 10%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(228, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(228, 14%, 12%)",
                      border: "1px solid hsl(228, 10%, 18%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(220, 14%, 92%)",
                    }}
                    formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, "API Calls"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="apiCalls"
                    stroke="hsl(252, 85%, 63%)"
                    strokeWidth={2}
                    fill="url(#apiGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-card-border" data-testid="card-quick-actions">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="secondary"
                    className="w-full justify-start h-10 text-sm"
                    data-testid={`button-quick-${action.label.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <Icon className="mr-3 h-4 w-4 text-muted-foreground" />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-card-border" data-testid="card-recent-activity">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentActivity.map((item) => {
              const Icon = activityIcons[item.type] || Activity;
              const color = activityColors[item.type] || "text-muted-foreground";
              return (
                <div key={item.id} className="flex items-start gap-3 py-1" data-testid={`activity-item-${item.id}`}>
                  <div className={`mt-0.5 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
