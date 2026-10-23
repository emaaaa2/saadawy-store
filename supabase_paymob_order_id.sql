-- Run this once in Supabase Dashboard → SQL Editor.
-- Links each card order to the Paymob order created for it. The payment webhook only accepts a
-- payment whose Paymob order matches, so a real payment for one order can't be replayed to mark
-- another order as paid. Set by server/api/checkout/create-payment.post.ts.
alter table public.orders add column if not exists paymob_order_id text;
