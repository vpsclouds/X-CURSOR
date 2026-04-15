import React from "react";
import { useSettingsStore } from "../store/settings-store";

const Switch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-editor-sm text-xcursor-text">{label}</p>
      {description && (
        <p className="text-editor-xs text-xcursor-text-muted mt-0.5">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-xcursor-input"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  </div>
);

export const GeneralSettings: React.FC = () => {
  const {
    fontSize,
    fontFamily,
    tabSize,
    wordWrap,
    lineNumbers,
    minimap,
    formatOnSave,
    enableTabCompletion,
    enableInlineEdit,
    setFontSize,
    updateSettings,
    toggleTabCompletion,
  } = useSettingsStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Editor */}
      <section>
        <h3 className="text-editor-base font-semibold text-xcursor-text mb-3">
          Editor
        </h3>
        <div className="flex flex-col gap-1 divide-y divide-xcursor-border">
          {/* Font size */}
          <div className="flex items-center justify-between py-2">
            <label className="text-editor-sm text-xcursor-text">Font Size</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                className="w-6 h-6 flex items-center justify-center rounded border border-xcursor-border text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover"
              >
                -
              </button>
              <span className="text-editor-sm text-xcursor-text w-6 text-center">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className="w-6 h-6 flex items-center justify-center rounded border border-xcursor-border text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover"
              >
                +
              </button>
            </div>
          </div>

          {/* Tab size */}
          <div className="flex items-center justify-between py-2">
            <label className="text-editor-sm text-xcursor-text">Tab Size</label>
            <select
              value={tabSize}
              onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
              className="bg-xcursor-input border border-xcursor-border rounded px-2 py-0.5 text-editor-xs text-xcursor-text focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {[2, 4, 8].map((n) => (
                <option key={n} value={n}>{n} spaces</option>
              ))}
            </select>
          </div>

          <Switch
            checked={wordWrap}
            onChange={(v) => updateSettings({ wordWrap: v })}
            label="Word Wrap"
          />
          <Switch
            checked={lineNumbers}
            onChange={(v) => updateSettings({ lineNumbers: v })}
            label="Line Numbers"
          />
          <Switch
            checked={minimap}
            onChange={(v) => updateSettings({ minimap: v })}
            label="Minimap"
          />
          <Switch
            checked={formatOnSave}
            onChange={(v) => updateSettings({ formatOnSave: v })}
            label="Format on Save"
          />
        </div>
      </section>

      {/* AI Features */}
      <section>
        <h3 className="text-editor-base font-semibold text-xcursor-text mb-3">
          AI Features
        </h3>
        <div className="flex flex-col gap-1 divide-y divide-xcursor-border">
          <Switch
            checked={enableTabCompletion}
            onChange={toggleTabCompletion}
            label="Tab Completion (Cursor Tab)"
            description="AI-powered inline code completions"
          />
          <Switch
            checked={enableInlineEdit}
            onChange={(v) => updateSettings({ enableInlineEdit: v })}
            label="Inline Edit (⌘K)"
            description="Quick AI edits within the editor"
          />
        </div>
      </section>
    </div>
  );
};
