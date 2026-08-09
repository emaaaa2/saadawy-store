-- Run this once in Supabase Dashboard → SQL Editor.
-- Table to actually store newsletter signups from the footer form.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
