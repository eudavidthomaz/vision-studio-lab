import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { lazy, Suspense, Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Eager load only Landing initially
import Landing from "./pages/Landing";

// Helper to retry lazy imports with cache-busting
const lazyWithRetry = (importFn: () => Promise<any>) =>
  lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      // Retry with cache-busting query param
      console.warn('Lazy import failed, retrying...', error);
      const timestamp = Date.now();
      const originalPath = importFn.toString().match(/import\("(.+?)"\)/)?.[1];
      if (originalPath) {
        try {
          // Try to re-import with a timestamp to bust cache
          return await import(/* @vite-ignore */ `${originalPath}?t=${timestamp}`);
        } catch {
          // If still failing, throw original error
          throw error;
        }
      }
      throw error;
    }
  });

// Lazy load all other pages
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

// Error Boundary for catching lazy load errors
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar página</h2>
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro ao carregar esta página. Tente recarregar.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
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
                <Route path="/conteudo/:id" element={<Navigate to="/biblioteca/:id" replace />} />
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
