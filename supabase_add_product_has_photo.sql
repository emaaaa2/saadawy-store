-- Run this once in Supabase Dashboard → SQL Editor.
-- Marks products whose main photo file really exists in Storage, so the store
-- can list them before products that are still waiting for a photo.
-- It keeps itself up to date: saving a product's image re-checks it, and
-- uploading or deleting a file in the product-images bucket updates it too.

alter table public.products
  add column if not exists has_photo boolean not null default false;

-- ".../storage/v1/object/public/product-images/4133.webp" -> "4133.webp"
create or replace function public.product_image_object_name(url text)
returns text
language sql
immutable
as $$
  select substring(url from '/product-images/([^?#]+)')
$$;

-- One-time fill for existing products.
update public.products p
set has_photo = exists (
  select 1 from storage.objects o
  where o.bucket_id = 'product-images'
    and o.name = public.product_image_object_name(p.image)
);

-- Re-check whenever a product is added or its main image changes.
create or replace function public.products_set_has_photo()
returns trigger
language plpgsql
security definer
set search_path = public, storage
as $$
begin
  new.has_photo := exists (
    select 1 from storage.objects o
    where o.bucket_id = 'product-images'
      and o.name = public.product_image_object_name(new.image)
  );
  return new;
exception when others then
  return new; -- never block saving a product because of this check
end;
$$;

drop trigger if exists products_set_has_photo on public.products;
create trigger products_set_has_photo
  before insert or update of image on public.products
  for each row execute function public.products_set_has_photo();

-- Update products when a photo file is uploaded or deleted in Storage.
create or replace function public.storage_sync_product_has_photo()
returns trigger
language plpgsql
security definer
set search_path = public, storage
as $$
begin
  if tg_op = 'INSERT' and new.bucket_id = 'product-images' then
    update public.products set has_photo = true
    where not has_photo and public.product_image_object_name(image) = new.name;
  elsif tg_op = 'DELETE' and old.bucket_id = 'product-images' then
    update public.products set has_photo = false
    where has_photo and public.product_image_object_name(image) = old.name;
  end if;
  return null;
exception when others then
  return null; -- never block an upload because of this
end;
$$;

do $$
begin
  execute 'drop trigger if exists storage_sync_product_has_photo on storage.objects';
  execute 'create trigger storage_sync_product_has_photo
    after insert or delete on storage.objects
    for each row execute function public.storage_sync_product_has_photo()';
exception when insufficient_privilege then
  raise notice 'Storage trigger skipped (no permission). Photos uploaded from the dashboard still update automatically; after bulk uploads, run this file again.';
end;
$$;

create index if not exists products_has_photo_created_at_idx
  on public.products (has_photo desc, created_at desc);
