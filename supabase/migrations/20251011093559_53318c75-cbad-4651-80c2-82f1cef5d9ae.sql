-- Add summary column to sermons table for caching AI-generated summaries
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS summary TEXT;