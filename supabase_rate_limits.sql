-- Run this once in Supabase Dashboard → SQL Editor.
-- Counts requests per visitor (IP) and action, so a script can't flood the store with fake orders,
-- reviews or coupon guesses. Used by server/utils/rateLimit.ts.

create table if not exists public.rate_limits (
  key text primary key,          -- e.g. "order:10m:41.33.12.7"
  window_start timestamptz not null default now(),
  count int not null default 0
);

-- No policies: only the server (service role) can read or write it.
alter table public.rate_limits enable row level security;

-- Adds one hit and says whether it's still within `max_hits` for the current window.
-- One atomic statement, so requests arriving together can't slip past the limit.
create or replace function public.hit_rate_limit(hit_key text, max_hits int, window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hits int;
begin
  insert into rate_limits as r (key, window_start, count)
  values (hit_key, now(), 1)
  on conflict (key) do update set
    count = case when r.window_start < now() - make_interval(secs => window_seconds) then 1 else r.count + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => window_seconds) then now() else r.window_start end
  returning count into hits;

  -- Now and then, clear out old visitors so the table stays small.
  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '2 days';
  end if;

  return hits <= max_hits;
end;
$$;

revoke execute on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;
