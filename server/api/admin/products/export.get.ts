import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)

  const allProducts = []
  const pageSize = 1000
  let from = 0
  // The English columns exist once supabase_add_product_translations.sql has been run.
  let columns = 'sku, name, name_en, description, description_en, price, sale_price, category, subcategory, badge, image, stock, brand, usage_info, usage_info_en'

  while (true) {
    let { data, error } = await client
      .from('products')
      .select(columns)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error && /_en/.test(error.message)) {
      columns = 'sku, name, description, price, sale_price, category, subcategory, badge, image, stock, brand, usage_info'
      continue
    }

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    allProducts.push(...data)

    if (data.length < pageSize) break
    from += pageSize
  }

  const csv = Papa.unparse(allProducts)

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="saadawy-products-${Date.now()}.csv"`)

  return csv
})
