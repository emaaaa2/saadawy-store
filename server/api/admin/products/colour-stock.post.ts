import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

// Uploads the colour stock sheet (colour-stock.get.ts) after it was edited in Excel. Each row's
// colour is found by color_id (or by code + colour name); only its stock changes, and the
// product's total follows (database trigger). A colour whose stock changed on the site since the
// sheet was downloaded (an order) is left as it is and reported, so a sale isn't undone.
export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'products')
  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)

  if (typeof body?.csv !== 'string' || !body.csv.trim()) {
    throw adminError(400, 'csvMissing', 'No CSV content provided')
  }

  const parsed = Papa.parse(body.csv, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.replace(String.fromCharCode(0xfeff), '').trim() })
  const colours = await getAllColours(client)
  const byId = new Map(colours.map((c) => [c.id, c]))
  const byCodeAndName = new Map(colours.map((c) => [`${c.products?.sku ?? ''}|${c.name.trim().toLowerCase()}`, c]))

  const errors: { row: number; message: string; code: string; params?: Record<string, unknown> }[] = []
  const conflicts: { sku: string; product: string; color: string; base: number | null; now: number; wanted: number }[] = []
  let updated = 0
  let unchanged = 0

  for (const [index, raw] of (parsed.data as Record<string, unknown>[]).entries()) {
    const rowNumber = index + 2 // +1 for 0-index, +1 for the header row
    const sku = String(raw?.sku ?? '').trim()
    const color = String(raw?.color ?? '').trim()
    const colour = byId.get(String(raw?.color_id ?? '').trim()) ?? byCodeAndName.get(`${sku}|${color.toLowerCase()}`)
    if (!colour) {
      errors.push({ row: rowNumber, message: `${sku} ${color}: colour not found`, code: 'colourNotFound', params: { sku, color } })
      continue
    }

    const cell = String(raw?.stock ?? '').trim()
    const stock = Number(cell)
    if (cell === '' || !Number.isInteger(stock) || stock < 0) {
      errors.push({ row: rowNumber, message: `SKU ${sku}: invalid stock`, code: 'invalidStock', params: { sku: colour.products?.sku ?? sku } })
      continue
    }
    if (stock === colour.stock) {
      unchanged++
      continue
    }

    const baseCell = String(raw?.stock_when_downloaded ?? '').trim()
    const base = baseCell !== '' && Number.isInteger(Number(baseCell)) ? Number(baseCell) : null
    const report = { sku: colour.products?.sku ?? '', product: colour.products?.name ?? '', color: colour.name, base, now: colour.stock, wanted: stock }
    if (base !== null && base !== colour.stock) {
      conflicts.push(report) // changed on the site since the download
      continue
    }

    const { data, error } = await client.from('product_variants').update({ stock }).eq('id', colour.id).eq('stock', colour.stock).select('id')
    if (error) throw internalError(error)
    if (!data?.length) {
      conflicts.push(report) // an order took some just now
      continue
    }
    colour.stock = stock
    updated++
  }

  await logActivity(event, access.email, 'products.colourStock', null, {
    rows: parsed.data.length, updated, conflicts: conflicts.length, skipped: errors.length,
  })
  return { totalRows: parsed.data.length, updated, unchanged, conflicts, errors }
})
