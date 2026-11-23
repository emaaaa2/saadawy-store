import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

// Every colour's stock as a CSV for Excel: the admin changes the "stock" column and uploads it
// again (colour-stock.post.ts). Starts with a BOM so Excel shows the Arabic names correctly.
export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')
  const colours = await getAllColours(serverSupabaseServiceRole(event))

  const csv = Papa.unparse({
    fields: COLOUR_STOCK_COLUMNS,
    data: colours.map((c) => [c.id, c.products?.sku ?? '', c.products?.name ?? '', c.name, c.stock, c.stock]),
  })

  const day = new Date().toISOString().slice(0, 10)
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="saadawy-colour-stock-${day}.csv"`)
  return `${String.fromCharCode(0xfeff)}${csv}`
})
