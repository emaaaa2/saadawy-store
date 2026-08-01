import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Name cannot be empty' })
  }

  if (body.price !== undefined && (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid price' })
  }

  if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== '' && (typeof body.salePrice !== 'number' || body.salePrice <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sale price' })
  }

  if (body.stock !== undefined && (!Number.isInteger(body.stock) || body.stock < 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stock' })
  }

  const updates = {}

  if (body.name !== undefined) updates.name = body.name
  if (body.brand !== undefined) updates.brand = body.brand || null
  if (body.description !== undefined) updates.description = body.description
  if (body.usageInfo !== undefined) updates.usage_info = body.usageInfo || null
  if (body.price !== undefined) updates.price = body.price
  if (body.salePrice !== undefined) updates.sale_price = body.salePrice || null
  if (body.image !== undefined) updates.image = body.image
  if (body.category !== undefined) updates.category = body.category
  if (body.badge !== undefined) updates.badge = body.badge || null
  if (body.stock !== undefined) updates.stock = body.stock

  const { data, error } = await client
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { product: data }
})