import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { AI_PROVIDERS } from "@/lib/cursor-api/types";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { cn } from "@/lib/utils";

export const ProviderSelector: React.FC = () => {
  const { providerId, modelId, setProvider, setModel } = useSettingsStore();
  const provider = AI_PROVIDERS.find((p) => p.id === providerId);

  const handleProviderChange = (id: string) => {
    setProvider(id);
  };

  const handleModelChange = (id: string) => {
    setModel(id);
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-xcursor-border bg-xcursor-panel">
      {/* Provider select */}
      <SelectPrimitive.Root value={providerId} onValueChange={handleProviderChange}>
        <SelectPrimitive.Trigger
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-editor-xs text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors border border-xcursor-border max-w-[100px]"
          )}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: provider?.logoColor ?? "#666" }}
          />
          <SelectPrimitive.Value />
          <ChevronDown className="h-2.5 w-2.5 shrink-0 ml-auto" />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 overflow-hidden rounded border border-xcursor-border bg-xcursor-sidebar shadow-lg"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {AI_PROVIDERS.map((p) => (
                <SelectPrimitive.Item
                  key={p.id}
                  value={p.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded text-editor-xs text-xcursor-text cursor-pointer outline-none",
                    "data-[highlighted]:bg-xcursor-selected"
                  )}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.logoColor }}
                  />
                  <SelectPrimitive.ItemText>{p.name}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="ml-auto">
                    <Check className="h-3 w-3 text-accent" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {/* Model select */}
      {provider && (
        <SelectPrimitive.Root value={modelId} onValueChange={handleModelChange}>
          <SelectPrimitive.Trigger
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-editor-xs text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors border border-xcursor-border flex-1 min-w-0"
            )}
          >
            <span className="truncate">
              <SelectPrimitive.Value />
            </span>
            <ChevronDown className="h-2.5 w-2.5 shrink-0 ml-auto" />
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="z-50 overflow-hidden rounded border border-xcursor-border bg-xcursor-sidebar shadow-lg"
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className="p-1">
                {provider.models.map((m) => (
                  <SelectPrimitive.Item
                    key={m}
                    value={m}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded text-editor-xs text-xcursor-text cursor-pointer outline-none",
                      "data-[highlighted]:bg-xcursor-selected"
                    )}
                  >
                    <SelectPrimitive.ItemText>{m}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="ml-auto">
                      <Check className="h-3 w-3 text-accent" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      )}
    </div>
  );
};
