-- Permitir acesso público a content_planners via token de compartilhamento válido
CREATE POLICY "Public access via valid share token"
ON public.content_planners
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_content
    WHERE shared_content.content_id = content_planners.id
      AND shared_content.content_type = 'planner'
      AND shared_content.is_public = true
      AND shared_content.expires_at > now()
  )
);

-- Permitir acesso público a weekly_packs via token de compartilhamento válido
CREATE POLICY "Public access via valid share token"
ON public.weekly_packs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_content
    WHERE shared_content.content_id = weekly_packs.id
      AND shared_content.content_type = 'pack'
      AND shared_content.is_public = true
      AND shared_content.expires_at > now()
  )
);

-- Permitir acesso público a ideon_challenges via token de compartilhamento válido
CREATE POLICY "Public access via valid share token"
ON public.ideon_challenges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_content
    WHERE shared_content.content_id = ideon_challenges.id
      AND shared_content.content_type = 'challenge'
      AND shared_content.is_public = true
      AND shared_content.expires_at > now()
  )
);

-- Criar índice para otimizar performance de lookup de compartilhamentos
CREATE INDEX IF NOT EXISTS idx_shared_content_lookup 
ON public.shared_content(content_id, content_type, is_public, expires_at);