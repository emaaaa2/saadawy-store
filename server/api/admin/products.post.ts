import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

  if (session !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)

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
      description: body.description,
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