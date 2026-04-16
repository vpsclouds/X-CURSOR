import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Calculator, ArrowRightLeft } from "lucide-react";
import { mockEnhancedModels } from "@/data/mock-data";
import type { AIModelEnhanced } from "@/types";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel?: string;
}

export default function PricingModal({ open, onOpenChange, selectedModel }: PricingModalProps) {
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "—";
    if (price === 0) return "$0";
    return `$${price.toFixed(2)}`;
  };

  const estimateCost = (model: AIModelEnhanced) => {
    const inputCost = (inputTokens / 1_000_000) * model.pricing.input;
    const outputCost = (outputTokens / 1_000_000) * model.pricing.output;
    return inputCost + outputCost;
  };

  const modelsByProvider = useMemo(() => {
    const grouped: Record<string, AIModelEnhanced[]> = {};
    mockEnhancedModels.forEach((m) => {
      if (!grouped[m.provider]) grouped[m.provider] = [];
      grouped[m.provider].push(m);
    });
    return grouped;
  }, []);

  const sortedModels = useMemo(() => {
    return [...mockEnhancedModels].sort((a, b) => estimateCost(a) - estimateCost(b));
  }, [inputTokens, outputTokens]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            Model Pricing
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="table" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="table" className="text-xs">
              <DollarSign className="mr-1 h-3 w-3" />
              Pricing Table
            </TabsTrigger>
            <TabsTrigger value="calculator" className="text-xs">
              <Calculator className="mr-1 h-3 w-3" />
              Cost Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="flex-1 min-h-0 overflow-auto">
            <div className="space-y-4">
              {Object.entries(modelsByProvider).map(([provider, models]) => (
                <div key={provider}>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background py-1">{provider}</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[11px] w-[180px]">Model</TableHead>
                        <TableHead className="text-[11px] text-right">Input</TableHead>
                        <TableHead className="text-[11px] text-right">Output</TableHead>
                        <TableHead className="text-[11px] text-right">Cached</TableHead>
                        <TableHead className="text-[11px] text-right">Reasoning</TableHead>
                        <TableHead className="text-[11px] text-right">Cache Write</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((model) => (
                        <TableRow key={model.id} className={selectedModel === model.name ? "bg-primary/5" : ""}>
                          <TableCell className="text-xs font-mono">
                            {model.name}
                            {model.isFreeTier && (
                              <Badge variant="secondary" className="ml-1.5 text-[9px] bg-green-500/15 text-green-400 px-1">FREE</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{formatPrice(model.pricing.input)}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{formatPrice(model.pricing.output)}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{formatPrice(model.pricing.cached)}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{formatPrice(model.pricing.reasoning)}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{formatPrice(model.pricing.cacheCreation)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Provider overrides */}
                  {models.some(m => Object.keys(m.providerOverrides).length > 0) && (
                    <div className="mt-1 mb-3 ml-4">
                      {models.filter(m => Object.keys(m.providerOverrides).length > 0).map(m => (
                        Object.entries(m.providerOverrides).map(([prov, pricing]) => (
                          <div key={`${m.id}-${prov}`} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <ArrowRightLeft className="h-2.5 w-2.5" />
                            <span className="font-mono">{m.name}</span>
                            <span>via</span>
                            <Badge variant="secondary" className="text-[9px] px-1">{prov}</Badge>
                            <span>→ {pricing.input === 0 ? "FREE" : `$${pricing.input}/$${pricing.output}`}</span>
                          </div>
                        ))
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">All prices in $/1M tokens</p>
          </TabsContent>

          <TabsContent value="calculator" className="flex-1 min-h-0 overflow-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md">
                <div className="space-y-1.5">
                  <Label className="text-xs">Input Tokens</Label>
                  <Input
                    type="number"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Output Tokens</Label>
                  <Input
                    type="number"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">Model</TableHead>
                    <TableHead className="text-[11px]">Provider</TableHead>
                    <TableHead className="text-[11px] text-right">Estimated Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedModels.map((model) => {
                    const cost = estimateCost(model);
                    return (
                      <TableRow key={model.id}>
                        <TableCell className="text-xs font-mono">{model.name}</TableCell>
                        <TableCell className="text-xs">{model.provider}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums font-medium">
                          {cost === 0 ? (
                            <span className="text-green-400">$0.00</span>
                          ) : cost < 0.001 ? (
                            <span>${cost.toFixed(6)}</span>
                          ) : (
                            <span>${cost.toFixed(4)}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
