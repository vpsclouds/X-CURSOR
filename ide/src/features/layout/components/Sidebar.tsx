import React from "react";
import { Files, GitBranch, Search, Settings } from "lucide-react";
import { FileTree } from "@/features/file-explorer/components/FileTree";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

type SidebarTab = "files" | "git" | "search";

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onOpenSettings: () => void;
}

const SIDEBAR_ICONS: { tab: SidebarTab; Icon: React.FC<{ className?: string }>; label: string }[] = [
  { tab: "files", Icon: Files, label: "Explorer" },
  { tab: "git", Icon: GitBranch, label: "Source Control" },
  { tab: "search", Icon: Search, label: "Search" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
}) => {
  return (
    <div className="flex h-full bg-xcursor-sidebar border-r border-xcursor-border">
      {/* Icon rail */}
      <div className="flex flex-col items-center w-10 py-2 gap-1 border-r border-xcursor-border shrink-0">
        {SIDEBAR_ICONS.map(({ tab, Icon, label }) => (
          <Tooltip key={tab}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onTabChange(tab)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded transition-colors",
                  activeTab === tab
                    ? "text-xcursor-text bg-xcursor-selected"
                    : "text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 flex items-center justify-center rounded text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <SidebarContent tab={activeTab} />
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{ tab: SidebarTab }> = ({ tab }) => {
  switch (tab) {
    case "files":
      return <FileTree />;
    case "git":
      return <GitPanel />;
    case "search":
      return <SearchPanel />;
    default:
      return null;
  }
};

const GitPanel: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="flex items-center px-3 py-2 border-b border-xcursor-border">
      <span className="text-editor-xs font-semibold text-xcursor-text uppercase tracking-widest">
        Source Control
      </span>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <p className="text-editor-xs text-xcursor-text-muted">No changes</p>
    </div>
  </div>
);

const SearchPanel: React.FC = () => {
  const [query, setQuery] = React.useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-3 py-2 border-b border-xcursor-border">
        <span className="text-editor-xs font-semibold text-xcursor-text uppercase tracking-widest">
          Search
        </span>
      </div>
      <div className="px-2 py-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full bg-xcursor-input border border-xcursor-border rounded px-2 py-1 text-editor-sm text-xcursor-text placeholder:text-xcursor-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-editor-xs text-xcursor-text-muted">
          {query ? `Searching "${query}"...` : "Type to search"}
        </p>
      </div>
    </div>
  );
};
