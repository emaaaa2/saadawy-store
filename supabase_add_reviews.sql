create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  location text,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_approved_created_at_idx
  on reviews (approved, created_at desc);

alter table reviews enable row level security;
