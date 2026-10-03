-- Run this once in Supabase Dashboard → SQL Editor.
-- The site reads/writes orders and newsletter subscribers only through the
-- server (service role, which bypasses RLS), so the public browser key needs
-- no access to them at all.

alter table orders enable row level security;
alter table newsletter_subscribers enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('orders', 'newsletter_subscribers')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- Stock functions are called only by the server. Without this, anyone could
-- call them directly and set every product to out of stock.
revoke execute on function decrement_stock(uuid, int) from public, anon, authenticated;
revoke execute on function increment_stock(uuid, int) from public, anon, authenticated;
grant execute on function decrement_stock(uuid, int) to service_role;
grant execute on function increment_stock(uuid, int) to service_role;
