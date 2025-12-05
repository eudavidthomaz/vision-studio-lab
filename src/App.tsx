import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense, ComponentType } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Eager load only Landing initially
import Landing from "./pages/Landing";

// Helper para lazy load com retry automático e cache-busting
const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> =>
  lazy(async () => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Lazy load attempt ${attempt + 1} failed:`, error);
        
        // Se for erro de módulo não encontrado, tentar com cache-busting
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }

    // Se todas as tentativas falharam, recarregar a página
    console.error('All lazy load attempts failed, reloading page');
    window.location.reload();
    throw lastError;
  });

// Lazy load all other pages with retry
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Welcome = lazyWithRetry(() => import("./pages/Welcome"));
const ContentLibrary = lazyWithRetry(() => import("./pages/ContentLibrary"));
const ContentLibraryDetail = lazyWithRetry(() => import("./pages/ContentLibraryDetail"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const Metrics = lazyWithRetry(() => import("./pages/Metrics"));
const SecurityDashboard = lazyWithRetry(() => import("./pages/SecurityDashboard"));
const UsageDashboard = lazyWithRetry(() => import("./pages/UsageDashboard"));
const Analytics = lazyWithRetry(() => import("./pages/Analytics"));
const Pricing = lazyWithRetry(() => import("./pages/Pricing"));

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
          <ErrorBoundary>
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
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
