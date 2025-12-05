import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense, ComponentType } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Eager load Landing only
import Landing from "./pages/Landing";

// Lazy load helper with retry and cache-busting
const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  moduleName: string
): React.LazyExoticComponent<T> =>
  lazy(async () => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt === 0) {
          return await componentImport();
        }
        
        // Cache-bust on retry
        if ('caches' in window) {
          const keys = await caches.keys();
          for (const key of keys) {
            await caches.delete(key);
          }
        }
        
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Lazy load attempt ${attempt + 1} failed for ${moduleName}:`, error);
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // Force reload on final failure
    const reloadKey = `reload_${moduleName}`;
    const attempts = parseInt(sessionStorage.getItem(reloadKey) || '0');
    
    if (attempts < 2) {
      sessionStorage.setItem(reloadKey, String(attempts + 1));
      window.location.href = `${window.location.pathname}?t=${Date.now()}`;
    }
    
    throw lastError;
  });

// Lazy load pages
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"), "Dashboard");
const Auth = lazyWithRetry(() => import("./pages/Auth"), "Auth");
const Welcome = lazyWithRetry(() => import("./pages/Welcome"), "Welcome");
const ContentLibrary = lazyWithRetry(() => import("./pages/ContentLibrary"), "ContentLibrary");
const ContentLibraryDetail = lazyWithRetry(() => import("./pages/ContentLibraryDetail"), "ContentLibraryDetail");
const NotFound = lazyWithRetry(() => import("./pages/NotFound"), "NotFound");
const Profile = lazyWithRetry(() => import("./pages/Profile"), "Profile");
const UsageDashboard = lazyWithRetry(() => import("./pages/UsageDashboard"), "UsageDashboard");
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
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Legacy route handler
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
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
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
              {/* Legacy redirects */}
              <Route path="/meus-conteudos" element={<Navigate to="/biblioteca" replace />} />
              <Route path="/conteudo/:id" element={<LegacyContentRedirect />} />
              <Route path="/metrics" element={<Navigate to="/dashboard" replace />} />
              <Route path="/security" element={<Navigate to="/dashboard" replace />} />
              <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
