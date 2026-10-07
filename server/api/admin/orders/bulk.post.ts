export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'orders')

  const body = await readBody(event)
  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids.filter((id: unknown) => typeof id === 'number' || typeof id === 'string').map(String))]
    : []

  if (ids.length === 0 || ids.length > 200) {
    throw adminError(400, 'selectOrders', 'Select between 1 and 200 orders', { max: 200 })
  }
  if (body.action !== 'status' && body.action !== 'delete') {
    throw adminError(400, 'unknownAction', 'Unknown action')
  }
  if (body.action === 'status' && !ORDER_STATUSES.includes(body.status)) {
    throw adminError(400, 'invalidStatus', 'Invalid order status')
  }

  const orders = await getOrdersByIds(event, ids as string[])
  const failed: { order_number: string; reason: string; adminCode?: string; params?: unknown }[] = []
  let done = 0

  for (const order of orders) {
    try {
      if (body.action === 'delete') await deleteOrder(event, order)
      else await changeOrderStatus(event, order, body.status)
      done++
    } catch (error: any) {
      failed.push({
        order_number: order.order_number,
        reason: error?.statusMessage || 'Failed',
        adminCode: error?.data?.adminCode,
        params: error?.data?.params,
      })
    }
  }

  return { done, failed }
})
