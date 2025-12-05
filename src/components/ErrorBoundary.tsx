import React from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    // Limpar estado de erro e tentar renderizar novamente
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    // Limpar caches e recarregar
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    }
    // Limpar sessionStorage de tentativas de reload
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('reload_attempt_')) {
        sessionStorage.removeItem(key);
      }
    });
    window.location.href = window.location.pathname + '?cache_bust=' + Date.now();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isModuleError = this.state.error?.message?.includes('dynamically imported module') ||
                           this.state.error?.message?.includes('Failed to fetch');
      
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {isModuleError ? 'Erro ao carregar página' : 'Algo deu errado'}
              </h1>
              <p className="text-muted-foreground">
                {isModuleError 
                  ? 'Houve um problema ao carregar os recursos da página. Isso pode acontecer após uma atualização.'
                  : this.state.error?.message || 'Ocorreu um erro inesperado.'
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={this.handleRetry}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
              
              <Button 
                onClick={this.handleReload}
                variant="default"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar página
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="secondary"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Voltar ao início
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left bg-muted p-4 rounded-lg text-xs">
                <summary className="cursor-pointer font-medium mb-2">
                  Detalhes técnicos (dev only)
                </summary>
                <pre className="overflow-auto max-h-40 whitespace-pre-wrap text-destructive">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
