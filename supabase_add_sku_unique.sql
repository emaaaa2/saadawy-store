-- Run this once in Supabase Dashboard → SQL Editor.
-- Required for bulk CSV import: lets us "upsert" many products in one request,
-- matching existing products by SKU instead of updating them one by one.

alter table products add constraint products_sku_unique unique (sku);
