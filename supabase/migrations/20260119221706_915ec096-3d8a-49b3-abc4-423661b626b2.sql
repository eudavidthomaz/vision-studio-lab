-- =====================================================
-- SISTEMA DE ESCALA DE VOLUNTÁRIOS - MODELAGEM COMPLETA
-- =====================================================

-- Tabela de voluntários
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'geral',
  ministry TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentários para documentação
COMMENT ON TABLE public.volunteers IS 'Cadastro de voluntários por usuário/igreja';
COMMENT ON COLUMN public.volunteers.role IS 'Função principal: camera, som, projecao, fotografia, midia_social, recepcao, louvor, geral';
COMMENT ON COLUMN public.volunteers.ministry IS 'Ministério ao qual pertence (opcional)';

-- Índices para performance
CREATE INDEX idx_volunteers_user_id ON public.volunteers(user_id);
CREATE INDEX idx_volunteers_role ON public.volunteers(role);
CREATE INDEX idx_volunteers_active ON public.volunteers(user_id, is_active);

-- Trigger para updated_at
CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON public.volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela de escalas de voluntários
-- =====================================================

CREATE TABLE public.volunteer_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_name TEXT DEFAULT 'Culto',
  start_time TIME,
  end_time TIME,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraint para status válidos
  CONSTRAINT valid_schedule_status CHECK (status IN ('scheduled', 'confirmed', 'absent', 'substituted'))
);

-- Comentários para documentação
COMMENT ON TABLE public.volunteer_schedules IS 'Escalas de serviço dos voluntários';
COMMENT ON COLUMN public.volunteer_schedules.status IS 'scheduled=agendado, confirmed=confirmado, absent=ausente, substituted=substituído';
COMMENT ON COLUMN public.volunteer_schedules.service_name IS 'Nome do culto/evento (ex: Culto Domingo Manhã)';

-- Índices para consultas rápidas
CREATE INDEX idx_schedules_user_date ON public.volunteer_schedules(user_id, service_date);
CREATE INDEX idx_schedules_volunteer ON public.volunteer_schedules(volunteer_id);
CREATE INDEX idx_schedules_date ON public.volunteer_schedules(service_date);
CREATE INDEX idx_schedules_status ON public.volunteer_schedules(user_id, status);

-- Trigger para updated_at
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.volunteer_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY - Volunteers
-- =====================================================

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own volunteers"
  ON public.volunteers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own volunteers"
  ON public.volunteers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own volunteers"
  ON public.volunteers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own volunteers"
  ON public.volunteers FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- ROW LEVEL SECURITY - Volunteer Schedules
-- =====================================================

ALTER TABLE public.volunteer_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules"
  ON public.volunteer_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules"
  ON public.volunteer_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
  ON public.volunteer_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON public.volunteer_schedules FOR DELETE
  USING (auth.uid() = user_id);