alter table reviews
  add column if not exists product_id uuid references products(id) on delete cascade;

create index if not exists reviews_product_id_idx
  on reviews (product_id, approved, created_at desc);
