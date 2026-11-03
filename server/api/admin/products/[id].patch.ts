import { serverSupabaseServiceRole } from '#supabase/server'

// Editor field → column, for the `original` values the dashboard sends with a save.
const COLUMNS: Record<string, string> = {
  name: 'name', nameEn: 'name_en', brand: 'brand', description: 'description', descriptionEn: 'description_en',
  usageInfo: 'usage_info', usageInfoEn: 'usage_info_en', price: 'price', salePrice: 'sale_price', sku: 'sku',
  stock: 'stock', category: 'category', subcategory: 'subcategory', badge: 'badge', image: 'image', images: 'images',
}

// "" and null mean the same thing in the form; numbers may arrive as strings from the database.
function normalize(value: unknown) {
  if (Array.isArray(value)) return JSON.stringify(value)
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  const text = String(value).trim()
  if (text === '') return null
  return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : text
}

const changedError = () => adminError(409, 'productChanged', 'This product was just changed by someone else or by an order. Refresh and try again.')

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')
  const { original, ...fields } = (await readBody(event)) ?? {}
  const updates = readProductInput(fields, { partial: true })

  if (!Object.keys(updates).length) {
    throw adminError(400, 'nothingToUpdate', 'Nothing to update')
  }

  const { data: current, error: readError } = await client.from('products').select('*').eq('id', productId).maybeSingle()
  if (readError) throw productSaveError(readError)
  if (!current) throw adminError(404, 'productNotFound', 'This product no longer exists')

  // The dashboard sends the values it showed when the page opened. If any of the fields being
  // saved has changed since (an order took stock, or another admin saved), don't overwrite it.
  const checked = original && typeof original === 'object' ? Object.keys(original).filter((key) => COLUMNS[key]) : []
  for (const key of checked) {
    if (normalize(current[COLUMNS[key]]) !== normalize(original[key])) throw changedError()
  }

  // The sale price has to stay below the price, including the one already saved.
  if ('price' in updates || 'sale_price' in updates) {
    const price = Number(updates.price ?? current.price)
    const sale = 'sale_price' in updates ? updates.sale_price : current.sale_price
    if (sale !== null && sale !== undefined && Number(sale) >= price) {
      throw adminError(400, 'saleTooHigh', 'Sale price must be lower than the price')
    }
  }

  // Write only if the checked columns still hold what was just read, so a change that lands
  // between that read and this write isn't overwritten either.
  const save = (row: Record<string, unknown>) => {
    let query = client.from('products').update(row).eq('id', productId)
    for (const key of checked) {
      const column = COLUMNS[key]
      if (column === 'images' || !(column in row)) continue
      query = current[column] === null ? query.is(column, null) : query.eq(column, current[column])
    }
    return query.select()
  }

  let { data, error } = await save(updates)
  const fallback = error && isMissingTranslationColumns(error) ? withoutEmptyTranslations(updates) : null
  if (fallback && Object.keys(fallback).length) ({ data, error } = await save(fallback))

  if (error) throw productSaveError(error)
  if (!data?.length) throw changedError()

  await logActivity(event, access.email, 'product.update', data[0].sku ?? productId, {
    name: data[0].name,
    changes: changedColumns(current, data[0], Object.keys(updates)),
  })
  return { product: data[0] }
})
