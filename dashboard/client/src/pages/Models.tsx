import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Cpu } from "lucide-react";
import { mockEnhancedModels } from "../data/mock-data";
import type { AIModelEnhanced } from "../types";
import { useToast } from "@/hooks/use-toast";

const typeColors: Record<string, string> = {
  chat: "bg-primary/15 text-primary",
  completion: "bg-chart-3/15 text-chart-3",
  embedding: "bg-chart-4/15 text-chart-4",
};

export default function Models() {
  const [models, setModels] = useState(mockEnhancedModels);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const filteredModels = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const toggleModel = (id: string) => {
    setModels((prev: AIModelEnhanced[]) => prev.map(m =>
      m.id === id ? { ...m, status: m.status === "active" ? "disabled" as const : "active" as const } : m
    ));
  };

  const formatContext = (ctx: number) => {
    if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(0)}M`;
    return `${(ctx / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Model Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure AI models and routing rules</p>
        </div>
        <Button size="sm" className="h-8 text-sm" onClick={() => setShowAddDialog(true)} data-testid="button-add-model">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Model
        </Button>
      </div>

      {/* Model routing rules */}
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Model Routing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { feature: "Chat", model: "claude-4-sonnet" },
              { feature: "Composer", model: "gpt-4o" },
              { feature: "Tab Complete", model: "codestral" },
              { feature: "Agent", model: "claude-4-sonnet" },
              { feature: "Background Agent", model: "o1" },
              { feature: "Embedding", model: "text-embedding-3-large" },
            ].map((route) => (
              <div key={route.feature} className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{route.feature}</p>
                <p className="text-xs font-mono font-medium mt-1 truncate">{route.model}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
                data-testid="input-search-models"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-36 text-sm" data-testid="select-type-filter">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="embedding">Embedding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Model</TableHead>
                <TableHead className="text-xs">Provider</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs text-right">Context</TableHead>
                <TableHead className="text-xs text-right">Input $/1M</TableHead>
                <TableHead className="text-xs text-right">Output $/1M</TableHead>
                <TableHead className="text-xs text-right">Requests</TableHead>
                <TableHead className="text-xs text-center">Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => (
                <TableRow key={model.id} data-testid={`row-model-${model.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium font-mono">{model.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{model.provider}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] font-medium ${typeColors[model.type]}`}>
                      {model.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums font-mono">
                    {formatContext(model.contextWindow)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {model.pricing.input === 0 ? <span className="text-green-400">$0</span> : `$${model.pricing.input.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {model.pricing.output === 0 ? <span className="text-green-400">$0</span> : `$${model.pricing.output.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {(model.totalRequests / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={model.status === "active"}
                      onCheckedChange={() => toggleModel(model.id)}
                      data-testid={`switch-model-${model.id}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Custom Model Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Add Custom Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Model Name</Label>
              <Input placeholder="e.g. my-custom-model" className="h-8 text-sm font-mono" data-testid="input-model-name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Provider</Label>
              <Select>
                <SelectTrigger className="h-8 text-sm" data-testid="select-model-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google AI</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="mistral">Mistral AI</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="ollama">Ollama</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select>
                <SelectTrigger className="h-8 text-sm" data-testid="select-model-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                  <SelectItem value="embedding">Embedding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Context Window</Label>
                <Input type="number" placeholder="128000" className="h-8 text-sm" data-testid="input-context-window" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Input $/1M tokens</Label>
                <Input type="number" step="0.01" placeholder="1.00" className="h-8 text-sm" data-testid="input-pricing" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              setShowAddDialog(false);
              toast({ title: "Model added", description: "Custom model has been registered" });
            }} data-testid="button-confirm-add-model">
              Add Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
