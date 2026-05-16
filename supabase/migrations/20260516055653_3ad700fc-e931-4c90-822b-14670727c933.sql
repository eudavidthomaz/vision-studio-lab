
-- 1. Add manual_override flag to user_roles to track admin-granted access
ALTER TABLE public.user_roles 
  ADD COLUMN IF NOT EXISTS manual_override BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS override_reason TEXT,
  ADD COLUMN IF NOT EXISTS override_granted_by UUID,
  ADD COLUMN IF NOT EXISTS override_granted_at TIMESTAMPTZ;

-- 2. Function to validate premium role has valid subscription or manual override
CREATE OR REPLACE FUNCTION public.validate_premium_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _has_valid_sub BOOLEAN;
BEGIN
  -- Admin and free never need validation
  IF NEW.role NOT IN ('pro','team') THEN
    RETURN NEW;
  END IF;
  
  -- Manual override bypasses sub check
  IF NEW.manual_override = true THEN
    RETURN NEW;
  END IF;
  
  -- Check for valid subscription (active or trialing)
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = NEW.user_id
      AND status IN ('active','trialing')
  ) INTO _has_valid_sub;
  
  IF NOT _has_valid_sub THEN
    RAISE EXCEPTION 'Cannot assign role % to user %: no active/trialing subscription and manual_override=false', NEW.role, NEW.user_id
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_premium_role ON public.user_roles;
CREATE TRIGGER trg_validate_premium_role
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_premium_role();

-- 3. Atomic role-degradation helper (used by webhook + reconciler)
CREATE OR REPLACE FUNCTION public.degrade_user_to_free(_user_id UUID, _reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Skip if admin or manual override
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = 'admin' OR manual_override = true)
  ) THEN
    RETURN;
  END IF;
  
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'free');
  
  INSERT INTO public.security_audit_log (user_id, event_type, success, metadata)
  VALUES (_user_id, 'role_degraded_to_free', true, jsonb_build_object('reason', _reason));
END;
$$;

-- 4. Atomic role-promotion helper
CREATE OR REPLACE FUNCTION public.promote_user_role(_user_id UUID, _role app_role, _reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF _role NOT IN ('pro','team') THEN
    RAISE EXCEPTION 'promote_user_role only supports pro/team, got %', _role;
  END IF;
  
  -- Don't touch admin
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    RETURN;
  END IF;
  
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
  
  INSERT INTO public.security_audit_log (user_id, event_type, success, metadata)
  VALUES (_user_id, 'role_promoted', true, jsonb_build_object('role', _role, 'reason', _reason));
END;
$$;
