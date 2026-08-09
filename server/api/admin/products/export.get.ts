import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const client = serverSupabaseServiceRole(event)

  const allProducts = []
  const pageSize = 1000
  let from = 0

  while (true) {
    const { data, error } = await client
      .from('products')
      .select('sku, name, description, price, sale_price, category, badge, image, stock, brand, usage_info')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

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
