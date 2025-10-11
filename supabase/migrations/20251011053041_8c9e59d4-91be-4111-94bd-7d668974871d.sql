-- Criar bucket para áudios de sermões
INSERT INTO storage.buckets (id, name, public)
VALUES ('sermons', 'sermons', false);

-- RLS: Permitir upload apenas do próprio usuário
CREATE POLICY "Users can upload own sermons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sermons' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: Permitir leitura apenas do próprio usuário
CREATE POLICY "Users can read own sermons"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'sermons' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: Permitir deleção automática após processamento
CREATE POLICY "System can delete processed sermons"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'sermons');