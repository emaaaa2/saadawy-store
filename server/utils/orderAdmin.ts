import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export const ORDER_STATUSES = ['awaiting_payment', 'pending', 'confirmed', 'delivered', 'cancelled']

type Client = ReturnType<typeof serverSupabaseServiceRole>
interface OrderItem { id: string; name: string; quantity: number }
export interface AdminOrder { id: number | string; order_number: string; status: string; items: OrderItem[] }

export async function getOrdersByIds(event: H3Event, ids: string[]) {
  const { data, error } = await serverSupabaseServiceRole(event)
    .from('orders')
    .select('id, order_number, status, items')
    .in('id', ids)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []) as AdminOrder[]
}

async function returnToStock(client: Client, items: OrderItem[]) {
  for (const item of items) {
    await client.rpc('increment_stock', { product_id: item.id, qty: item.quantity })
  }
}

async function takeFromStock(client: Client, items: OrderItem[]) {
  const taken: OrderItem[] = []
  for (const item of items) {
    const { data: ok, error } = await client.rpc('decrement_stock', { product_id: item.id, qty: item.quantity })
    if (error || !ok) {
      await returnToStock(client, taken)
      throw error
        ? createError({ statusCode: 409, statusMessage: error.message })
        : adminError(409, 'outOfStock', `${item.name} is out of stock`, { name: item.name })
    }
    taken.push(item)
  }
}

// A cancelled order's items are back in stock (same rule the payment webhook follows),
// so cancelling returns them and un-cancelling takes them again.
export async function changeOrderStatus(event: H3Event, order: AdminOrder, status: string) {
  if (!ORDER_STATUSES.includes(status)) {
    throw adminError(400, 'invalidStatus', 'Invalid order status')
  }
  if (order.status === status) return

  const client = serverSupabaseServiceRole(event)
  const cancelling = status === 'cancelled'
  const reopening = order.status === 'cancelled'

  if (reopening) await takeFromStock(client, order.items)

  // Only update if nobody changed the order since we read it, so stock is never moved twice.
  const { data, error } = await client
    .from('orders')
    .update({ status })
    .eq('id', order.id)
    .eq('status', order.status)
    .select('id')

  if (error || !data?.length) {
    if (reopening) await returnToStock(client, order.items)
    throw error
      ? createError({ statusCode: 500, statusMessage: error.message })
      : adminError(409, 'orderChanged', 'This order was just changed by someone else. Refresh and try again.')
  }

  if (cancelling) await returnToStock(client, order.items)
}

export async function deleteOrder(event: H3Event, order: AdminOrder) {
  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('orders')
    .delete()
    .eq('id', order.id)
    .eq('status', order.status)
    .select('id')

  if (error || !data?.length) {
    throw error
      ? createError({ statusCode: 500, statusMessage: error.message })
      : adminError(409, 'orderChanged', 'This order was just changed by someone else. Refresh and try again.')
  }

  // Delivered items left the store, and cancelled ones were already returned.
  if (order.status !== 'delivered' && order.status !== 'cancelled') {
    await returnToStock(client, order.items)
  }
}
