import React, { useState } from "react";
import { TooltipProvider } from "@/ui/tooltip";
import { MainLayout } from "@/features/layout/components/MainLayout";
import { SettingsDialog } from "@/features/settings/components/SettingsDialog";
import { Toaster } from "sonner";

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={400}>
      <div className="h-screen overflow-hidden bg-xcursor-bg">
        <MainLayout onOpenSettings={() => setSettingsOpen(true)} />

        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#252526",
              border: "1px solid #3e3e42",
              color: "#cccccc",
            },
          }}
        />
      </div>
    </TooltipProvider>
  );
};

export default App;
