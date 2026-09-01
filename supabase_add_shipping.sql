-- Run this once in Supabase Dashboard → SQL Editor.
-- Adds shipping fields to orders. Both nullable/defaulted so existing
-- orders are unaffected.

alter table orders add column if not exists governorate text;
alter table orders add column if not exists shipping_fee numeric not null default 0;
