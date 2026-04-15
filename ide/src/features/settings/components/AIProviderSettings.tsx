import React, { useState } from "react";
import { Eye, EyeOff, Check, ExternalLink } from "lucide-react";
import { AI_PROVIDERS } from "@/lib/cursor-api/types";
import { useSettingsStore } from "../store/settings-store";
import { setProviderApiKey } from "@/lib/cursor-api/client";
import { cn } from "@/lib/utils";

export const AIProviderSettings: React.FC = () => {
  const { providerId, modelId, apiKeys, setProvider, setModel, setApiKey } =
    useSettingsStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedProviders, setSavedProviders] = useState<Record<string, boolean>>({});

  const toggleShow = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveKey = (providerId: string, key: string) => {
    setApiKey(providerId, key);
    setProviderApiKey(providerId, key);
    setSavedProviders((prev) => ({ ...prev, [providerId]: true }));
    setTimeout(() => {
      setSavedProviders((prev) => ({ ...prev, [providerId]: false }));
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-editor-base font-semibold text-xcursor-text mb-1">
          AI Provider
        </h3>
        <p className="text-editor-sm text-xcursor-text-muted mb-4">
          Select your preferred AI provider and enter your API key.
        </p>

        <div className="flex flex-col gap-3">
          {AI_PROVIDERS.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSelected={providerId === provider.id}
              apiKey={apiKeys[provider.id] ?? ""}
              showKey={showKeys[provider.id] ?? false}
              saved={savedProviders[provider.id] ?? false}
              onSelect={() => setProvider(provider.id)}
              onToggleShow={() => toggleShow(provider.id)}
              onSaveKey={(key) => handleSaveKey(provider.id, key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ProviderCardProps {
  provider: (typeof AI_PROVIDERS)[0];
  isSelected: boolean;
  apiKey: string;
  showKey: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleShow: () => void;
  onSaveKey: (key: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isSelected,
  apiKey,
  showKey,
  saved,
  onSelect,
  onToggleShow,
  onSaveKey,
}) => {
  const [localKey, setLocalKey] = useState(apiKey);

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        isSelected
          ? "border-accent/50 bg-accent/5"
          : "border-xcursor-border hover:border-xcursor-text-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Color dot + name */}
        <button
          onClick={onSelect}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <div
            className="w-3 h-3 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: provider.logoColor }}
          />
          <div>
            <p className="text-editor-sm font-medium text-xcursor-text">
              {provider.name}
            </p>
            <p className="text-editor-xs text-xcursor-text-muted">
              {provider.description}
            </p>
          </div>
        </button>

        {/* Selected indicator */}
        {isSelected && (
          <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        )}
      </div>

      {/* API Key input */}
      {provider.requiresApiKey && (
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? "text" : "password"}
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder={provider.apiKeyPlaceholder}
              className="w-full h-7 bg-xcursor-input border border-xcursor-border rounded px-2 pr-7 text-editor-xs text-xcursor-text placeholder:text-xcursor-text-muted focus:outline-none focus:ring-1 focus:ring-accent font-mono"
            />
            <button
              onClick={onToggleShow}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xcursor-text-muted hover:text-xcursor-text"
            >
              {showKey ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </button>
          </div>
          <button
            onClick={() => onSaveKey(localKey)}
            disabled={!localKey.trim()}
            className={cn(
              "flex items-center gap-1 px-2 h-7 rounded text-editor-xs transition-colors",
              saved
                ? "bg-xcursor-success/20 text-xcursor-success"
                : "bg-accent text-white hover:bg-accent-hover disabled:opacity-30"
            )}
          >
            {saved ? <><Check className="h-3 w-3" /> Saved</> : "Save"}
          </button>
        </div>
      )}

      {!provider.requiresApiKey && (
        <div className="mt-2 flex items-center gap-1 text-editor-xs text-xcursor-text-muted">
          {provider.id === "ollama" ? (
            "Runs locally — no API key needed"
          ) : (
            <>
              Requires Cursor account
              <a
                href="https://cursor.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-0.5"
              >
                Sign in <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
};
