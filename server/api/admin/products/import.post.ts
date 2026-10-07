import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

function toSlug(sku: string, name: string) {
  const namePart = name
    .toLowerCase()
    .trim()
    .replace(/[/?#%"'\\]/g, '')
    .replace(/\s+/g, '-')
  return `${sku}-${namePart}`
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)

  if (typeof body.csv !== 'string' || !body.csv.trim()) {
    throw adminError(400, 'csvMissing', 'No CSV content provided')
  }

  const parsed = Papa.parse(body.csv, { header: true, skipEmptyLines: true })

  const skusInFile: string[] = parsed.data
    .map((raw: any) => raw?.sku && String(raw.sku).trim())
    .filter(Boolean)

  const existingImages = new Map<string, string>()
  const chunkSize = 200
  for (let i = 0; i < skusInFile.length; i += chunkSize) {
    const chunk = skusInFile.slice(i, i + chunkSize)
    const { data } = await client.from('products').select('sku, image').in('sku', chunk)
    for (const p of data ?? []) {
      if (p.image) existingImages.set(p.sku, p.image)
    }
  }

  // `code` lets the dashboard show each reason in its own language (admin.errors.import).
  const errors: { row: number; message: string; code: string; params?: Record<string, unknown> }[] = []
  const rows = []
  // Only touch the English columns when the file has them, so older files don't erase them.
  const headers = parsed.meta.fields ?? []
  const englishColumns = ['name_en', 'description_en', 'usage_info_en'].filter((column) => headers.includes(column))

  parsed.data.forEach((raw: any, index: number) => {
    const rowNumber = index + 2 // +1 for 0-index, +1 for header row

    if (!raw || typeof raw !== 'object') {
      errors.push({ row: rowNumber, message: 'Malformed row', code: 'malformedRow' })
      return
    }

    if (!raw.sku || !String(raw.sku).trim()) {
      errors.push({ row: rowNumber, message: 'Missing SKU', code: 'missingSku' })
      return
    }

    if (!raw.name || !String(raw.name).trim()) {
      errors.push({ row: rowNumber, message: `SKU ${raw.sku}: missing name`, code: 'missingName', params: { sku: raw.sku } })
      return
    }

    const name = String(raw.name).trim()

    const price = Number(raw.price)
    if (!Number.isFinite(price) || price <= 0) {
      errors.push({ row: rowNumber, message: `SKU ${raw.sku}: invalid price`, code: 'invalidPrice', params: { sku: raw.sku } })
      return
    }

    const stock = Number(raw.stock)
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push({ row: rowNumber, message: `SKU ${raw.sku}: invalid stock`, code: 'invalidStock', params: { sku: raw.sku } })
      return
    }

    const salePrice = raw.sale_price !== undefined && raw.sale_price !== '' ? Number(raw.sale_price) : null
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0)) {
      errors.push({ row: rowNumber, message: `SKU ${raw.sku}: invalid sale price`, code: 'invalidSalePrice', params: { sku: raw.sku } })
      return
    }

    rows.push({
      sku: String(raw.sku).trim(),
      name,
      slug: toSlug(String(raw.sku).trim(), name),
      description: raw.description || null,
      price,
      sale_price: salePrice,
      category: raw.category || 'uncategorized',
      subcategory: raw.subcategory || null,
      badge: raw.badge || null,
      image: raw.image || existingImages.get(String(raw.sku).trim()) || null,
      stock,
      brand: raw.brand || null,
      usage_info: raw.usage_info || null,
      ...Object.fromEntries(englishColumns.map((column) => [column, String(raw[column] ?? '').trim() || null]))
    })
  })

  let upserted = 0
  const batchSize = 500

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)

    const { error } = await client
      .from('products')
      .upsert(batch, { onConflict: 'sku' })

    if (error) {
      errors.push({ row: i + 2, message: `Rows ${i + 2}-${i + batch.length + 1}: ${error.message}` })
      continue
    }

    upserted += batch.length
  }

  return {
    totalRows: parsed.data.length,
    upserted,
    errors
  }
})
