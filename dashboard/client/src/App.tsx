import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ApiKeys from "./pages/ApiKeys";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import Models from "./pages/Models";
import Combos from "./pages/Combos";
import Routing from "./pages/Routing";
import Usage from "./pages/Usage";
import Billing from "./pages/Billing";
import Features from "./pages/Features";
import Settings from "./pages/Settings";
import Logs from "./pages/Logs";
import NotFound from "./pages/not-found";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, navigate] = useHashLocation();

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/login");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/users" component={Users} />
        <Route path="/api-keys" component={ApiKeys} />
        <Route path="/providers/:id" component={ProviderDetail} />
        <Route path="/providers" component={Providers} />
        <Route path="/models" component={Models} />
        <Route path="/combos" component={Combos} />
        <Route path="/routing" component={Routing} />
        <Route path="/usage" component={Usage} />
        <Route path="/billing" component={Billing} />
        <Route path="/features" component={Features} />
        <Route path="/settings" component={Settings} />
        <Route path="/logs" component={Logs} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Router hook={useHashLocation}>
      <AppContent />
      <Toaster />
    </Router>
  );
}

export default App;
