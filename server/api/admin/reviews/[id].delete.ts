import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'reviews')

  const id = getRouterParam(event, 'id')
  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
