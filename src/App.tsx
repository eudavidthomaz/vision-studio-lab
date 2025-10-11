import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import ContentLibrary from "./pages/ContentLibrary";
import ContentLibraryDetail from "./pages/ContentLibraryDetail";
import Metrics from "./pages/Metrics";
import SecurityDashboard from "./pages/SecurityDashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import { lazy } from "react";

const UsageDashboard = lazy(() => import("./pages/UsageDashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/welcome" element={<Welcome />} />
          {/* Redirects - Old routes */}
          <Route path="/meus-conteudos" element={<Navigate to="/biblioteca" replace />} />
          <Route path="/conteudo/:id" element={<Navigate to="/biblioteca/:id" replace />} />
          {/* New unified routes */}
          <Route path="/biblioteca" element={<ContentLibrary />} />
          <Route path="/biblioteca/:id" element={<ContentLibraryDetail />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/security" element={<SecurityDashboard />} />
          <Route path="/usage" element={<UsageDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
