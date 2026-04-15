import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Copy, RefreshCw, Trash2, Eye, EyeOff, Key } from "lucide-react";
import { mockApiKeys } from "../data/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function ApiKeys() {
  const [keys, setKeys] = useState(mockApiKeys);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyLimit, setNewKeyLimit] = useState("5000");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maskKey = (key: string) => {
    return key.slice(0, 8) + "••••••••••••" + key.slice(-4);
  };

  const copyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    toast({ title: "Copied", description: "API key copied to clipboard" });
  };

  const handleCreate = () => {
    if (!newKeyName) return;
    const newKey = {
      id: String(keys.length + 1),
      name: newKeyName,
      key: `xc-new-${Math.random().toString(36).slice(2, 22)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "active" as const,
      rateLimit: parseInt(newKeyLimit),
      totalRequests: 0,
    };
    setKeys([newKey, ...keys]);
    setShowCreateDialog(false);
    setNewKeyName("");
    setNewKeyLimit("5000");
    toast({ title: "Created", description: `API key "${newKeyName}" created` });
  };

  const formatDate = (dateStr: string) => {
    if (dateStr === "Never") return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">API Key Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage API access keys</p>
        </div>
        <Button size="sm" className="h-8 text-sm" onClick={() => setShowCreateDialog(true)} data-testid="button-create-key">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create Key
        </Button>
      </div>

      <Card className="bg-card border-card-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Key</TableHead>
                <TableHead className="text-xs">Created</TableHead>
                <TableHead className="text-xs">Last Used</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Rate Limit</TableHead>
                <TableHead className="text-xs text-right">Requests</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((apiKey) => (
                <TableRow key={apiKey.id} data-testid={`row-key-${apiKey.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{apiKey.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs font-mono text-muted-foreground">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyKey(apiKey.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(apiKey.createdAt)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(apiKey.lastUsed)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-medium ${
                        apiKey.status === "active"
                          ? "bg-green-500/15 text-green-500"
                          : "bg-red-500/15 text-red-500"
                      }`}
                    >
                      {apiKey.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {apiKey.rateLimit.toLocaleString()}/hr
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {apiKey.totalRequests.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-key-actions-${apiKey.id}`}>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-3.5 w-3.5" />
                          Rotate key
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Revoke key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Key Name</Label>
              <Input
                placeholder="e.g. Production API"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="h-8 text-sm"
                data-testid="input-key-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rate Limit (requests/hour)</Label>
              <Input
                type="number"
                value={newKeyLimit}
                onChange={(e) => setNewKeyLimit(e.target.value)}
                className="h-8 text-sm"
                data-testid="input-rate-limit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} data-testid="button-confirm-create-key">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
