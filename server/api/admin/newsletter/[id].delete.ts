import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'newsletter')

  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  const { error } = await client
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
