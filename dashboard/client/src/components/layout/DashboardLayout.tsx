import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onLogout={onLogout} />
        <ScrollArea className="flex-1">
          <main className="p-6" data-testid="main-content">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
