-- Run this once in Supabase Dashboard → SQL Editor.
-- Links orders to customer accounts. Nullable so guest checkout keeps working.

alter table orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id_created_at_idx
  on orders (user_id, created_at desc);
