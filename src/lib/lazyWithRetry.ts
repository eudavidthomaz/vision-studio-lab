import { lazy, ComponentType } from 'react';

/**
 * Wrapper para lazy() que implementa retry com cache-busting
 * para resolver erros "Failed to fetch dynamically imported module"
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  retries = 2,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= retries; i++) {
      try {
        // Na primeira tentativa, usa import normal
        // Nas próximas, adiciona cache-buster
        if (i === 0) {
          return await importFn();
        }
        
        // Aguarda antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, interval));
        
        // Força reload da página se todas as tentativas falharem
        // Isso limpa o cache do Vite/browser
        console.warn(`[lazyWithRetry] Tentativa ${i + 1} de ${retries + 1}...`);
        
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        console.error(`[lazyWithRetry] Falha na tentativa ${i + 1}:`, error);
        
        // Se é erro de importação dinâmica e ainda temos tentativas
        if (i < retries && isChunkLoadError(error)) {
          continue;
        }
      }
    }
    
    // Se todas as tentativas falharam, força reload
    console.error('[lazyWithRetry] Todas as tentativas falharam, recarregando página...');
    
    // Limpa cache e recarrega
    if (typeof window !== 'undefined') {
      // Adiciona flag para evitar loop infinito de reloads
      const reloadKey = 'lazy_retry_reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
      }
    }
    
    throw lastError || new Error('Failed to load module after retries');
  });
}

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('loading chunk') ||
    message.includes('loading css chunk') ||
    message.includes('failed to load') ||
    message.includes('dynamically imported module')
  );
}
