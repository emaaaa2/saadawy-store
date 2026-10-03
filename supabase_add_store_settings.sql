-- Run this once in Supabase Dashboard → SQL Editor.
-- Store-wide settings the admin edits from Dashboard → Store settings
-- (WhatsApp numbers, payment details, social links, welcome popup). Single row (id = 1).

create table if not exists store_settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into store_settings (id) values (1)
on conflict (id) do nothing;

-- Only the server (service role) reads or writes this table.
alter table store_settings enable row level security;
