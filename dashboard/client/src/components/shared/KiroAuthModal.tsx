import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Building2,
  Upload,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import type { AIProviderEnhanced, KiroAuthMethod } from "@/types";

type KiroStep = "method-select" | "idc-config" | "device-code" | "import" | "success" | "error";

interface KiroAuthModalProps {
  provider: AIProviderEnhanced;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (connectionName: string) => void;
}

export default function KiroAuthModal({ provider, open, onOpenChange, onSuccess }: KiroAuthModalProps) {
  const [step, setStep] = useState<KiroStep>("method-select");
  const [selectedMethod, setSelectedMethod] = useState<KiroAuthMethod | null>(null);
  const [idcStartUrl, setIdcStartUrl] = useState("");
  const [idcRegion, setIdcRegion] = useState("us-east-1");
  const [refreshToken, setRefreshToken] = useState("");
  const [error, setError] = useState("");
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [importing, setImporting] = useState(false);

  // Simulated device code data
  const [deviceCode, setDeviceCode] = useState("");
  const [verificationUri, setVerificationUri] = useState("");
  const [polling, setPolling] = useState(false);

  const reset = () => {
    setStep("method-select");
    setSelectedMethod(null);
    setIdcStartUrl("");
    setIdcRegion("us-east-1");
    setRefreshToken("");
    setError("");
    setAutoDetecting(false);
    setAutoDetected(false);
    setImporting(false);
    setDeviceCode("");
    setVerificationUri("");
    setPolling(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  // Auto-detect token when import is selected
  useEffect(() => {
    if (step !== "import" || !open) return;

    setAutoDetecting(true);
    setError("");
    setAutoDetected(false);

    // Simulate auto-detect from AWS SSO cache
    const timer = setTimeout(() => {
      setAutoDetecting(false);
      // Simulate not finding token (realistic default)
      setError("Could not auto-detect token from AWS SSO cache");
    }, 1500);

    return () => clearTimeout(timer);
  }, [step, open]);

  const handleMethodSelect = (method: KiroAuthMethod) => {
    setSelectedMethod(method);
    setError("");

    if (method === "builder-id") {
      // Start device code flow immediately
      setStep("device-code");
      startDeviceCodeFlow("https://view.awsapps.com/start");
    } else if (method === "idc") {
      setStep("idc-config");
    } else if (method === "import") {
      setStep("import");
    }
  };

  const startDeviceCodeFlow = (startUrl: string) => {
    // startUrl determines the OIDC registration endpoint
    // Builder ID uses awsapps.com, IDC uses custom org URL
    const verifyUrl = startUrl.includes("awsapps.com")
      ? "https://device.sso.us-east-1.amazonaws.com/"
      : `https://device.sso.${idcRegion}.amazonaws.com/`;
    setPolling(true);
    const code = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    setDeviceCode(code);
    setVerificationUri(verifyUrl);

    // Simulate successful auth after delay
    setTimeout(() => {
      setPolling(false);
      setStep("success");
      onSuccess?.(`Kiro ${selectedMethod === "idc" ? "IDC" : "Builder ID"}`);
    }, 4000);
  };

  const handleIdcContinue = () => {
    if (!idcStartUrl.trim()) {
      setError("Please enter your IDC start URL");
      return;
    }
    setStep("device-code");
    startDeviceCodeFlow(idcStartUrl.trim());
  };

  const handleImportToken = () => {
    if (!refreshToken.trim()) {
      setError("Please enter a refresh token");
      return;
    }

    // Validate token format (must start with aorAAAAAG)
    if (!refreshToken.trim().startsWith("aorAAAAAG")) {
      setError('Invalid token format. Token should start with "aorAAAAAG..."');
      return;
    }

    setImporting(true);
    setError("");

    // Simulate import
    setTimeout(() => {
      setImporting(false);
      setStep("success");
      onSuccess?.("Kiro Import Token");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: provider.color }}
            >
              KR
            </div>
            Connect Kiro AI
          </DialogTitle>
        </DialogHeader>

        {/* Success state */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-sm font-medium">Connected successfully!</p>
            <p className="text-xs text-muted-foreground">Kiro AI connection is now active</p>
            <Button size="sm" onClick={() => handleClose(false)}>Done</Button>
          </div>
        )}

        {/* Method Selection (matching KiroAuthModal.js exactly) */}
        {step === "method-select" && (
          <div className="space-y-2.5">
            <p className="text-xs text-muted-foreground mb-3">
              Choose your authentication method:
            </p>

            {/* AWS Builder ID */}
            <button
              onClick={() => handleMethodSelect("builder-id")}
              className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">AWS Builder ID</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Recommended for most users. Free AWS account required.
                  </p>
                </div>
              </div>
            </button>

            {/* AWS IAM Identity Center */}
            <button
              onClick={() => handleMethodSelect("idc")}
              className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">AWS IAM Identity Center</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    For enterprise users with custom AWS IAM Identity Center.
                  </p>
                </div>
              </div>
            </button>

            {/* Import Token */}
            <button
              onClick={() => handleMethodSelect("import")}
              className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <Upload className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Import Token</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Paste refresh token from Kiro IDE.
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* IDC Configuration */}
        {step === "idc-config" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">
                IDC Start URL <span className="text-red-500">*</span>
              </Label>
              <Input
                value={idcStartUrl}
                onChange={(e) => { setIdcStartUrl(e.target.value); setError(""); }}
                placeholder="https://your-org.awsapps.com/start"
                className="h-8 text-sm font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Your organization&apos;s AWS IAM Identity Center URL
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">AWS Region</Label>
              <Input
                value={idcRegion}
                onChange={(e) => setIdcRegion(e.target.value)}
                placeholder="us-east-1"
                className="h-8 text-sm font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                AWS region for your Identity Center (default: us-east-1)
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="text-xs text-red-300">{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={handleIdcContinue} className="flex-1">
                Continue
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setStep("method-select"); setError(""); }} className="flex-1">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Device Code Flow */}
        {step === "device-code" && (
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-3 py-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">Enter this code at</p>
              <a
                href={verificationUri || "https://device.sso.us-east-1.amazonaws.com/"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {verificationUri || "device.sso.us-east-1.amazonaws.com"}
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-2">
                <code className="text-2xl font-mono font-bold tracking-[0.3em] text-foreground">
                  {deviceCode || "WAIT-LOAD"}
                </code>
                <Button
                  variant="ghost" size="sm" className="h-7 w-7 p-0"
                  onClick={() => navigator.clipboard.writeText(deviceCode)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              {polling && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">
                    Waiting for authorization...
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary" size="sm"
                onClick={() => { setStep("method-select"); setPolling(false); setError(""); }}
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Import Token */}
        {step === "import" && (
          <div className="space-y-3">
            {/* Auto-detecting state */}
            {autoDetecting && (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <h3 className="text-sm font-semibold">Auto-detecting token...</h3>
                <p className="text-[11px] text-muted-foreground">Reading from AWS SSO cache</p>
              </div>
            )}

            {/* Form shown after auto-detect completes */}
            {!autoDetecting && (
              <>
                {autoDetected && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span className="text-xs text-green-300">
                      Token auto-detected from Kiro IDE successfully!
                    </span>
                  </div>
                )}

                {!autoDetected && !error && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                    <AlertCircle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="text-xs text-blue-300">
                      Kiro IDE not detected. Please paste your refresh token manually.
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Refresh Token <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    value={refreshToken}
                    onChange={(e) => { setRefreshToken(e.target.value); setError(""); }}
                    placeholder="aorAAAAAG..."
                    className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Token must start with &quot;aorAAAAAG&quot;
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <span className="text-xs text-red-300">{error}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm" className="flex-1"
                    onClick={handleImportToken}
                    disabled={importing || !refreshToken.trim()}
                  >
                    {importing ? (
                      <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Importing...</>
                    ) : (
                      "Import Token"
                    )}
                  </Button>
                  <Button
                    variant="secondary" size="sm" className="flex-1"
                    onClick={() => { setStep("method-select"); setError(""); }}
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
