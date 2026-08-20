import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (typeof body.active !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'active must be a boolean' })
  }

  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('coupons')
    .update({ active: body.active })
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
