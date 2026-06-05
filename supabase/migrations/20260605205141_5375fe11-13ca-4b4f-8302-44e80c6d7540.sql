ALTER TABLE public.klap_exports
  ALTER COLUMN watermark DROP DEFAULT,
  ALTER COLUMN watermark DROP NOT NULL;

ALTER TABLE public.klap_exports
  ALTER COLUMN watermark TYPE jsonb USING (CASE WHEN watermark THEN '{}'::jsonb ELSE NULL END);