import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orderNumber = typeof query.orderNumber === 'string' ? query.orderNumber.trim() : ''
  const phone = typeof query.phone === 'string' ? query.phone.trim() : ''

  if (!orderNumber || !phone) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter your order number and phone number' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data: order, error } = await client
    .from('orders')
    .select('order_number, status, total, items, payment_method, created_at, phone')
    .eq('order_number', orderNumber)
    .single()

  if (error || !order || order.phone !== phone) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found. Please check your order number and phone number.' })
  }

  return {
    order: {
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      items: order.items,
      payment_method: order.payment_method,
      created_at: order.created_at
    }
  }
})
