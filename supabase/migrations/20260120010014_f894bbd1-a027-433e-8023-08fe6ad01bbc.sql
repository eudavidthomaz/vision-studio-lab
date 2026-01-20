-- =====================================================
-- FASE 3: Sistema de Notificações
-- =====================================================

-- Tabela para log de notificações enviadas
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  schedule_id UUID REFERENCES public.volunteer_schedules(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  recipient_email TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('app', 'email', 'whatsapp')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para notification_logs
CREATE INDEX idx_notification_logs_schedule ON public.notification_logs(schedule_id);
CREATE INDEX idx_notification_logs_recipient ON public.notification_logs(recipient_id);
CREATE INDEX idx_notification_logs_type_status ON public.notification_logs(notification_type, status);
CREATE INDEX idx_notification_logs_created_at ON public.notification_logs(created_at DESC);

-- RLS para notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification logs"
  ON public.notification_logs FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "System can insert notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (true);

-- Tabela para preferências de notificação
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
  schedule_created_app BOOLEAN DEFAULT true,
  schedule_created_email BOOLEAN DEFAULT true,
  reminder_24h_app BOOLEAN DEFAULT true,
  reminder_24h_email BOOLEAN DEFAULT true,
  reminder_2h_app BOOLEAN DEFAULT true,
  reminder_2h_email BOOLEAN DEFAULT false,
  schedule_changed_app BOOLEAN DEFAULT true,
  schedule_changed_email BOOLEAN DEFAULT true,
  confirmation_request_app BOOLEAN DEFAULT true,
  confirmation_request_email BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(volunteer_id)
);

-- Trigger para updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS para notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- FASE 4: Confirmação pelo Voluntário
-- =====================================================

-- Tabela para tokens de confirmação
CREATE TABLE public.schedule_confirmation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.volunteer_schedules(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  action_taken TEXT CHECK (action_taken IN ('confirmed', 'declined', 'substitute_requested')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(schedule_id)
);

-- Índices para tokens
CREATE INDEX idx_confirmation_tokens_token ON public.schedule_confirmation_tokens(token);
CREATE INDEX idx_confirmation_tokens_expires ON public.schedule_confirmation_tokens(expires_at);

-- RLS - permitir leitura pública para validação de token
ALTER TABLE public.schedule_confirmation_tokens ENABLE ROW LEVEL SECURITY;

-- Política para acesso público com token (para página de confirmação)
CREATE POLICY "Anyone can read token data for confirmation"
  ON public.schedule_confirmation_tokens FOR SELECT
  USING (true);

-- Política para sistema inserir tokens
CREATE POLICY "System can insert confirmation tokens"
  ON public.schedule_confirmation_tokens FOR INSERT
  WITH CHECK (true);

-- Política para sistema atualizar tokens
CREATE POLICY "System can update confirmation tokens"
  ON public.schedule_confirmation_tokens FOR UPDATE
  USING (true);

-- =====================================================
-- FASE 5: Histórico e Relatórios
-- =====================================================

-- View para estatísticas de voluntários
CREATE OR REPLACE VIEW public.volunteer_stats AS
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

-- =====================================================
-- FASE 1: Google Calendar OAuth2
-- =====================================================

-- Tabela para armazenar tokens OAuth do Google Calendar
CREATE TABLE public.google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  calendar_id TEXT DEFAULT 'primary',
  email TEXT,
  scopes TEXT[] DEFAULT ARRAY['https://www.googleapis.com/auth/calendar.readonly'],
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(volunteer_id)
);

-- Índices para google_calendar_tokens
CREATE INDEX idx_google_calendar_user ON public.google_calendar_tokens(user_id);
CREATE INDEX idx_google_calendar_volunteer ON public.google_calendar_tokens(volunteer_id);
CREATE INDEX idx_google_calendar_expiry ON public.google_calendar_tokens(token_expiry);

-- Trigger para updated_at
CREATE TRIGGER update_google_calendar_tokens_updated_at
  BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS para google_calendar_tokens
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calendar tokens"
  ON public.google_calendar_tokens FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- Adicionar coluna service_name em volunteer_schedules se não existir
-- =====================================================

-- Adicionar colunas úteis para relatórios
ALTER TABLE public.volunteer_schedules 
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_by TEXT CHECK (confirmed_by IN ('volunteer', 'leader', 'system'));

-- Índice para relatórios por data
CREATE INDEX IF NOT EXISTS idx_schedules_service_date_status 
  ON public.volunteer_schedules(service_date, status);