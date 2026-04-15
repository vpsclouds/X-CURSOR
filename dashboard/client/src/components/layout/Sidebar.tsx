import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Key,
  Brain,
  Cpu,
  BarChart3,
  CreditCard,
  ToggleLeft,
  Settings,
  ScrollText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "Users", icon: Users },
  { path: "/api-keys", label: "API Keys", icon: Key },
  { path: "/providers", label: "Providers", icon: Brain },
  { path: "/models", label: "Models", icon: Cpu },
  { path: "/usage", label: "Usage", icon: BarChart3 },
  { path: "/billing", label: "Billing", icon: CreditCard },
  { path: "/features", label: "Features", icon: ToggleLeft },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/logs", label: "Logs", icon: ScrollText },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="X-CURSOR Logo"
            className="shrink-0"
          >
            <rect width="32" height="32" rx="8" fill="hsl(252, 85%, 63%)" />
            <path
              d="M8 10L14 16L8 22"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 10L18 16L24 22"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
            <circle cx="16" cy="16" r="2" fill="white" />
          </svg>
          {!collapsed && (
            <span className="font-semibold text-sm tracking-tight text-sidebar-foreground whitespace-nowrap">
              X-CURSOR
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-md text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          data-testid="sidebar-toggle"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
