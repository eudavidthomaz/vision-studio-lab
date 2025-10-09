-- ETAPA 1: Limpar duplicatas mantendo apenas a primeira inserção de cada minuto
DELETE FROM generated_contents
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, DATE_TRUNC('minute', created_at), source_type)
    id
  FROM generated_contents
  ORDER BY user_id, DATE_TRUNC('minute', created_at), source_type, created_at ASC
);

-- ETAPA 2: Criar função para prevenir inserções em massa
CREATE OR REPLACE FUNCTION prevent_mass_insert()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- ETAPA 3: Criar trigger para monitoramento
CREATE TRIGGER check_mass_insert
BEFORE INSERT ON generated_contents
FOR EACH ROW
EXECUTE FUNCTION prevent_mass_insert();