import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

// Columns a file may carry besides the required sku, name, price and stock. A product only
// changes in the columns the file has, so a file with just prices and stock never wipes
// categories, descriptions or sale prices.
const OPTIONAL_TEXT = ['description', 'subcategory', 'badge', 'brand', 'usage_info', 'name_en', 'description_en', 'usage_info_en']

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)

  if (typeof body.csv !== 'string' || !body.csv.trim()) {
    throw adminError(400, 'csvMissing', 'No CSV content provided')
  }

  const parsed = Papa.parse(body.csv, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim() })
  const headers = new Set(parsed.meta.fields ?? [])
  const textColumns = OPTIONAL_TEXT.filter((column) => headers.has(column))

  // What's already saved for the products in the file: kept where the file says nothing.
  const skusInFile: string[] = parsed.data.map((raw: any) => raw?.sku && String(raw.sku).trim()).filter(Boolean)
  const existing = new Map<string, { name: string; slug: string; image: string | null; category: string; sale_price: number | null }>()
  for (let i = 0; i < skusInFile.length; i += 200) {
    const { data, error } = await client.from('products').select('sku, name, slug, image, category, sale_price').in('sku', skusInFile.slice(i, i + 200))
    if (error) throw internalError(error)
    for (const p of data ?? []) existing.set(p.sku, p)
  }

  // `code` lets the dashboard show each reason in its own language (admin.errors.import).
  const errors: { row: number; message: string; code: string; params?: Record<string, unknown> }[] = []
  const rows: Record<string, unknown>[] = []

  parsed.data.forEach((raw: any, index: number) => {
    const rowNumber = index + 2 // +1 for 0-index, +1 for header row

    if (!raw || typeof raw !== 'object') {
      errors.push({ row: rowNumber, message: 'Malformed row', code: 'malformedRow' })
      return
    }

    const sku = String(raw.sku ?? '').trim()
    if (!sku) {
      errors.push({ row: rowNumber, message: 'Missing SKU', code: 'missingSku' })
      return
    }

    const saved = existing.get(sku)
    // A product already on the site keeps its name: names are written in the dashboard and the
    // shop system's short names would overwrite them. The file's name is only used for new products.
    const name = saved?.name ?? String(raw.name ?? '').trim()
    if (!name) {
      errors.push({ row: rowNumber, message: `SKU ${sku}: missing name`, code: 'missingName', params: { sku } })
      return
    }

    const price = Number(raw.price)
    if (!Number.isFinite(price) || price <= 0) {
      errors.push({ row: rowNumber, message: `SKU ${sku}: invalid price`, code: 'invalidPrice', params: { sku } })
      return
    }

    const stock = Number(raw.stock)
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push({ row: rowNumber, message: `SKU ${sku}: invalid stock`, code: 'invalidStock', params: { sku } })
      return
    }

    const row: Record<string, unknown> = {
      sku,
      name,
      price,
      stock,
      // An existing product keeps its link (changing it would break shared links and search results).
      slug: saved?.slug ?? productSlug(sku, name),
      // The database needs a category on every row; an empty cell keeps the current one.
      category: String(raw.category ?? '').trim() || saved?.category || 'uncategorized',
    }

    if (headers.has('sale_price')) {
      const cell = String(raw.sale_price ?? '').trim()
      const sale = cell ? Number(cell) : null
      if (sale !== null && (!Number.isFinite(sale) || sale <= 0 || sale >= price)) {
        errors.push({ row: rowNumber, message: `SKU ${sku}: invalid sale price`, code: 'invalidSalePrice', params: { sku } })
        return
      }
      row.sale_price = sale
    } else if (saved?.sale_price != null && Number(saved.sale_price) >= price) {
      // The new price is at or below the saved sale price, which would make no sense: drop the sale.
      row.sale_price = null
    }

    if (headers.has('image')) {
      // An empty image cell keeps the current photo.
      row.image = String(raw.image ?? '').trim() || saved?.image || null
    }

    for (const column of textColumns) row[column] = String(raw[column] ?? '').trim() || null

    rows.push(row)
  })

  // Rows are sent in groups that share the same columns, so no row gets a column it didn't ask for.
  const groups = new Map<string, Record<string, unknown>[]>()
  for (const row of rows) {
    const key = Object.keys(row).sort().join(',')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }

  let upserted = 0
  for (const group of groups.values()) {
    for (let i = 0; i < group.length; i += 500) {
      const batch = group.slice(i, i + 500)
      const { error } = await client.from('products').upsert(batch, { onConflict: 'sku' })
      if (error) {
        console.error('Import batch failed:', error)
        errors.push({ row: 0, message: `${batch.length} products couldn't be saved (${batch[0].sku} …)`, code: 'batchFailed', params: { count: batch.length, sku: batch[0].sku } })
        continue
      }
      upserted += batch.length
    }
  }

  const added = rows.filter((r) => !existing.has(r.sku as string)).length
  await logActivity(event, access.email, 'products.import', null, {
    rows: parsed.data.length, saved: upserted, added, skipped: errors.length, columns: [...headers],
  })

  return {
    totalRows: parsed.data.length,
    upserted,
    added,
    errors
  }
})
