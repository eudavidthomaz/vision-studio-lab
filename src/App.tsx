import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense, ComponentType } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Eager load only Landing initially
import Landing from "./pages/Landing";

// Helper para lazy load com retry automático e cache-busting efetivo
const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  moduleName: string
): React.LazyExoticComponent<T> =>
  lazy(async () => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Na primeira tentativa, usar import normal
        if (attempt === 0) {
          return await componentImport();
        }
        
        // Nas tentativas subsequentes, forçar cache-busting
        const timestamp = Date.now();
        const modulePath = `/src/pages/${moduleName}.tsx?t=${timestamp}`;
        console.log(`Retry ${attempt}: loading ${modulePath}`);
        
        // Limpar cache do módulo se possível
        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          for (const key of cacheKeys) {
            const cache = await caches.open(key);
            await cache.delete(modulePath);
          }
        }
        
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Lazy load attempt ${attempt + 1} failed for ${moduleName}:`, error);
        
        // Aguardar antes da próxima tentativa
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // Se todas as tentativas falharam, forçar reload com cache-busting
    console.error(`All lazy load attempts failed for ${moduleName}, forcing reload`);
    
    // Limpar sessionStorage para evitar loop infinito
    const reloadKey = `reload_attempt_${moduleName}`;
    const reloadAttempts = parseInt(sessionStorage.getItem(reloadKey) || '0');
    
    if (reloadAttempts < 2) {
      sessionStorage.setItem(reloadKey, String(reloadAttempts + 1));
      window.location.href = window.location.pathname + '?cache_bust=' + Date.now();
    }
    
    throw lastError;
  });

// Lazy load all other pages with retry and module name for cache-busting
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"), "Dashboard");
const Auth = lazyWithRetry(() => import("./pages/Auth"), "Auth");
const Welcome = lazyWithRetry(() => import("./pages/Welcome"), "Welcome");
const ContentLibrary = lazyWithRetry(() => import("./pages/ContentLibrary"), "ContentLibrary");
const ContentLibraryDetail = lazyWithRetry(() => import("./pages/ContentLibraryDetail"), "ContentLibraryDetail");
const NotFound = lazyWithRetry(() => import("./pages/NotFound"), "NotFound");
const Profile = lazyWithRetry(() => import("./pages/Profile"), "Profile");
const Metrics = lazyWithRetry(() => import("./pages/Metrics"), "Metrics");
const SecurityDashboard = lazyWithRetry(() => import("./pages/SecurityDashboard"), "SecurityDashboard");
const UsageDashboard = lazyWithRetry(() => import("./pages/UsageDashboard"), "UsageDashboard");
const Analytics = lazyWithRetry(() => import("./pages/Analytics"), "Analytics");
const Pricing = lazyWithRetry(() => import("./pages/Pricing"), "Pricing");

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
