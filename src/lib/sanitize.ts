/**
 * Utilitários de sanitização de inputs
 * Previne XSS e injection attacks
 */

/**
 * Remove scripts, iframes e tags HTML perigosas
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '');
}

/**
 * Limita comprimento e remove caracteres de controle
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (!text) return '';
  
  return text
    .slice(0, maxLength)
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove caracteres de controle
    .trim();
}

/**
 * Sanitiza prompts para AI (evita prompt injection)
 */
export function sanitizeAiPrompt(prompt: string, maxLength: number = 5000): string {
  return sanitizeText(prompt, maxLength)
    .replace(/```/g, '') // Remove code blocks markers
    .replace(/\[SYSTEM\]/gi, '') // Remove tentativas de system prompt injection
    .replace(/\[ASSISTANT\]/gi, '')
    .replace(/\[USER\]/gi, '');
}

/**
 * Valida e sanitiza URLs
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    
    // Apenas permite http e https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitiza input de busca/filtro
 */
export function sanitizeSearchTerm(term: string): string {
  return sanitizeText(term, 200)
    .replace(/[%_]/g, '') // Remove wildcards SQL
    .toLowerCase();
}
