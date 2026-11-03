import { serverSupabaseServiceRole } from '#supabase/server'

const EDITABLE_FIELDS = ['customer_name', 'phone', 'governorate', 'address']

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'orders')

  const orderId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const [order] = await getOrdersByIds(event, [orderId])
  if (!order) {
    throw adminError(404, 'orderNotFound', 'Order not found')
  }

  const details: Record<string, string> = {}
  for (const field of EDITABLE_FIELDS) {
    if (body[field] === undefined) continue
    const value = typeof body[field] === 'string' ? body[field].trim() : ''
    if (!value) {
      throw adminError(400, 'fieldEmpty', `${field.replace('_', ' ')} can't be empty`, { field })
    }
    details[field] = value
  }

  if (Object.keys(details).length) {
    const { error } = await serverSupabaseServiceRole(event)
      .from('orders')
      .update(details)
      .eq('id', order.id)

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    await logActivity(event, access.email, 'order.edit', order.order_number, { changes: changedColumns(order as any, details) })
  }

  if (body.status !== undefined && body.status !== order.status) {
    await changeOrderStatus(event, order, body.status)
    await logActivity(event, access.email, 'order.status', order.order_number, { from: order.status, to: body.status })
  }

  return { success: true }
})
