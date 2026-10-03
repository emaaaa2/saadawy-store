import { serverSupabaseServiceRole } from '#supabase/server'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

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