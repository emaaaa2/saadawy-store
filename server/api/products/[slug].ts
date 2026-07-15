import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const slug = getRouterParam(event, 'slug')

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found'
    })
  }

  return { product: data }
})