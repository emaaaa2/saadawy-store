import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

// A card order holds its stock while the customer is on Paymob's page. If they leave without
// paying, Paymob never calls back, so after this long the order is cancelled and its stock freed.
// (If they still pay later, the payment webhook takes the stock again and confirms the order.)
export const UNPAID_ORDER_MINUTES = 60

const CHECK_EVERY_MS = 60 * 1000
let lastCheck = 0

/** Cancels card orders left unpaid for too long. Runs at most once a minute unless `force`. */
export async function cancelExpiredUnpaidOrders(event: H3Event, { force = false } = {}) {
  if (!force && Date.now() - lastCheck < CHECK_EVERY_MS) return
  lastCheck = Date.now()

  try {
    const client = serverSupabaseServiceRole(event)
    const cutoff = new Date(Date.now() - UNPAID_ORDER_MINUTES * 60 * 1000).toISOString()
    const { data: orders, error } = await client
      .from('orders')
      .select('id, items')
      .eq('status', 'awaiting_payment')
      .lt('created_at', cutoff)
      .limit(50)
    if (error) throw error

    for (const order of orders ?? []) {
      // Only the request that actually cancels it returns the stock, so it's never returned twice.
      const { data } = await client
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)
        .eq('status', 'awaiting_payment')
        .select('id')
      if (data?.length) await returnToStock(client, order.items)
    }
  } catch (error) {
    // Never fail the page over this; the next check will try again.
    console.error('Cancelling unpaid orders failed:', error)
  }
}
