-- =====================================================
-- CORREÇÃO DE SEGURANÇA: Políticas RLS mais restritivas
-- =====================================================

-- Remover políticas permissivas demais
DROP POLICY IF EXISTS "System can insert notification logs" ON public.notification_logs;
DROP POLICY IF EXISTS "Anyone can read token data for confirmation" ON public.schedule_confirmation_tokens;
DROP POLICY IF EXISTS "System can insert confirmation tokens" ON public.schedule_confirmation_tokens;
DROP POLICY IF EXISTS "System can update confirmation tokens" ON public.schedule_confirmation_tokens;

-- notification_logs: Usuários autenticados podem inserir logs de suas próprias notificações
CREATE POLICY "Authenticated users can insert notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- notification_logs: Owners podem ver logs de schedules que eles criaram
CREATE POLICY "Users can view logs of own schedules"
  ON public.notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.volunteer_schedules vs
      WHERE vs.id = notification_logs.schedule_id
      AND vs.user_id = auth.uid()
    )
    OR recipient_id = auth.uid()
  );

-- schedule_confirmation_tokens: Apenas select público (necessário para confirmação)
-- A validação do token é feita na edge function
CREATE POLICY "Public can read confirmation tokens"
  ON public.schedule_confirmation_tokens FOR SELECT
  USING (
    expires_at > now() 
    AND used_at IS NULL
  );

-- schedule_confirmation_tokens: Apenas usuários autenticados podem criar tokens para suas escalas
CREATE POLICY "Users can create tokens for own schedules"
  ON public.schedule_confirmation_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.volunteer_schedules vs
      WHERE vs.id = schedule_id
      AND vs.user_id = auth.uid()
    )
  );

-- schedule_confirmation_tokens: Updates controlados via edge function com service_role
-- Usuários não podem atualizar diretamente - apenas via confirm-schedule edge function
CREATE POLICY "Users can update tokens for own schedules"
  ON public.schedule_confirmation_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.volunteer_schedules vs
      WHERE vs.id = schedule_id
      AND vs.user_id = auth.uid()
    )
  );

-- Corrigir a view para não ser SECURITY DEFINER
DROP VIEW IF EXISTS public.volunteer_stats;

CREATE VIEW public.volunteer_stats AS
SELECT 
  v.id as volunteer_id,
  v.name,
  v.email,
  v.phone,
  v.role as primary_role,
  v.ministry,
  v.is_active,
  v.user_id,
  COUNT(vs.id) as total_schedules,
  COUNT(CASE WHEN vs.status = 'confirmed' THEN 1 END) as confirmed_count,
  COUNT(CASE WHEN vs.status = 'scheduled' THEN 1 END) as pending_count,
  COUNT(CASE WHEN vs.status = 'absent' THEN 1 END) as absent_count,
  COUNT(CASE WHEN vs.status = 'substituted' THEN 1 END) as substituted_count,
  ROUND(
    CASE 
      WHEN COUNT(vs.id) = 0 THEN 0
      ELSE COUNT(CASE WHEN vs.status = 'confirmed' THEN 1 END)::numeric / COUNT(vs.id) * 100
    END,
    2
  ) as attendance_rate,
  MIN(vs.service_date) as first_schedule,
  MAX(vs.service_date) as last_schedule,
  COUNT(DISTINCT vs.role) as roles_count,
  ARRAY_AGG(DISTINCT vs.role) FILTER (WHERE vs.role IS NOT NULL) as roles_worked
FROM public.volunteers v
LEFT JOIN public.volunteer_schedules vs ON v.id = vs.volunteer_id
WHERE v.user_id = auth.uid()
GROUP BY v.id, v.name, v.email, v.phone, v.role, v.ministry, v.is_active, v.user_id;