import { serverSupabaseServiceRole } from '#supabase/server'
import Papa from 'papaparse'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)

  if (typeof body.csv !== 'string' || !body.csv.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'No CSV content provided' })
  }

  const parsed = Papa.parse(body.csv, { header: true, skipEmptyLines: true })

  const errors: { row: number; message: string }[] = []
  const rows = []

  parsed.data.forEach((raw: any, index: number) => {
    const rowNumber = index + 2 // +1 for 0-index, +1 for header row

    if (!raw.sku || !String(raw.sku).trim()) {
      errors.push({ row: rowNumber, message: 'Missing SKU' })
      return
    }

    if (!raw.name || !String(raw.name).trim()) {
      errors.push({ row: rowNumber, message: `SKU ${raw.sku}: missing name` })
      return
    }

    const price = Number(raw.price)
    if (!Number.isFinite(price) || price <= 0) {
      errors.push({ row: rowNumber, message: `SKU ${raw.sku}: invalid price` })
      return
    }

    const stock = Number(raw.stock)
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push({ row: rowNumber, message: `SKU ${raw.sku}: invalid stock` })
      return
    }

    const salePrice = raw.sale_price !== undefined && raw.sale_price !== '' ? Number(raw.sale_price) : null
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0)) {
      errors.push({ row: rowNumber, message: `SKU ${raw.sku}: invalid sale price` })
      return
    }

    rows.push({
      sku: String(raw.sku).trim(),
      name: raw.name,
      slug: toSlug(raw.name),
      description: raw.description || null,
      price,
      sale_price: salePrice,
      category: raw.category || 'uncategorized',
      badge: raw.badge || null,
      image: raw.image || null,
      stock,
      brand: raw.brand || null,
      usage_info: raw.usage_info || null
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
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    upserted += batch.length
  }

  return {
    totalRows: parsed.data.length,
    upserted,
    errors
  }
})
