-- Run this once in Supabase Dashboard → SQL Editor.
-- Two orders can never share an order number: tracking and the Paymob webhook look orders up by it.
-- (orders.post.ts picks another random number if this ever rejects one.)
create unique index if not exists orders_order_number_key on public.orders (order_number);

-- Speeds up finding card orders left unpaid (server/utils/unpaidOrders.ts).
create index if not exists orders_status_created_at_idx on public.orders (status, created_at);
