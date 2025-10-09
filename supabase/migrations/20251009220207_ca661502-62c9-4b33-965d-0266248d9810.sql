-- Corrigir função prevent_mass_insert para incluir search_path
CREATE OR REPLACE FUNCTION prevent_mass_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Contar inserções do mesmo usuário nos últimos 10 segundos
  SELECT COUNT(*) INTO recent_count
  FROM generated_contents
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '10 seconds';
  
  -- Se mais de 5 inserções, bloquear
  IF recent_count > 5 THEN
    RAISE EXCEPTION 'Possível duplicação detectada. Aguarde alguns segundos.';
  END IF;
  
  RETURN NEW;
END;
$$;