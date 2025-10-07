-- Remover restrições de quota para fase de validação

-- Primeiro, dropar a policy antiga que depende da função
DROP POLICY IF EXISTS "Users can insert their own weekly packs" ON public.weekly_packs;

-- Agora dropar as funções de validação de quota
DROP FUNCTION IF EXISTS public.can_generate_weekly_pack(uuid);
DROP FUNCTION IF EXISTS public.increment_usage(uuid, text);

-- Dropar trigger de auto-atribuição de role (nome correto do trigger)
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- Criar nova policy simples para weekly_packs (sem validação de quota)
CREATE POLICY "Users can insert their own weekly packs"
ON public.weekly_packs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);