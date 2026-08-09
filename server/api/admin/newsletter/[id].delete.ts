import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

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
