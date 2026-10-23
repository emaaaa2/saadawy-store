import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const slug = getRouterParam(event, 'slug')

  // So a piece held by an abandoned card payment shows as available again.
  await cancelExpiredUnpaidOrders(event)

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return { product: data }
})
