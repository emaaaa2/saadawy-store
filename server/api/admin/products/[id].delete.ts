import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')

  const { error } = await client
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})