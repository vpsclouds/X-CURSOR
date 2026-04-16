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
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import type { AIProviderEnhanced } from "@/types";

interface CursorAuthModalProps {
  provider: AIProviderEnhanced;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (connectionName: string) => void;
}

export default function CursorAuthModal({ provider, open, onOpenChange, onSuccess }: CursorAuthModalProps) {
  const [accessToken, setAccessToken] = useState("");
  const [machineId, setMachineId] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [windowsManual, setWindowsManual] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setAccessToken("");
    setMachineId("");
    setError("");
    setImporting(false);
    setAutoDetecting(false);
    setAutoDetected(false);
    setWindowsManual(false);
    setSuccess(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const runAutoDetect = () => {
    setAutoDetecting(true);
    setError("");
    setAutoDetected(false);
    setWindowsManual(false);

    // Simulate auto-detect from state.vscdb
    setTimeout(() => {
      setAutoDetecting(false);
      // Simulate not finding tokens (realistic default - server-side only)
      setError("Could not auto-detect tokens. Cursor IDE database not accessible from browser.");
    }, 1500);
  };

  // Auto-detect tokens when modal opens
  useEffect(() => {
    if (!open) return;
    runAutoDetect();
  }, [open]);

  const handleImportToken = () => {
    if (!accessToken.trim()) {
      setError("Please enter an access token");
      return;
    }
    if (!machineId.trim()) {
      setError("Please enter a machine ID");
      return;
    }

    // Basic validation
    if (accessToken.trim().length < 50) {
      setError("Invalid token format. Token appears too short.");
      return;
    }

    setImporting(true);
    setError("");

    // Simulate import
    setTimeout(() => {
      setImporting(false);
      setSuccess(true);
      onSuccess?.("Cursor IDE");
    }, 1500);
  };

  // Token storage paths (from CURSOR_CONFIG)
  const storagePaths = {
    linux: "~/.config/Cursor/User/globalStorage/state.vscdb",
    macos: "~/Library/Application Support/Cursor/User/globalStorage/state.vscdb",
    windows: "%APPDATA%\\Cursor\\User\\globalStorage\\state.vscdb",
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
              CU
            </div>
            Connect Cursor IDE
          </DialogTitle>
        </DialogHeader>

        {/* Success state */}
        {success && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-sm font-medium">Connected successfully!</p>
            <p className="text-xs text-muted-foreground">Cursor IDE connection is now active</p>
            <Button size="sm" onClick={() => handleClose(false)}>Done</Button>
          </div>
        )}

        {/* Auto-detecting state */}
        {!success && autoDetecting && (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Auto-detecting tokens...</h3>
            <p className="text-[11px] text-muted-foreground">Reading from Cursor IDE database</p>
          </div>
        )}

        {/* Main form (shown after auto-detect completes) */}
        {!success && !autoDetecting && (
          <div className="space-y-3">
            {/* Success message if auto-detected */}
            {autoDetected && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                <span className="text-xs text-green-300">
                  Tokens auto-detected from Cursor IDE successfully!
                </span>
              </div>
            )}

            {/* Windows manual instructions */}
            {windowsManual && (
              <div className="space-y-2 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs text-amber-300 font-medium">
                    Could not read Cursor database automatically.
                  </span>
                </div>
                <p className="text-[10px] text-amber-300/70">
                  Make sure Cursor IDE has been opened at least once, then click Retry.
                </p>
                <Button variant="secondary" size="sm" className="w-full h-7 text-xs" onClick={runAutoDetect}>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              </div>
            )}

            {/* Info message if not auto-detected */}
            {!autoDetected && !windowsManual && !error && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-300">
                  Cursor IDE not detected. Please paste your tokens manually.
                </span>
              </div>
            )}

            {/* How to find tokens */}
            <details className="group">
              <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                How to get your Cursor tokens →
              </summary>
              <div className="mt-2 p-2.5 rounded-md bg-muted/50 text-[10px] space-y-1 text-muted-foreground">
                <p>1. Open Cursor IDE and make sure you&apos;re logged in</p>
                <p>2. Find <code className="text-[9px] bg-muted px-1 py-0.5 rounded">state.vscdb</code>:</p>
                <p className="pl-3">Linux: <code className="text-[9px] bg-muted px-1 py-0.5 rounded">{storagePaths.linux}</code></p>
                <p className="pl-3">macOS: <code className="text-[9px] bg-muted px-1 py-0.5 rounded">{storagePaths.macos}</code></p>
                <p className="pl-3">Windows: <code className="text-[9px] bg-muted px-1 py-0.5 rounded">{storagePaths.windows}</code></p>
                <p>3. Run:</p>
                <code className="block text-[9px] bg-muted p-1.5 rounded break-all">
                  sqlite3 state.vscdb &quot;SELECT key, value FROM itemTable WHERE key IN (&apos;cursorAuth/accessToken&apos;, &apos;storage.serviceMachineId&apos;)&quot;
                </code>
              </div>
            </details>

            {/* Access Token Input */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Access Token <span className="text-red-500">*</span>
              </Label>
              <textarea
                value={accessToken}
                onChange={(e) => { setAccessToken(e.target.value); setError(""); }}
                placeholder="Paste access token from cursorAuth/accessToken..."
                className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Machine ID Input */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Machine ID <span className="text-red-500">*</span>
              </Label>
              <Input
                value={machineId}
                onChange={(e) => { setMachineId(e.target.value); setError(""); }}
                placeholder="Paste from storage.serviceMachineId..."
                className="h-8 text-sm font-mono"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="text-xs text-red-300">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm" className="flex-1"
                onClick={handleImportToken}
                disabled={importing || !accessToken.trim() || !machineId.trim()}
              >
                {importing ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Importing...</>
                ) : (
                  "Import Token"
                )}
              </Button>
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
