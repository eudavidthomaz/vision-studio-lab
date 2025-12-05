import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";

// Eager load only Landing initially
import Landing from "./pages/Landing";

// Lazy load all other pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const Welcome = lazy(() => import("./pages/Welcome"));
const ContentLibrary = lazy(() => import("./pages/ContentLibrary"));
const ContentLibraryDetail = lazy(() => import("./pages/ContentLibraryDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Metrics = lazy(() => import("./pages/Metrics"));
const SecurityDashboard = lazy(() => import("./pages/SecurityDashboard"));
const UsageDashboard = lazy(() => import("./pages/UsageDashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Pricing = lazy(() => import("./pages/Pricing"));

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

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p>Carregando...</p>
    </div>
  </div>
);

// Componente para redirecionar rotas legadas com parâmetro dinâmico
function LegacyContentRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/biblioteca/${id}`} replace />;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/meus-conteudos" element={<Navigate to="/biblioteca" replace />} />
              <Route path="/conteudo/:id" element={<LegacyContentRedirect />} />
              <Route path="/biblioteca" element={<ContentLibrary />} />
              <Route path="/biblioteca/:id" element={<ContentLibraryDetail />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/security" element={<SecurityDashboard />} />
              <Route path="/usage" element={<UsageDashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
