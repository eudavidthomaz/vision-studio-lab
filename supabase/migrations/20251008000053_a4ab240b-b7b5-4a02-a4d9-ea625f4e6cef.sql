-- Recriar função de auto-atribuição de role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar role 'free' para novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Criar quota inicial
  INSERT INTO public.usage_quotas (user_id, reset_date)
  VALUES (NEW.id, CURRENT_DATE + INTERVAL '1 month')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Atribuir role 'admin' ao primeiro usuário cadastrado
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;

-- Demais usuários recebem role 'free'
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'free'
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Garantir que todos tenham quota inicial
INSERT INTO public.usage_quotas (user_id, reset_date)
SELECT id, CURRENT_DATE + INTERVAL '1 month'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.usage_quotas)
ON CONFLICT (user_id) DO NOTHING;