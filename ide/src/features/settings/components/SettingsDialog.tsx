import React, { useState } from "react";
import { Settings, Code2, Cpu, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { GeneralSettings } from "./GeneralSettings";
import { AIProviderSettings } from "./AIProviderSettings";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "../store/settings-store";

type SettingsTab = "general" | "ai" | "appearance";

const SETTINGS_TABS: { id: SettingsTab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: "general", label: "Editor", Icon: Code2 },
  { id: "ai", label: "AI & Models", Icon: Cpu },
  { id: "appearance", label: "Appearance", Icon: Palette },
];

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("ai");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl w-full h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-0 border-b border-xcursor-border">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-accent" />
            <DialogTitle>Settings</DialogTitle>
          </div>
          {/* Tab nav */}
          <div className="flex items-end gap-0">
            {SETTINGS_TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 text-editor-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === id
                    ? "text-xcursor-text border-accent"
                    : "text-xcursor-text-muted border-transparent hover:text-xcursor-text"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "ai" && <AIProviderSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// -- Appearance settings --

const THEME_OPTIONS: { label: string; value: "dark" | "light"; preview: string }[] = [
  { label: "Dark (Default)", value: "dark", preview: "#1e1e1e" },
  { label: "Dark High Contrast", value: "dark", preview: "#000000" },
  { label: "Light", value: "light", preview: "#f5f5f5" },
];

const FONT_OPTIONS = ["JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas"];

const AppearanceSettings: React.FC = () => {
  const { theme, fontFamily, setTheme, updateSettings } = useSettingsStore();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-editor-base font-semibold text-xcursor-text mb-3">Theme</h3>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((opt) => {
            const isActive =
              (opt.value === "dark" && theme === "dark" && opt.label === "Dark (Default)") ||
              (opt.value === "light" && theme === "light");
            return (
              <button
                key={opt.label}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "p-3 rounded-lg border text-editor-xs text-left transition-colors",
                  isActive
                    ? "border-accent/50 bg-accent/5 text-xcursor-text"
                    : "border-xcursor-border text-xcursor-text-muted hover:border-xcursor-text-muted/50"
                )}
              >
                <div
                  className="w-full h-8 rounded mb-2 border border-xcursor-border/50"
                  style={{ backgroundColor: opt.preview }}
                />
                {opt.label}
                {isActive && <span className="ml-1 text-accent">&#10003;</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-editor-base font-semibold text-xcursor-text mb-3">Font</h3>
        <div className="flex flex-col gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font}
              onClick={() => updateSettings({ fontFamily: font })}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded border text-editor-sm transition-colors",
                fontFamily === font
                  ? "border-accent/50 bg-accent/5 text-xcursor-text"
                  : "border-xcursor-border text-xcursor-text-muted hover:bg-xcursor-hover"
              )}
            >
              <span className="font-mono">{font}</span>
              {fontFamily === font && (
                <span className="ml-auto text-editor-xs text-accent">active</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
