-- Atualizar tabela usage_quotas para novo modelo de quotas
ALTER TABLE public.usage_quotas 
  DROP COLUMN IF EXISTS sermon_packs_generated,
  DROP COLUMN IF EXISTS challenges_used;

ALTER TABLE public.usage_quotas 
  ADD COLUMN IF NOT EXISTS transcriptions_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS live_captures_used integer NOT NULL DEFAULT 0;

-- Criar função para verificar quota antes de usar recurso
CREATE OR REPLACE FUNCTION public.check_quota(
  _user_id uuid,
  _feature text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
  _quota record;
  _limit integer;
  _used integer;
  _can_use boolean;
BEGIN
  -- Get user role
  SELECT role INTO _role FROM user_roles WHERE user_id = _user_id;
  IF _role IS NULL THEN _role := 'free'; END IF;
  
  -- Get current quota
  SELECT * INTO _quota FROM usage_quotas WHERE user_id = _user_id;
  
  -- Create quota if doesn't exist
  IF _quota IS NULL THEN
    INSERT INTO usage_quotas (user_id, images_generated, transcriptions_used, live_captures_used, reset_date)
    VALUES (_user_id, 0, 0, 0, CURRENT_DATE + INTERVAL '30 days')
    RETURNING * INTO _quota;
  END IF;
  
  -- Check if reset needed
  IF _quota.reset_date <= CURRENT_DATE THEN
    UPDATE usage_quotas 
    SET images_generated = 0, transcriptions_used = 0, live_captures_used = 0, 
        reset_date = CURRENT_DATE + INTERVAL '30 days',
        updated_at = NOW()
    WHERE user_id = _user_id
    RETURNING * INTO _quota;
  END IF;
  
  -- Define limits based on role and feature
  CASE _feature
    WHEN 'images' THEN
      _used := _quota.images_generated;
      _limit := CASE _role 
        WHEN 'free' THEN 10 
        WHEN 'pro' THEN 50 
        WHEN 'team' THEN 200 
        WHEN 'admin' THEN 9999 
        ELSE 10 END;
    WHEN 'transcriptions' THEN
      _used := _quota.transcriptions_used;
      _limit := CASE _role 
        WHEN 'free' THEN 2 
        WHEN 'pro' THEN 5 
        WHEN 'team' THEN 20 
        WHEN 'admin' THEN 9999 
        ELSE 2 END;
    WHEN 'live_captures' THEN
      _used := _quota.live_captures_used;
      -- Only Pro and Team can use live captures
      _limit := CASE _role 
        WHEN 'free' THEN 0 
        WHEN 'pro' THEN 5 
        WHEN 'team' THEN 20 
        WHEN 'admin' THEN 9999 
        ELSE 0 END;
    ELSE
      _used := 0;
      _limit := 0;
  END CASE;
  
  _can_use := _used < _limit;
  
  RETURN json_build_object(
    'can_use', _can_use,
    'used', _used,
    'limit', _limit,
    'remaining', GREATEST(0, _limit - _used),
    'role', _role,
    'reset_date', _quota.reset_date
  );
END;
$$;

-- Criar função para incrementar uso de quota
CREATE OR REPLACE FUNCTION public.increment_quota(
  _user_id uuid,
  _feature text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _check_result json;
BEGIN
  -- First check if can use
  _check_result := check_quota(_user_id, _feature);
  
  IF NOT (_check_result->>'can_use')::boolean THEN
    RETURN json_build_object(
      'success', false,
      'error', 'quota_exceeded',
      'message', 'Você atingiu o limite mensal para este recurso'
    );
  END IF;
  
  -- Increment the appropriate counter
  CASE _feature
    WHEN 'images' THEN
      UPDATE usage_quotas SET images_generated = images_generated + 1, updated_at = NOW() WHERE user_id = _user_id;
    WHEN 'transcriptions' THEN
      UPDATE usage_quotas SET transcriptions_used = transcriptions_used + 1, updated_at = NOW() WHERE user_id = _user_id;
    WHEN 'live_captures' THEN
      UPDATE usage_quotas SET live_captures_used = live_captures_used + 1, updated_at = NOW() WHERE user_id = _user_id;
  END CASE;
  
  RETURN json_build_object(
    'success', true,
    'new_usage', check_quota(_user_id, _feature)
  );
END;
$$;

-- Atualizar função de reset mensal
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE usage_quotas 
  SET images_generated = 0, 
      transcriptions_used = 0, 
      live_captures_used = 0,
      reset_date = CURRENT_DATE + INTERVAL '30 days',
      updated_at = NOW()
  WHERE reset_date <= CURRENT_DATE;
END;
$$;