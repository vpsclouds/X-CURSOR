import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SiGithub, SiGoogle } from "react-icons/si";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />

      <Card className="w-full max-w-sm relative z-10 bg-card border-card-border" data-testid="card-login">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="flex justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="X-CURSOR Logo"
            >
              <rect width="32" height="32" rx="8" fill="hsl(252, 85%, 63%)" />
              <path d="M8 10L14 16L8 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M24 10L18 16L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              <circle cx="16" cy="16" r="2" fill="white" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight" data-testid="text-login-title">X-CURSOR</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="h-9 text-sm" onClick={onLogin} data-testid="button-github-login">
              <SiGithub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="secondary" className="h-9 text-sm" onClick={onLogin} data-testid="button-google-login">
              <SiGoogle className="mr-2 h-3.5 w-3.5" />
              Google
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@x-cursor.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-sm pr-9"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-9 text-sm" disabled={loading} data-testid="button-login">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Forgot password?{" "}
            <button className="text-primary hover:underline" data-testid="link-reset-password">Reset here</button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
