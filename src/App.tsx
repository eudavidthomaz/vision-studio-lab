import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import ContentLibrary from "./pages/ContentLibrary";
import ContentLibraryDetail from "./pages/ContentLibraryDetail";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import UsageDashboard from "./pages/UsageDashboard";
import Pricing from "./pages/Pricing";
import Volunteers from "./pages/Volunteers";
import Schedules from "./pages/Schedules";
import ConfirmSchedule from "./pages/ConfirmSchedule";
import VolunteerReports from "./pages/VolunteerReports";
import Install from "./pages/Install";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

function LegacyContentRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/biblioteca/${id}`} replace />;
}

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
          <Route path="/biblioteca" element={<ContentLibrary />} />
          <Route path="/biblioteca/:id" element={<ContentLibraryDetail />} />
          <Route path="/usage" element={<UsageDashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/voluntarios" element={<Volunteers />} />
          <Route path="/voluntarios/relatorios" element={<VolunteerReports />} />
          <Route path="/escalas" element={<Schedules />} />
          <Route path="/confirmar/:token" element={<ConfirmSchedule />} />
          <Route path="/instalar" element={<Install />} />
          {/* Legacy redirects */}
          <Route path="/meus-conteudos" element={<Navigate to="/biblioteca" replace />} />
          <Route path="/conteudo/:id" element={<LegacyContentRedirect />} />
          <Route path="/metrics" element={<Navigate to="/dashboard" replace />} />
          <Route path="/security" element={<Navigate to="/dashboard" replace />} />
          <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;