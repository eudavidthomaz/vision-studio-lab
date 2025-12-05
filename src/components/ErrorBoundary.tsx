import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

/**
 * ErrorBoundary que captura erros de importação dinâmica e outros erros de runtime.
 * Para erros de chunk/module, oferece opção de recarregar com cache limpo.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError = ErrorBoundary.isChunkLoadError(error);
    return { hasError: true, error, isChunkError };
  }

  static isChunkLoadError(error: Error): boolean {
    const message = error.message?.toLowerCase() || '';
    return (
      message.includes('failed to fetch dynamically imported module') ||
      message.includes('loading chunk') ||
      message.includes('loading css chunk') ||
      message.includes('failed to load') ||
      message.includes('dynamically imported module')
    );
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    // Se é erro de chunk, tenta limpar cache e recarregar automaticamente (uma vez)
    if (ErrorBoundary.isChunkLoadError(error)) {
      const reloadKey = 'error_boundary_reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      
      // Evita loop infinito: só recarrega automaticamente se passou mais de 10s
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        console.log('[ErrorBoundary] Auto-reloading due to chunk error...');
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
        return;
      }
    }
  }

  handleReload = () => {
    // Limpa sessionStorage para permitir novo reload automático
    sessionStorage.removeItem('error_boundary_reload');
    sessionStorage.removeItem('lazy_retry_reload');
    window.location.reload();
  };

  handleGoHome = () => {
    sessionStorage.removeItem('error_boundary_reload');
    sessionStorage.removeItem('lazy_retry_reload');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, isChunkError } = this.state;
      
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <div className="text-6xl mb-4">
              {isChunkError ? '🔄' : '⚠️'}
            </div>
            
            <h1 className="text-2xl font-bold text-destructive">
              {isChunkError ? 'Atualização Detectada' : 'Algo deu errado'}
            </h1>
            
            <p className="text-muted-foreground">
              {isChunkError 
                ? 'O aplicativo foi atualizado. Por favor, recarregue a página para continuar.'
                : error?.message || 'Ocorreu um erro inesperado.'
              }
            </p>
            
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Recarregar Página
              </button>
              
              {!isChunkError && (
                <button
                  onClick={this.handleGoHome}
                  className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
                >
                  Ir para Início
                </button>
              )}
            </div>
            
            {/* Detalhes técnicos (colapsável) */}
            {error && !isChunkError && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-32">
                  {error.message}
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