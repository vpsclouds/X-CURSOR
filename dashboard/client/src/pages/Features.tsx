import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";
import { mockFeatures } from "../data/mock-data";
import { useToast } from "@/hooks/use-toast";

const plans = ["Free", "Pro", "Ultra", "Enterprise"] as const;

export default function Features() {
  const [features, setFeatures] = useState(mockFeatures);
  const { toast } = useToast();

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
    const feature = features.find(f => f.id === id);
    toast({
      title: feature?.enabled ? "Feature disabled" : "Feature enabled",
      description: `${feature?.name} has been ${feature?.enabled ? "disabled" : "enabled"}`,
    });
  };

  const togglePlanAccess = (featureId: string, plan: typeof plans[number]) => {
    setFeatures(prev => prev.map(f =>
      f.id === featureId ? { ...f, plans: { ...f.plans, [plan]: !f.plans[plan] } } : f
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Feature Flags</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Toggle features and manage per-plan access</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Features</p>
            <p className="text-lg font-bold mt-0.5">{features.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Enabled</p>
            <p className="text-lg font-bold mt-0.5 text-green-500">{features.filter(f => f.enabled).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Disabled</p>
            <p className="text-lg font-bold mt-0.5 text-muted-foreground">{features.filter(f => !f.enabled).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Enterprise Only</p>
            <p className="text-lg font-bold mt-0.5">{features.filter(f => f.plans.Enterprise && !f.plans.Pro).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags Table */}
      <Card className="bg-card border-card-border" data-testid="card-feature-flags">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Feature Gates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Feature</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs text-center">Enabled</TableHead>
                {plans.map(plan => (
                  <TableHead key={plan} className="text-xs text-center">{plan}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature.id} data-testid={`row-feature-${feature.id}`}>
                  <TableCell>
                    <code className="text-xs font-mono font-medium bg-muted px-1.5 py-0.5 rounded">
                      {feature.name}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {feature.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => toggleFeature(feature.id)}
                      data-testid={`switch-feature-${feature.name}`}
                    />
                  </TableCell>
                  {plans.map(plan => (
                    <TableCell key={plan} className="text-center">
                      <button
                        onClick={() => togglePlanAccess(feature.id, plan)}
                        className="inline-flex"
                        data-testid={`button-plan-${feature.name}-${plan.toLowerCase()}`}
                      >
                        {feature.plans[plan] ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </button>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feature Matrix Summary */}
      <Card className="bg-card border-card-border" data-testid="card-feature-matrix">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Per-Plan Feature Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {plans.map(plan => {
              const enabledCount = features.filter(f => f.plans[plan] && f.enabled).length;
              return (
                <div key={plan} className="text-center">
                  <Badge variant="secondary" className="mb-2 text-xs">{plan}</Badge>
                  <p className="text-2xl font-bold">{enabledCount}</p>
                  <p className="text-xs text-muted-foreground">of {features.length} features</p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(enabledCount / features.length) * 100}%` }}
                    />
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
