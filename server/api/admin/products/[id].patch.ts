import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

  if (session !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updates = {}

  if (body.name !== undefined) updates.name = body.name
  if (body.description !== undefined) updates.description = body.description
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