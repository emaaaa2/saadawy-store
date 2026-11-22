-- Run this once in Supabase Dashboard → SQL Editor (safe to run again).
-- Colours / shades under one product code: each one has its own stock, and the product's
-- `stock` becomes their total, kept up to date by the database itself.

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,                 -- shown to customers, e.g. "أحمر 05"
  name_en text,                       -- English name (optional; falls back to `name`)
  color text,                         -- optional swatch colour, e.g. "#c0392b"
  image text,                         -- optional photo (one of the product's photos)
  stock integer not null default 0 check (stock >= 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_idx on product_variants (product_id, position);

-- Only the server (service role) reads and writes colours, like the other store tables.
alter table product_variants enable row level security;

alter table products add column if not exists has_variants boolean not null default false;

-- products.stock = total of the product's colours. Done with differences (not by re-adding
-- everything), so two orders taking different colours at the same moment can't miscount.
-- The first colour added replaces the stock the product had before.
create or replace function sync_variant_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update products
    set stock = case when has_variants then stock + new.stock else new.stock end,
        has_variants = true
    where id = new.product_id;
  elsif tg_op = 'UPDATE' then
    if new.stock <> old.stock then
      update products set stock = stock + (new.stock - old.stock) where id = new.product_id;
    end if;
  elsif tg_op = 'DELETE' then
    update products p
    set stock = case when exists (select 1 from product_variants v where v.product_id = old.product_id)
                     then greatest(p.stock - old.stock, 0) else 0 end,
        has_variants = exists (select 1 from product_variants v where v.product_id = old.product_id)
    where p.id = old.product_id;
  end if;
  return null;
end;
$$;

drop trigger if exists product_variants_sync_stock on product_variants;
create trigger product_variants_sync_stock
  after insert or update of stock or delete on product_variants
  for each row execute function sync_variant_stock();

-- Taking / returning stock of one colour (orders, cancellations), race-safe like decrement_stock.
create or replace function decrement_variant_stock(variant_id uuid, qty int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_rows int;
begin
  update product_variants set stock = stock - qty where id = variant_id and stock >= qty;
  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$;

create or replace function increment_variant_stock(variant_id uuid, qty int)
returns void
language sql
security definer
set search_path = public
as $$
  update product_variants set stock = stock + qty where id = variant_id;
$$;

-- A product with colours only changes stock through its colours, so its total stays right.
create or replace function decrement_stock(product_id uuid, qty int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_rows int;
begin
  update products
  set stock = stock - qty
  where id = product_id and stock >= qty and not has_variants;

  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$;

create or replace function increment_stock(product_id uuid, qty int)
returns void
language sql
security definer
set search_path = public
as $$
  update products set stock = stock + qty where id = product_id and not has_variants;
$$;

-- Only the server may call these (same as the other stock functions after supabase_lock_down_public_access.sql).
revoke execute on function decrement_variant_stock(uuid, int) from public, anon, authenticated;
revoke execute on function increment_variant_stock(uuid, int) from public, anon, authenticated;
grant execute on function decrement_variant_stock(uuid, int) to service_role;
grant execute on function increment_variant_stock(uuid, int) to service_role;
revoke execute on function sync_variant_stock() from public, anon, authenticated;
