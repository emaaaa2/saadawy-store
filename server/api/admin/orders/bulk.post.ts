export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'orders')

  const body = await readBody(event)
  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids.filter((id: unknown) => typeof id === 'number' || typeof id === 'string').map(String))]
    : []

  if (ids.length === 0 || ids.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Select between 1 and 200 orders' })
  }
  if (body.action !== 'status' && body.action !== 'delete') {
    throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
  }
  if (body.action === 'status' && !ORDER_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order status' })
  }

  const orders = await getOrdersByIds(event, ids as string[])
  const failed: { order_number: string; reason: string }[] = []
  let done = 0

  for (const order of orders) {
    try {
      if (body.action === 'delete') await deleteOrder(event, order)
      else await changeOrderStatus(event, order, body.status)
      done++
    } catch (error: any) {
      failed.push({ order_number: order.order_number, reason: error?.statusMessage || 'Failed' })
    }
  }

  return { done, failed }
})
