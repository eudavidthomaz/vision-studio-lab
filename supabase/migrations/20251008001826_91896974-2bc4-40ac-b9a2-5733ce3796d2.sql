-- ============================================
-- RATE LIMITING SYSTEM
-- ============================================

-- Create rate_limits table to track API usage
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rate_limits
CREATE POLICY "Users can view their own rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint 
  ON public.rate_limits(user_id, endpoint, window_start DESC);

-- ============================================
-- RATE LIMIT CHECK FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id UUID,
  _endpoint TEXT,
  _max_requests INTEGER,
  _window_minutes INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_count INTEGER;
  _window_start TIMESTAMP WITH TIME ZONE;
  _is_allowed BOOLEAN;
  _reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start
  _window_start := DATE_TRUNC('minute', NOW()) - (EXTRACT(MINUTE FROM NOW())::INTEGER % _window_minutes) * INTERVAL '1 minute';
  _reset_at := _window_start + (_window_minutes * INTERVAL '1 minute');
  
  -- Get or create rate limit record
  INSERT INTO public.rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (_user_id, _endpoint, _window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    created_at = NOW()
  RETURNING request_count INTO _current_count;
  
  -- Check if limit exceeded
  _is_allowed := _current_count <= _max_requests;
  
  -- Return result
  RETURN jsonb_build_object(
    'allowed', _is_allowed,
    'current_count', _current_count,
    'max_requests', _max_requests,
    'reset_at', _reset_at,
    'retry_after', GREATEST(0, EXTRACT(EPOCH FROM (_reset_at - NOW())))
  );
END;
$$;

-- ============================================
-- USAGE QUOTAS ENHANCEMENTS
-- ============================================

-- Add monthly reset function
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usage_quotas
  SET 
    weekly_packs_used = 0,
    challenges_used = 0,
    images_generated = 0,
    reset_date = CURRENT_DATE + INTERVAL '1 month',
    updated_at = NOW()
  WHERE reset_date <= CURRENT_DATE;
END;
$$;

-- ============================================
-- AUDIT LOG FOR SECURITY EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  endpoint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON public.security_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_user_created 
  ON public.security_audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_event_type 
  ON public.security_audit_log(event_type, created_at DESC);

-- ============================================
-- INPUT VALIDATION HELPERS
-- ============================================

-- Function to validate and sanitize text input
CREATE OR REPLACE FUNCTION public.validate_text_input(
  _input TEXT,
  _min_length INTEGER DEFAULT 1,
  _max_length INTEGER DEFAULT 10000,
  _field_name TEXT DEFAULT 'input'
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check for null
  IF _input IS NULL THEN
    RAISE EXCEPTION 'Validation error: % cannot be null', _field_name;
  END IF;
  
  -- Trim whitespace
  _input := TRIM(_input);
  
  -- Check length
  IF LENGTH(_input) < _min_length THEN
    RAISE EXCEPTION 'Validation error: % must be at least % characters', _field_name, _min_length;
  END IF;
  
  IF LENGTH(_input) > _max_length THEN
    RAISE EXCEPTION 'Validation error: % must be at most % characters', _field_name, _max_length;
  END IF;
  
  RETURN _input;
END;
$$;