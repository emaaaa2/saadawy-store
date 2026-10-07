-- Run this once in Supabase Dashboard → SQL Editor.
-- English versions of each product's name, description and usage info.
-- The existing columns keep the original (mostly Arabic) text; the store shows
-- the English version when a shopper switches to English, or the original if it's empty.

alter table public.products
  add column if not exists name_en text,
  add column if not exists description_en text,
  add column if not exists usage_info_en text;
