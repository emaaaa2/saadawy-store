const BADGES = ['Best Seller', 'New', 'Sale']
const MAX_IMAGES = 20

function fail(code: string, message: string, params?: Record<string, unknown>): never {
  throw adminError(400, code, message, params)
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
    if (typeof body.name !== 'string' || !body.name.trim()) fail('nameRequired', 'Name is required')
    row.name = body.name.trim().slice(0, 300)
  }

  if (!partial || has('price')) {
    if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0) fail('priceInvalid', 'Enter a price above 0')
    row.price = body.price
  }

  if (!partial || has('salePrice')) {
    const sale = body.salePrice
    if (sale === null || sale === '' || sale === undefined) row.sale_price = null
    else if (typeof sale !== 'number' || !Number.isFinite(sale) || sale <= 0) fail('salePriceInvalid', 'Enter a sale price above 0, or leave it empty')
    else if (typeof body.price === 'number' && sale >= body.price) fail('saleTooHigh', 'Sale price must be lower than the price')
    else row.sale_price = sale
  }

  if (!partial || has('stock')) {
    if (!Number.isInteger(body.stock) || body.stock < 0) fail('stockInvalid', 'Stock must be a whole number, 0 or more')
    row.stock = body.stock
  }

  if (!partial || has('sku')) {
    const sku = optionalText(body.sku, 50)
    if (sku && !/^[\w-]+$/.test(sku)) fail('skuFormat', 'SKU can only use letters, numbers, - and _')
    row.sku = sku
  }

  if (!partial || has('category')) row.category = optionalText(body.category, 50) ?? 'uncategorized'
  if (!partial || has('subcategory')) row.subcategory = optionalText(body.subcategory, 80)
  if (!partial || has('brand')) row.brand = optionalText(body.brand, 120)
  if (!partial || has('description')) row.description = optionalText(body.description)
  if (!partial || has('usageInfo')) row.usage_info = optionalText(body.usageInfo)

  // English versions (supabase_add_product_translations.sql); only sent by the product editor.
  if (has('nameEn')) row.name_en = optionalText(body.nameEn, 300)
  if (has('descriptionEn')) row.description_en = optionalText(body.descriptionEn)
  if (has('usageInfoEn')) row.usage_info_en = optionalText(body.usageInfoEn)

  if (!partial || has('badge')) {
    const badge = optionalText(body.badge, 30)
    if (badge && !BADGES.includes(badge)) fail('invalidRequest', 'Unknown badge')
    row.badge = badge
  }

  if (!partial || has('image')) {
    const image = optionalText(body.image, 1000)
    if (image && !isImageUrl(image)) fail('imageLink', 'Image must be a link starting with https://')
    row.image = image
  }

  if (!partial || has('images')) {
    const images = Array.isArray(body.images) ? body.images : []
    if (images.length > MAX_IMAGES) fail('galleryMax', `Up to ${MAX_IMAGES} gallery photos`, { max: MAX_IMAGES })
    if (!images.every(isImageUrl)) fail('imageLink', 'Gallery photos must be links starting with https://')
    row.images = [...new Set(images as string[])]
  }

  return row
}

const TRANSLATION_COLUMNS = ['name_en', 'description_en', 'usage_info_en']

export function isMissingTranslationColumns(error: { message: string }) {
  return /name_en|description_en|usage_info_en/.test(error.message)
}

/**
 * Until supabase_add_product_translations.sql runs, saves with empty English
 * fields are retried without them. Returns null when there's English text to keep.
 */
export function withoutEmptyTranslations(row: Record<string, unknown>) {
  if (TRANSLATION_COLUMNS.some((column) => row[column])) return null
  const rest = { ...row }
  for (const column of TRANSLATION_COLUMNS) delete rest[column]
  return rest
}

export function productSaveError(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    return adminError(409, 'skuTaken', 'Another product already uses this SKU')
  }
  if (isMissingTranslationColumns(error)) {
    return adminError(500, 'translationsSql', 'Run supabase_add_product_translations.sql in Supabase first to save English names')
  }
  return createError({ statusCode: 500, statusMessage: error.message })
}
