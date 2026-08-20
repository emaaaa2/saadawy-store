alter table orders
  add column if not exists coupon_code text,
  add column if not exists discount numeric not null default 0;
