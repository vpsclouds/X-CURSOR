import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Circle, AlertTriangle, XCircle, Info, Pause, Play } from "lucide-react";
import { mockLogs } from "../data/mock-data";
import type { LogEntry } from "../types";

const levelIcons = {
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
};

const levelColors = {
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
};

const levelBgColors = {
  info: "bg-blue-400/10",
  warn: "bg-yellow-400/10",
  error: "bg-red-400/10",
};

export default function Logs() {
  const [logs, setLogs] = useState(mockLogs);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Giả lập log mới xuất hiện
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const levels: LogEntry["level"][] = ["info", "warn", "error"];
      const sources = ["api-gateway", "auth-service", "provider-proxy", "model-router", "billing-service"];
      const messages = [
        "Request processed successfully",
        "Cache hit for model response",
        "New WebSocket connection established",
        "Token count updated for user session",
        "Health check passed for all providers",
      ];
      const newLog: LogEntry = {
        id: String(Date.now()),
        timestamp: new Date().toISOString(),
        level: levels[Math.floor(Math.random() * 3)],
        message: messages[Math.floor(Math.random() * messages.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
      };
      setLogs(prev => [newLog, ...prev].slice(0, 100));
    }, 3000);
    return () => clearInterval(interval);
  }, [paused]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.source.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  };

  const errorCount = logs.filter(l => l.level === "error").length;
  const warnCount = logs.filter(l => l.level === "warn").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Logs & Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time system logs and error tracking</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border-card-border">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <Info className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Info</p>
              <p className="text-sm font-bold">{logs.filter(l => l.level === "info").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Warnings</p>
              <p className="text-sm font-bold">{warnCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-400/10 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Errors</p>
              <p className="text-sm font-bold">{errorCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log viewer */}
      <Card className="bg-card border-card-border" data-testid="card-log-viewer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 w-56 text-sm"
                  data-testid="input-search-logs"
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-8 w-28 text-sm" data-testid="select-level-filter">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPaused(!paused)}
                data-testid="button-toggle-live"
              >
                {paused ? (
                  <>
                    <Play className="mr-1 h-3 w-3" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-1 h-3 w-3" />
                    Pause
                  </>
                )}
              </Button>
              {!paused && (
                <div className="flex items-center gap-1.5 text-xs text-green-500">
                  <Circle className="h-2 w-2 fill-current animate-pulse" />
                  Live
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-card-border">
            <ScrollArea className="h-[500px]" ref={scrollRef}>
              <div className="font-mono text-xs">
                {filteredLogs.map((log) => {
                  const Icon = levelIcons[log.level];
                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-3 px-4 py-2 border-b border-card-border/50 hover:bg-muted/30 ${levelBgColors[log.level]}`}
                      data-testid={`log-entry-${log.id}`}
                    >
                      <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${levelColors[log.level]}`} />
                      <span className="text-muted-foreground w-16 shrink-0">{formatTimestamp(log.timestamp)}</span>
                      <Badge variant="secondary" className="text-[9px] font-mono shrink-0 px-1.5 py-0">
                        {log.source}
                      </Badge>
                      <span className="text-foreground">{log.message}</span>
                      {log.details && (
                        <span className="text-muted-foreground ml-auto shrink-0">{log.details}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
