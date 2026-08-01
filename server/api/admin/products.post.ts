import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)

  if (typeof body.name !== 'string' || !body.name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid price' })
  }

  if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== '' && (typeof body.salePrice !== 'number' || body.salePrice <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sale price' })
  }

  if (!Number.isInteger(body.stock) || body.stock < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stock' })
  }

  const slug = body.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

  const { data, error } = await client
    .from('products')
    .insert({
      name: body.name,
      slug: slug,
      brand: body.brand || null,
      description: body.description,
      usage_info: body.usageInfo || null,
      price: body.price,
      sale_price: body.salePrice || null,
      image: body.image,
      category: body.category,
      badge: body.badge || null,
      stock: body.stock
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { product: data }
})