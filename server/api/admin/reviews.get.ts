import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'reviews')

  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('reviews')
    .select('*, product:products(id, name, slug)')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { reviews: data }
})
