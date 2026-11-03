-- Run this once in Supabase Dashboard → SQL Editor.
-- A record of what every admin changes in the dashboard: who, when, and what it was before.
-- Deleted products are kept in full here, so they can be restored from the activity page.
-- Used by server/utils/activityLog.ts.

create table if not exists public.admin_activity (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  admin_email text not null,
  action text not null,     -- e.g. product.update, product.delete, order.status, coupon.update
  target text,              -- product SKU, order number, coupon code, email …
  details jsonb             -- what changed ({ column: [before, after] }) or the deleted row
);

create index if not exists admin_activity_created_at_idx on public.admin_activity (created_at desc);

-- No policies: only the server (service role) can read or write it.
alter table public.admin_activity enable row level security;
