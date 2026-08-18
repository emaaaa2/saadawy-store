import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (typeof body.approved !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'approved must be a boolean' })
  }

  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('reviews')
    .update({ approved: body.approved })
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
