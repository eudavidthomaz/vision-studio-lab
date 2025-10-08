import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rate limit configurations per endpoint
export const RATE_LIMITS = {
  'transcribe-sermon': { max: 10, windowMinutes: 60 }, // 10 per hour
  'generate-week-pack': { max: 20, windowMinutes: 60 }, // 20 per hour
  'generate-ideon-challenge': { max: 30, windowMinutes: 60 }, // 30 per hour
  'generate-content-idea': { max: 50, windowMinutes: 60 }, // 50 per hour
  'generate-post-image': { max: 30, windowMinutes: 60 }, // 30 per hour
};

export interface ValidationRule {
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: any[];
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  retryAfter: number;
  
  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Validate input according to rules
export function validateInput(fieldName: string, rule: ValidationRule): void {
  const { value, type, required, minLength, maxLength, min, max, pattern, allowedValues } = rule;

  // Check required
  if (required && (value === null || value === undefined || value === '')) {
    throw new ValidationError(`${fieldName} is required`);
  }

  // Skip further validation if optional and empty
  if (!required && (value === null || value === undefined || value === '')) {
    return;
  }

  // Type validation
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  if (actualType !== type) {
    throw new ValidationError(`${fieldName} must be of type ${type}`);
  }

  // String validations
  if (type === 'string') {
    const strValue = value as string;
    
    if (minLength !== undefined && strValue.length < minLength) {
      throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
    }
    
    if (maxLength !== undefined && strValue.length > maxLength) {
      throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`);
    }
    
    if (pattern && !pattern.test(strValue)) {
      throw new ValidationError(`${fieldName} has invalid format`);
    }
  }

  // Number validations
  if (type === 'number') {
    const numValue = value as number;
    
    if (min !== undefined && numValue < min) {
      throw new ValidationError(`${fieldName} must be at least ${min}`);
    }
    
    if (max !== undefined && numValue > max) {
      throw new ValidationError(`${fieldName} must be at most ${max}`);
    }
  }

  // Allowed values validation
  if (allowedValues && !allowedValues.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
}

// Check rate limit using Supabase function
export async function checkRateLimit(
  supabaseClient: any,
  userId: string,
  endpoint: string
): Promise<void> {
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS];
  
  if (!config) {
    console.warn(`No rate limit config for endpoint: ${endpoint}`);
    return;
  }

  try {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
      _user_id: userId,
      _endpoint: endpoint,
      _max_requests: config.max,
      _window_minutes: config.windowMinutes,
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // Don't block on rate limit check errors
      return;
    }

    if (data && !data.allowed) {
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(data.retry_after)} seconds.`,
        data.retry_after
      );
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    // Don't block on unexpected errors
    console.error('Unexpected rate limit error:', error);
  }
}

// Log security event
export async function logSecurityEvent(
  supabaseClient: any,
  userId: string | null,
  eventType: string,
  endpoint: string,
  success: boolean,
  errorMessage?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabaseClient.from('security_audit_log').insert({
      user_id: userId,
      event_type: eventType,
      endpoint,
      success,
      error_message: errorMessage,
      metadata: metadata || {},
    });
  } catch (error) {
    // Don't throw - logging should never break the request
    console.error('Failed to log security event:', error);
  }
}

// Sanitize text to prevent injection attacks
export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (!text) return '';
  
  // Remove any potential XSS/injection patterns
  let sanitized = text
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

// Create authenticated Supabase client from request
export function createAuthenticatedClient(req: Request): {
  client: any;
  userId: string | null;
} {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
  
  // Extract user ID from JWT (simplified - in production use proper JWT parsing)
  let userId: string | null = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub || null;
    } catch (e) {
      console.error('Failed to parse JWT:', e);
    }
  }
  
  return { client, userId };
}
