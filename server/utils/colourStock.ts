import type { serverSupabaseServiceRole } from '#supabase/server'

type Client = ReturnType<typeof serverSupabaseServiceRole>

export interface ColourStockRow { id: string; name: string; stock: number; position: number; products: { sku: string | null; name: string } | null }

/** Every colour with its product's code and name, in code then colour order. */
export async function getAllColours(client: Client) {
  const all: ColourStockRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client
      .from('product_variants')
      .select('id, name, stock, position, products(sku, name)')
      .order('product_id')
      .order('position')
      .range(from, from + 999)
    if (error) throw adminError(500, 'variantsSql', 'Run supabase_add_product_variants.sql in Supabase first')
    all.push(...((data ?? []) as unknown as ColourStockRow[]))
    if ((data ?? []).length < 1000) break
  }
  return all.sort((a, b) =>
    String(a.products?.sku ?? '').localeCompare(String(b.products?.sku ?? ''), 'en', { numeric: true }) || a.position - b.position)
}

// The sheet's columns. Only \`stock\` is meant to be edited; \`color_id\` finds the colour again and
// \`stock_when_downloaded\` shows whether an order changed it since the sheet was downloaded.
export const COLOUR_STOCK_COLUMNS = ['color_id', 'sku', 'product', 'color', 'stock_when_downloaded', 'stock']
