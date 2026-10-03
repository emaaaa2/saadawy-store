const BADGES = ['Best Seller', 'New', 'Sale']
const MAX_IMAGES = 20

function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

export function productSlug(sku: string | null, name: string) {
  const namePart = name
    .toLowerCase()
    .trim()
    .replace(/[/?#%"'\\]/g, '')
    .replace(/\s+/g, '-')
  return sku ? `${sku}-${namePart}` : `${namePart}-${Date.now().toString(36)}`
}

function optionalText(value: unknown, max = 5000) {
  if (value === null || value === undefined) return null
  const text = String(value).trim().slice(0, max)
  return text || null
}

function isImageUrl(value: unknown): value is string {
  return typeof value === 'string' && /^(https:\/\/|\/)\S+$/.test(value)
}

/**
 * Turns the editor's form body into product columns. With `partial`, only the
 * fields present in the body are validated and returned (for PATCH).
 */
export function readProductInput(body: Record<string, any>, { partial = false } = {}) {
  const has = (key: string) => body[key] !== undefined
  const row: Record<string, unknown> = {}

  if (!partial || has('name')) {
    if (typeof body.name !== 'string' || !body.name.trim()) fail('Name is required')
    row.name = body.name.trim().slice(0, 300)
  }

  if (!partial || has('price')) {
    if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0) fail('Enter a price above 0')
    row.price = body.price
  }

  if (!partial || has('salePrice')) {
    const sale = body.salePrice
    if (sale === null || sale === '' || sale === undefined) row.sale_price = null
    else if (typeof sale !== 'number' || !Number.isFinite(sale) || sale <= 0) fail('Enter a sale price above 0, or leave it empty')
    else if (typeof body.price === 'number' && sale >= body.price) fail('Sale price must be lower than the price')
    else row.sale_price = sale
  }

  if (!partial || has('stock')) {
    if (!Number.isInteger(body.stock) || body.stock < 0) fail('Stock must be a whole number, 0 or more')
    row.stock = body.stock
  }

  if (!partial || has('sku')) {
    const sku = optionalText(body.sku, 50)
    if (sku && !/^[\w-]+$/.test(sku)) fail('SKU can only use letters, numbers, - and _')
    row.sku = sku
  }

  if (!partial || has('category')) row.category = optionalText(body.category, 50) ?? 'uncategorized'
  if (!partial || has('subcategory')) row.subcategory = optionalText(body.subcategory, 80)
  if (!partial || has('brand')) row.brand = optionalText(body.brand, 120)
  if (!partial || has('description')) row.description = optionalText(body.description)
  if (!partial || has('usageInfo')) row.usage_info = optionalText(body.usageInfo)

  if (!partial || has('badge')) {
    const badge = optionalText(body.badge, 30)
    if (badge && !BADGES.includes(badge)) fail('Unknown badge')
    row.badge = badge
  }

  if (!partial || has('image')) {
    const image = optionalText(body.image, 1000)
    if (image && !isImageUrl(image)) fail('Image must be a link starting with https://')
    row.image = image
  }

  if (!partial || has('images')) {
    const images = Array.isArray(body.images) ? body.images : []
    if (images.length > MAX_IMAGES) fail(`Up to ${MAX_IMAGES} gallery photos`)
    if (!images.every(isImageUrl)) fail('Gallery photos must be links starting with https://')
    row.images = [...new Set(images as string[])]
  }

  return row
}

export function productSaveError(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    return createError({ statusCode: 409, statusMessage: 'Another product already uses this SKU' })
  }
  return createError({ statusCode: 500, statusMessage: error.message })
}
