-- SECURITY FIX: Remove overly permissive rate_limits policy
-- The "System can manage rate limits" policy with USING(true) allows any authenticated user
-- to read/write ALL users' rate limit data, exposing user activity patterns

DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

-- The existing "Users can view their own rate limits" policy remains intact
-- This ensures users can only see their own rate limit data