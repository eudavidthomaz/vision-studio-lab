-- Add section_titles column to church_sites table
ALTER TABLE public.church_sites 
ADD COLUMN IF NOT EXISTS section_titles jsonb DEFAULT '{
  "firstTime": {"title": "É sua primeira vez por aqui?", "subtitle": "Queremos tornar sua visita leve, simples e acolhedora."},
  "about": {"title": "Quem somos", "subtitle": "Somos uma igreja comprometida com o evangelho de Jesus."},
  "ministries": {"title": "Há um lugar para você aqui", "subtitle": "A vida da igreja acontece de muitas formas."},
  "media": {"title": "Assista e conheça mais", "subtitle": "Acompanhe nossas mensagens e cultos."},
  "events": {"title": "Próximos encontros", "subtitle": "Fique por dentro dos próximos cultos e eventos."},
  "prayer": {"title": "Podemos orar por você?", "subtitle": "Envie seu pedido de oração."},
  "contact": {"title": "Fale com a gente", "subtitle": "Estamos aqui para ajudar você."},
  "giving": {"title": "Dízimos e ofertas", "subtitle": "Sua generosidade coopera com a missão."}
}'::jsonb;

-- Update hero column default to include welcomeLabel
ALTER TABLE public.church_sites 
ALTER COLUMN hero SET DEFAULT '{
  "welcomeLabel": "Bem-vindo",
  "title": "Bem-vindo à nossa Igreja",
  "subtitle": "Um lugar de fé, amor e comunhão",
  "coverImageUrl": null,
  "showVisitButton": true,
  "showMapButton": true,
  "showYoutubeButton": true,
  "showWhatsappButton": true
}'::jsonb;

-- Update existing rows to have welcomeLabel if missing
UPDATE public.church_sites 
SET hero = hero || '{"welcomeLabel": "Bem-vindo"}'::jsonb
WHERE hero->>'welcomeLabel' IS NULL;