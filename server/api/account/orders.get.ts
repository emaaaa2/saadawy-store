import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const customer = await serverSupabaseUser(event).catch(() => null)
  if (!customer?.sub) {
    throw customerError(401, 'signInForOrders', 'Please sign in to view your orders')
  }

  const limit = Math.min(Math.max(Number(getQuery(event).limit) || 50, 1), 50)
  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('orders')
    .select('order_number, status, total, discount, shipping_fee, items, payment_method, created_at, phone, governorate, address')
    .eq('user_id', customer.sub)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { orders: data ?? [] }
})
