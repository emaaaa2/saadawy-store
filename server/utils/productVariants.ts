import type { serverSupabaseServiceRole } from '#supabase/server'

type Client = ReturnType<typeof serverSupabaseServiceRole>

// Colours / shades under one product code (supabase_add_product_variants.sql). Each has its own
// stock; the product's `stock` is their total and `has_variants` is true while it has any.
export const VARIANT_FIELDS = 'id, product_id, name, name_en, color, image, stock, position'

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  name_en: string | null
  color: string | null
  image: string | null
  stock: number
  position: number
}

/** The colours of these products, in their order, by product id. Empty if the table doesn't exist yet. */
export async function getVariants(client: Client, productIds: string[]) {
  const byProduct: Record<string, ProductVariant[]> = {}
  const ids = [...new Set(productIds.filter(Boolean))]
  if (!ids.length) return byProduct

  const { data, error } = await client
    .from('product_variants')
    .select(VARIANT_FIELDS)
    .in('product_id', ids)
    .order('position')
    .order('created_at')
  if (error) return byProduct // supabase_add_product_variants.sql not run yet: no colours anywhere

  for (const variant of (data ?? []) as ProductVariant[]) (byProduct[variant.product_id] ??= []).push(variant)
  return byProduct
}
