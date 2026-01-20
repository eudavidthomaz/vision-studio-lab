-- =====================================================
-- CORREÇÃO FINAL: View sem SECURITY DEFINER e política mais restritiva
-- =====================================================

-- Dropar e recriar a view corretamente com security_invoker = true
DROP VIEW IF EXISTS public.volunteer_stats;

CREATE VIEW public.volunteer_stats 
WITH (security_invoker = true) AS
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
GROUP BY v.id, v.name, v.email, v.phone, v.role, v.ministry, v.is_active, v.user_id;

-- Corrigir política de INSERT em notification_logs para ser mais específica
DROP POLICY IF EXISTS "Authenticated users can insert notification logs" ON public.notification_logs;

CREATE POLICY "Users can insert logs for own schedules"
  ON public.notification_logs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      schedule_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.volunteer_schedules vs
        WHERE vs.id = schedule_id
        AND vs.user_id = auth.uid()
      )
    )
  );