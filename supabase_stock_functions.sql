-- Run this once in Supabase Dashboard → SQL Editor.
-- Adds atomic, race-safe stock decrement/increment for order placement.
-- SECURITY DEFINER: lets the public storefront trigger this one narrow,
-- controlled stock update despite RLS blocking direct writes to `products`.

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
  where id = product_id and stock >= qty;

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
  update products set stock = stock + qty where id = product_id;
$$;
