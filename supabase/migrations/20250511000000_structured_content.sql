-- Adds multimodal structured columns to content_library
alter table content_library
  add column if not exists modalidades jsonb,
  add column if not exists formats text[] default '{}'::text[],
  add column if not exists is_structured boolean default false;

create index if not exists content_library_is_structured_idx
  on content_library (is_structured);

create index if not exists content_library_formats_idx
  on content_library using gin (formats);
