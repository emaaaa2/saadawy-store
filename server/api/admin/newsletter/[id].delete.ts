import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'newsletter')

  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  const { data, error } = await client
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id)
    .select('email')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (data?.length) await logActivity(event, access.email, 'newsletter.remove', data[0].email)
  return { success: true }
})
