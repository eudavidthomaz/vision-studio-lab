import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import MeusConteudos from "./pages/MeusConteudos";
import Metrics from "./pages/Metrics";
import SecurityDashboard from "./pages/SecurityDashboard";
import NotFound from "./pages/NotFound";
import ContentResult from "./pages/ContentResult";
import Profile from "./pages/Profile";
import { lazy } from "react";
import { PrivateRoute } from "./components/PrivateRoute";

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
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/welcome" element={<PrivateRoute><Welcome /></PrivateRoute>} />
          <Route path="/meus-conteudos" element={<PrivateRoute><MeusConteudos /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/conteudo/:id" element={<PrivateRoute><ContentResult /></PrivateRoute>} />
          <Route path="/security" element={<PrivateRoute><SecurityDashboard /></PrivateRoute>} />
          <Route path="/usage" element={<PrivateRoute><UsageDashboard /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/metrics" element={<PrivateRoute><Metrics /></PrivateRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
