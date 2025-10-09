/**
 * Sistema de logging seguro
 * Em production, não expõe detalhes técnicos sensíveis
 */

const isProduction = import.meta.env.PROD;

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

class SecureLogger {
  private sanitizeError(error: any): string {
    if (isProduction) {
      // Em production, não expor stack traces ou detalhes internos
      return error?.message || 'An error occurred';
    }
    return error?.stack || error?.message || String(error);
  }

  info(message: string, context?: LogContext) {
    if (!isProduction) {
      console.log(`[INFO] ${message}`, context);
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context);
  }

  error(message: string, error?: any, context?: LogContext) {
    const sanitizedError = this.sanitizeError(error);
    
    if (isProduction) {
      // Em production, log mínimo sem expor detalhes
      console.error(`[ERROR] ${message}`);
    } else {
      console.error(`[ERROR] ${message}`, {
        error: sanitizedError,
        ...context,
      });
    }
  }

  security(event: string, details?: LogContext) {
    // Sempre log de eventos de segurança
    console.warn(`[SECURITY] ${event}`, details);
    
    // Aqui poderia enviar para sistema de auditoria externo
    // sendToSecurityAudit(event, details);
  }
}

export const secureLog = new SecureLogger();
