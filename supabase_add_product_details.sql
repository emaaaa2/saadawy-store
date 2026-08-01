-- Run this once in Supabase Dashboard → SQL Editor.
-- Adds optional "brand" and "usage_info" fields to products.
-- Both are nullable so existing products are unaffected until filled in.

alter table products add column if not exists brand text;
alter table products add column if not exists usage_info text;
