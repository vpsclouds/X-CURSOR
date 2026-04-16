import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Layers,
  ArrowRight,
  Shuffle,
  ListOrdered,
  Scale,
  Trash2,
  Pencil,
} from "lucide-react";
import { mockModelCombos, mockEnhancedProviders } from "../data/mock-data";
import { useToast } from "@/hooks/use-toast";
import type { ModelCombo } from "../types";

const strategyIcons = {
  "round-robin": Shuffle,
  "weighted": Scale,
  "priority": ListOrdered,
};

const strategyLabels = {
  "round-robin": "Round Robin",
  "weighted": "Weighted",
  "priority": "Priority",
};

const strategyDescriptions = {
  "round-robin": "Cycles through models evenly",
  "weighted": "Routes based on weight percentage",
  "priority": "Uses highest priority first, falls back on error",
};

export default function Combos() {
  const [combos, setCombos] = useState<ModelCombo[]>(mockModelCombos);
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();

  const toggleCombo = (id: string) => {
    setCombos(prev => prev.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const deleteCombo = (id: string) => {
    setCombos(prev => prev.filter(c => c.id !== id));
    toast({ title: "Deleted", description: "Model combo removed" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Model Combos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Named model groups for load balancing across providers</p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          New Combo
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Combos</p>
            <p className="text-lg font-bold mt-0.5">{combos.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-lg font-bold mt-0.5 text-green-400">{combos.filter(c => c.isActive).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-card-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Models in Use</p>
            <p className="text-lg font-bold mt-0.5">{new Set(combos.flatMap(c => c.models.map(m => m.model))).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Combo cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {combos.map((combo) => {
          const StrategyIcon = strategyIcons[combo.strategy];
          const totalWeight = combo.models.reduce((s, m) => s + m.weight, 0);

          return (
            <Card
              key={combo.id}
              className={`bg-card border-card-border ${!combo.isActive ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    {combo.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                      <StrategyIcon className="h-2.5 w-2.5" />
                      {strategyLabels[combo.strategy]}
                    </Badge>
                    <Switch
                      checked={combo.isActive}
                      onCheckedChange={() => toggleCombo(combo.id)}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{strategyDescriptions[combo.strategy]}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Routing flow diagram */}
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary">
                    Request
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <Badge variant="secondary" className="text-[10px]">
                    {combo.name}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-1 flex-wrap">
                    {combo.models.map((model, i) => {
                      const prov = mockEnhancedProviders.find(p => p.id === model.provider);
                      return (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-[10px] text-muted-foreground">|</span>}
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5"
                            style={{ borderColor: prov?.color, borderWidth: "1px" }}
                          >
                            {prov?.alias || model.provider}/{model.model}
                            {combo.strategy === "weighted" && (
                              <span className="ml-1 text-muted-foreground">
                                ({Math.round((model.weight / totalWeight) * 100)}%)
                              </span>
                            )}
                          </Badge>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Model list */}
                <div className="space-y-1.5">
                  {combo.models.map((model, i) => {
                    const prov = mockEnhancedProviders.find(p => p.id === model.provider);
                    const pct = combo.strategy === "weighted"
                      ? Math.round((model.weight / totalWeight) * 100)
                      : combo.strategy === "priority" ? undefined : undefined;

                    return (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                        {combo.strategy === "priority" && (
                          <span className="text-[10px] text-muted-foreground w-4 text-center">#{i + 1}</span>
                        )}
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                          style={{ backgroundColor: prov?.color || "#666" }}
                        >
                          {(prov?.alias || model.provider).slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-mono flex-1">{model.provider}/{model.model}</span>
                        {combo.strategy === "weighted" && (
                          <div className="flex items-center gap-1.5 w-24">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-6 text-right">{pct}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]">
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-red-400 hover:text-red-300"
                    onClick={() => deleteCombo(combo.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {combos.length === 0 && (
        <div className="text-center py-12">
          <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No model combos yet</p>
          <Button size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Create Your First Combo
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <CreateComboDialog open={showCreate} onOpenChange={setShowCreate} onCreate={(combo) => {
        setCombos(prev => [...prev, combo]);
        toast({ title: "Created", description: `Combo "${combo.name}" created` });
      }} />
    </div>
  );
}

function CreateComboDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (combo: ModelCombo) => void;
}) {
  const [name, setName] = useState("");
  const [strategy, setStrategy] = useState<ModelCombo["strategy"]>("round-robin");

  const handleCreate = () => {
    if (!name.trim()) return;
    const combo: ModelCombo = {
      id: `combo-${Date.now()}`,
      name: name.trim(),
      models: [
        { provider: "claude", model: "claude-sonnet-4", weight: 1 },
      ],
      strategy,
      isActive: true,
    };
    onCreate(combo);
    setName("");
    setStrategy("round-robin");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">New Model Combo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Combo Name</Label>
            <Input
              placeholder="e.g., Fast Router"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Strategy</Label>
            <Select value={strategy} onValueChange={(v) => setStrategy(v as typeof strategy)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round-robin">Round Robin</SelectItem>
                <SelectItem value="weighted">Weighted</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
