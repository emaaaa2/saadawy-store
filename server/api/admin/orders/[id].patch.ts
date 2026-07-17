import { serverSupabaseServiceRole } from '#supabase/server'
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

  if (session !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

const client = serverSupabaseServiceRole(event)
  const orderId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { error } = await client
    .from('orders')
    .update({ status: body.status })
    .eq('id', orderId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})