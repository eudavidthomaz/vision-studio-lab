-- =======================
-- FASE 1: Database & Segurança
-- =======================

-- 1.1 Criar tabela shared_content
CREATE TABLE IF NOT EXISTS public.shared_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('pack', 'challenge', 'planner')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,
  review_token TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  reviewer_comment TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_shared_content_share_token ON public.shared_content(share_token);
CREATE INDEX idx_shared_content_review_token ON public.shared_content(review_token);
CREATE INDEX idx_shared_content_user_id ON public.shared_content(user_id);
CREATE INDEX idx_shared_content_approval_status ON public.shared_content(approval_status);
CREATE INDEX idx_shared_content_expires_at ON public.shared_content(expires_at);

-- 1.2 Criar tabela notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('approval_approved', 'approval_rejected', 'approval_comment', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_content_id UUID,
  related_content_type TEXT CHECK (related_content_type IN ('pack', 'challenge', 'planner')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- 1.3 Função para gerar tokens únicos
CREATE OR REPLACE FUNCTION generate_random_token(length INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 1.4 Trigger: Gerar tokens automaticamente
CREATE OR REPLACE FUNCTION public.generate_share_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Gerar share_token único
  LOOP
    NEW.share_token := generate_random_token(8);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.shared_content WHERE share_token = NEW.share_token);
  END LOOP;
  
  -- Gerar review_token único se requires_approval = true
  IF NEW.requires_approval = true THEN
    LOOP
      NEW.review_token := generate_random_token(8);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.shared_content WHERE review_token = NEW.review_token);
    END LOOP;
  ELSE
    NEW.review_token := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_share_tokens
BEFORE INSERT ON public.shared_content
FOR EACH ROW
EXECUTE FUNCTION public.generate_share_tokens();

-- 1.5 Trigger: Notificar quando status de aprovação muda
CREATE OR REPLACE FUNCTION public.notify_approval_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Validação CRÍTICA: garantir que user_id pertence ao criador do conteúdo
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;
  
  -- Apenas notificar se status mudou de pending para approved/rejected
  IF OLD.approval_status = 'pending' AND NEW.approval_status IN ('approved', 'rejected') THEN
    
    IF NEW.approval_status = 'approved' THEN
      notification_type := 'approval_approved';
      notification_title := '✅ Conteúdo Aprovado!';
      notification_message := 'Seu conteúdo foi aprovado e está pronto para ser compartilhado.';
    ELSIF NEW.approval_status = 'rejected' THEN
      notification_type := 'approval_rejected';
      notification_title := '❌ Conteúdo Reprovado';
      notification_message := CASE 
        WHEN NEW.reviewer_comment IS NOT NULL THEN 'Seu conteúdo foi reprovado. Motivo: ' || NEW.reviewer_comment
        ELSE 'Seu conteúdo foi reprovado.'
      END;
    END IF;
    
    -- Inserir notificação COM VALIDAÇÃO de user_id
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_content_id,
      related_content_type
    ) VALUES (
      NEW.user_id,  -- user_id do criador do compartilhamento
      notification_type,
      notification_title,
      notification_message,
      NEW.content_id,
      NEW.content_type
    );
    
  -- Notificar se apenas comentário foi adicionado (sem mudar status)
  ELSIF NEW.reviewer_comment IS NOT NULL AND (OLD.reviewer_comment IS NULL OR OLD.reviewer_comment != NEW.reviewer_comment) THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_content_id,
      related_content_type
    ) VALUES (
      NEW.user_id,
      'approval_comment',
      '💬 Nova Observação',
      'O revisor adicionou uma observação: ' || NEW.reviewer_comment,
      NEW.content_id,
      NEW.content_type
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_approval_status_change
AFTER UPDATE ON public.shared_content
FOR EACH ROW
WHEN (OLD.approval_status IS DISTINCT FROM NEW.approval_status OR OLD.reviewer_comment IS DISTINCT FROM NEW.reviewer_comment)
EXECUTE FUNCTION public.notify_approval_status_change();

-- 1.6 Trigger: Resetar aprovação quando conteúdo é editado
CREATE OR REPLACE FUNCTION public.reset_approval_on_content_edit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Resetar status de aprovação para 'pending' em compartilhamentos ativos
  UPDATE public.shared_content
  SET 
    approval_status = 'pending',
    reviewed_at = NULL,
    reviewer_comment = NULL,
    updated_at = NOW()
  WHERE 
    content_id = NEW.id
    AND requires_approval = true
    AND approval_status != 'pending'
    AND expires_at > NOW();
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger em weekly_packs
CREATE TRIGGER trigger_reset_approval_weekly_packs
AFTER UPDATE ON public.weekly_packs
FOR EACH ROW
WHEN (OLD.pack IS DISTINCT FROM NEW.pack)
EXECUTE FUNCTION public.reset_approval_on_content_edit();

-- Aplicar trigger em ideon_challenges
CREATE TRIGGER trigger_reset_approval_ideon_challenges
AFTER UPDATE ON public.ideon_challenges
FOR EACH ROW
WHEN (OLD.challenge IS DISTINCT FROM NEW.challenge)
EXECUTE FUNCTION public.reset_approval_on_content_edit();

-- Aplicar trigger em content_planners
CREATE TRIGGER trigger_reset_approval_content_planners
AFTER UPDATE ON public.content_planners
FOR EACH ROW
WHEN (OLD.content IS DISTINCT FROM NEW.content)
EXECUTE FUNCTION public.reset_approval_on_content_edit();

-- 1.7 RLS Policies para shared_content
ALTER TABLE public.shared_content ENABLE ROW LEVEL SECURITY;

-- SELECT: Qualquer pessoa pode visualizar se público e não expirado
CREATE POLICY "Anyone can view public non-expired shares"
ON public.shared_content
FOR SELECT
USING (
  is_public = true 
  AND expires_at > NOW()
);

-- SELECT: Criador pode ver seus próprios compartilhamentos
CREATE POLICY "Users can view their own shares"
ON public.shared_content
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Apenas criador autenticado
CREATE POLICY "Users can create their own shares"
ON public.shared_content
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Criador pode atualizar seus compartilhamentos
CREATE POLICY "Users can update their own shares"
ON public.shared_content
FOR UPDATE
USING (auth.uid() = user_id);

-- UPDATE: Qualquer pessoa pode atualizar aprovação com review_token válido
CREATE POLICY "Anyone can update approval with valid review token"
ON public.shared_content
FOR UPDATE
USING (
  review_token IS NOT NULL 
  AND expires_at > NOW()
)
WITH CHECK (
  review_token IS NOT NULL 
  AND expires_at > NOW()
);

-- DELETE: Apenas criador pode deletar
CREATE POLICY "Users can delete their own shares"
ON public.shared_content
FOR DELETE
USING (auth.uid() = user_id);

-- 1.8 RLS Policies para notifications (ULTRA-SEGURO)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Apenas o dono
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- UPDATE: Apenas o dono (para marcar como lida)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- INSERT: Bloqueado para clientes (apenas triggers podem inserir)
CREATE POLICY "Block client inserts on notifications"
ON public.notifications
FOR INSERT
WITH CHECK (false);

-- DELETE: Bloqueado
CREATE POLICY "Block deletes on notifications"
ON public.notifications
FOR DELETE
USING (false);

-- 1.9 Trigger para updated_at em shared_content
CREATE TRIGGER trigger_update_shared_content_updated_at
BEFORE UPDATE ON public.shared_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();