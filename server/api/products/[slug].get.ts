import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const slug = getRouterParam(event, 'slug')

  // So a piece held by an abandoned card payment shows as available again.
  await cancelExpiredUnpaidOrders(event)

  // Products without a photo are hidden from the store (storeVisibility.ts), so their page is a 404 too.
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .or(SHOWN_IN_STORE)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  // Colours / shades the customer picks from (each with its own stock).
  const variants = data.has_variants ? (await getVariants(client, [data.id]))[data.id] ?? [] : []
  return { product: { ...data, variants } }
})
