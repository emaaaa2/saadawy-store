-- Run this once in Supabase Dashboard → SQL Editor.
-- Stores the editable shipping fees so the admin can change them
-- without a code change. Single row (id = 1).

create table if not exists shipping_settings (
  id int primary key default 1,
  tier1_fee numeric not null default 50,
  tier2_fee numeric not null default 70,
  tier3_fee numeric not null default 100,
  free_shipping_threshold numeric not null default 500,
  constraint single_row check (id = 1)
);

insert into shipping_settings (id, tier1_fee, tier2_fee, tier3_fee, free_shipping_threshold)
values (1, 50, 70, 100, 500)
on conflict (id) do nothing;

alter table shipping_settings enable row level security;
