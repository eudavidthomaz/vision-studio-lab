-- Corrigir search_path nas 2 funções restantes

-- 1. Corrigir generate_random_token
CREATE OR REPLACE FUNCTION public.generate_random_token(length integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 2. Corrigir validate_text_input
CREATE OR REPLACE FUNCTION public.validate_text_input(
  _input text, 
  _min_length integer DEFAULT 1, 
  _max_length integer DEFAULT 10000, 
  _field_name text DEFAULT 'input'::text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check for null
  IF _input IS NULL THEN
    RAISE EXCEPTION 'Validation error: % cannot be null', _field_name;
  END IF;
  
  -- Trim whitespace
  _input := TRIM(_input);
  
  -- Check length
  IF LENGTH(_input) < _min_length THEN
    RAISE EXCEPTION 'Validation error: % must be at least % characters', _field_name, _min_length;
  END IF;
  
  IF LENGTH(_input) > _max_length THEN
    RAISE EXCEPTION 'Validation error: % must be at most % characters', _field_name, _max_length;
  END IF;
  
  RETURN _input;
END;
$function$;