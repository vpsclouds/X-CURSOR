import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Save, Globe, Shield, Zap, Server, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const saveSettings = () => {
    toast({ title: "Saved", description: "Settings have been updated" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="text-sm" data-testid="tab-general">
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="auth" className="text-sm" data-testid="tab-auth">
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Auth
          </TabsTrigger>
          <TabsTrigger value="api" className="text-sm" data-testid="tab-api">
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            API
          </TabsTrigger>
          <TabsTrigger value="grpc" className="text-sm" data-testid="tab-grpc">
            <Server className="mr-1.5 h-3.5 w-3.5" />
            gRPC
          </TabsTrigger>
          <TabsTrigger value="email" className="text-sm" data-testid="tab-email">
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Email
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Platform Name</Label>
                  <Input defaultValue="X-CURSOR" className="h-8 text-sm" data-testid="input-platform-name" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Domain</Label>
                  <Input defaultValue="x-cursor.dev" className="h-8 text-sm font-mono" data-testid="input-domain" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Support Email</Label>
                  <Input defaultValue="support@x-cursor.dev" className="h-8 text-sm" data-testid="input-support-email" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Logo URL</Label>
                  <Input defaultValue="/logo.svg" className="h-8 text-sm font-mono" data-testid="input-logo-url" />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Temporarily disable the platform for all users</p>
                </div>
                <Switch data-testid="switch-maintenance" />
              </div>
              <Button size="sm" className="h-8 text-sm" onClick={saveSettings} data-testid="button-save-general">
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auth Settings */}
        <TabsContent value="auth">
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Authentication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: "Email/Password", enabled: true },
                  { name: "GitHub OAuth", enabled: true },
                  { name: "Google OAuth", enabled: true },
                  { name: "SAML SSO", enabled: false },
                ].map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between">
                    <span className="text-sm">{provider.name}</span>
                    <Switch defaultChecked={provider.enabled} data-testid={`switch-auth-${provider.name.toLowerCase().replace(/\s/g, '-')}`} />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Session Timeout (hours)</Label>
                  <Input type="number" defaultValue="24" className="h-8 text-sm" data-testid="input-session-timeout" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max Login Attempts</Label>
                  <Input type="number" defaultValue="5" className="h-8 text-sm" data-testid="input-max-attempts" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Require 2FA</p>
                  <p className="text-xs text-muted-foreground">Enforce two-factor authentication for all admin users</p>
                </div>
                <Switch defaultChecked data-testid="switch-2fa" />
              </div>
              <Button size="sm" className="h-8 text-sm" onClick={saveSettings} data-testid="button-save-auth">
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api">
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Global Rate Limit (req/min)</Label>
                  <Input type="number" defaultValue="1000" className="h-8 text-sm" data-testid="input-global-rate-limit" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max Request Body (MB)</Label>
                  <Input type="number" defaultValue="10" className="h-8 text-sm" data-testid="input-max-body" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">CORS Allowed Origins</Label>
                  <Input defaultValue="*.x-cursor.dev" className="h-8 text-sm font-mono" data-testid="input-cors" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Webhook URL</Label>
                  <Input defaultValue="https://hooks.x-cursor.dev/events" className="h-8 text-sm font-mono" data-testid="input-webhook" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Request Logging</p>
                  <p className="text-xs text-muted-foreground">Log all API requests for debugging</p>
                </div>
                <Switch defaultChecked data-testid="switch-request-logging" />
              </div>
              <Button size="sm" className="h-8 text-sm" onClick={saveSettings} data-testid="button-save-api">
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* gRPC Settings */}
        <TabsContent value="grpc">
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">gRPC Endpoint Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { service: "Auth Service", endpoint: "grpc://auth.x-cursor.internal:50051" },
                { service: "Model Router", endpoint: "grpc://router.x-cursor.internal:50052" },
                { service: "Usage Tracker", endpoint: "grpc://usage.x-cursor.internal:50053" },
                { service: "Feature Service", endpoint: "grpc://features.x-cursor.internal:50054" },
                { service: "Billing Service", endpoint: "grpc://billing.x-cursor.internal:50055" },
              ].map((svc) => (
                <div key={svc.service} className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <Label className="text-xs">{svc.service}</Label>
                  </div>
                  <div className="col-span-2">
                    <Input defaultValue={svc.endpoint} className="h-8 text-sm font-mono" data-testid={`input-grpc-${svc.service.toLowerCase().replace(/\s/g, '-')}`} />
                  </div>
                </div>
              ))}
              <Button size="sm" className="h-8 text-sm" onClick={saveSettings} data-testid="button-save-grpc">
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">SMTP Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">SMTP Host</Label>
                  <Input defaultValue="smtp.sendgrid.net" className="h-8 text-sm font-mono" data-testid="input-smtp-host" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">SMTP Port</Label>
                  <Input type="number" defaultValue="587" className="h-8 text-sm" data-testid="input-smtp-port" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Username</Label>
                  <Input defaultValue="apikey" className="h-8 text-sm" data-testid="input-smtp-username" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Password</Label>
                  <Input type="password" defaultValue="configured" className="h-8 text-sm" data-testid="input-smtp-password" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">From Address</Label>
                  <Input defaultValue="noreply@x-cursor.dev" className="h-8 text-sm" data-testid="input-from-address" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">From Name</Label>
                  <Input defaultValue="X-CURSOR" className="h-8 text-sm" data-testid="input-from-name" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">TLS/SSL</p>
                  <p className="text-xs text-muted-foreground">Use encrypted connection</p>
                </div>
                <Switch defaultChecked data-testid="switch-smtp-tls" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="h-8 text-sm" data-testid="button-test-email">
                  Test Connection
                </Button>
                <Button size="sm" className="h-8 text-sm" onClick={saveSettings} data-testid="button-save-email">
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
