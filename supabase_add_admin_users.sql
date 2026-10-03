-- Run this once in Supabase Dashboard → SQL Editor.
-- Admins added from the dashboard. The store owner stays in the ADMIN_EMAILS
-- environment variable so they can never be removed or locked out from here.

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  permissions text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Only the server (service role) reads or writes this table.
alter table admin_users enable row level security;
