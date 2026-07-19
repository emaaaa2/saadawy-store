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

  const { data, error } = await client
    .from('products')
    .update({
      name: body.name,
      description: body.description,
      price: body.price,
      sale_price: body.salePrice || null,
      image: body.image,
      category: body.category,
      badge: body.badge || null,
      stock: body.stock
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { product: data }
})