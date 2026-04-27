import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Volunteers from "@/pages/Volunteers";
import Missions from "@/pages/Missions";
import Resources from "@/pages/Resources";
import Ngos from "@/pages/Ngos";
import Reports from "@/pages/Reports";
import Assistant from "@/pages/Assistant";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      </Route>
      <Route path="/volunteers">
        <ProtectedRoute><Layout><Volunteers /></Layout></ProtectedRoute>
      </Route>
      <Route path="/missions">
        <ProtectedRoute><Layout><Missions /></Layout></ProtectedRoute>
      </Route>
      <Route path="/resources">
        <ProtectedRoute><Layout><Resources /></Layout></ProtectedRoute>
      </Route>
      <Route path="/ngos">
        <ProtectedRoute><Layout><Ngos /></Layout></ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>
      </Route>
      <Route path="/assistant">
        <ProtectedRoute><Layout><Assistant /></Layout></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
