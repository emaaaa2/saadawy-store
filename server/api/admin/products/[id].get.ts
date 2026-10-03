import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return { product: data }
})