-- Run this once in Supabase Dashboard → SQL Editor.
-- Adds an optional "subcategory" field to products, used to break down
-- broad categories (like "accessories") into a dropdown of sub-types.
-- Nullable so existing products are unaffected until filled in.

alter table products add column if not exists subcategory text;
