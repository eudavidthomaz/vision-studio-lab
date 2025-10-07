-- Fase 1: Fundação do Banco de Dados

-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('free', 'pro', 'team', 'admin');

-- Tabela de roles dos usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, role)
);

-- Tabela de assinaturas Stripe
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Tabela de quotas de uso
CREATE TABLE public.usage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weekly_packs_used INTEGER DEFAULT 0 NOT NULL,
  challenges_used INTEGER DEFAULT 0 NOT NULL,
  images_generated INTEGER DEFAULT 0 NOT NULL,
  reset_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;

-- Função para obter role do usuário (security definer para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'team' THEN 2
      WHEN 'pro' THEN 3
      WHEN 'free' THEN 4
    END
  LIMIT 1;
$$;

-- Função para verificar se usuário tem role específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Função para verificar se pode gerar weekly pack
CREATE OR REPLACE FUNCTION public.can_generate_weekly_pack(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role public.app_role;
  quota_used INTEGER;
  quota_reset DATE;
BEGIN
  -- Obter role do usuário
  user_role := public.get_user_role(_user_id);
  
  -- Se for pro, team ou admin, pode gerar ilimitado
  IF user_role IN ('pro', 'team', 'admin') THEN
    RETURN true;
  END IF;
  
  -- Para free, verificar quota
  SELECT weekly_packs_used, reset_date 
  INTO quota_used, quota_reset
  FROM public.usage_quotas
  WHERE user_id = _user_id;
  
  -- Se não existe registro, criar um
  IF NOT FOUND THEN
    INSERT INTO public.usage_quotas (user_id, weekly_packs_used, reset_date)
    VALUES (_user_id, 0, CURRENT_DATE);
    RETURN true;
  END IF;
  
  -- Se a data de reset já passou, resetar contador
  IF quota_reset < CURRENT_DATE THEN
    UPDATE public.usage_quotas
    SET weekly_packs_used = 0, 
        reset_date = CURRENT_DATE + INTERVAL '1 month',
        updated_at = now()
    WHERE user_id = _user_id;
    RETURN true;
  END IF;
  
  -- Free tier: máximo 1 por mês
  RETURN quota_used < 1;
END;
$$;

-- Função para incrementar uso
CREATE OR REPLACE FUNCTION public.increment_usage(
  _user_id UUID,
  _type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir ou atualizar quota
  INSERT INTO public.usage_quotas (user_id, weekly_packs_used, challenges_used, images_generated, reset_date)
  VALUES (
    _user_id,
    CASE WHEN _type = 'weekly_pack' THEN 1 ELSE 0 END,
    CASE WHEN _type = 'challenge' THEN 1 ELSE 0 END,
    CASE WHEN _type = 'image' THEN 1 ELSE 0 END,
    CURRENT_DATE + INTERVAL '1 month'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    weekly_packs_used = CASE 
      WHEN _type = 'weekly_pack' THEN public.usage_quotas.weekly_packs_used + 1 
      ELSE public.usage_quotas.weekly_packs_used 
    END,
    challenges_used = CASE 
      WHEN _type = 'challenge' THEN public.usage_quotas.challenges_used + 1 
      ELSE public.usage_quotas.challenges_used 
    END,
    images_generated = CASE 
      WHEN _type = 'image' THEN public.usage_quotas.images_generated + 1 
      ELSE public.usage_quotas.images_generated 
    END,
    updated_at = now();
END;
$$;

-- RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies para usage_quotas
CREATE POLICY "Users can view their own quotas"
ON public.usage_quotas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quotas"
ON public.usage_quotas FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Atualizar RLS de weekly_packs para verificar quota
DROP POLICY IF EXISTS "Users can insert their own weekly packs" ON public.weekly_packs;
CREATE POLICY "Users can insert their own weekly packs"
ON public.weekly_packs FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND public.can_generate_weekly_pack(auth.uid())
);

-- Trigger para auto-atribuir role "free" no signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free');
  
  INSERT INTO public.usage_quotas (user_id, reset_date)
  VALUES (NEW.id, CURRENT_DATE + INTERVAL '1 month');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();