import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'reviews')

  const id = getRouterParam(event, 'id')
  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('reviews')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (data?.length) await logActivity(event, access.email, 'review.delete', id, { row: data[0] })
  return { success: true }
})
