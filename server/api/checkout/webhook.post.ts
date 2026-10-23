import { serverSupabaseServiceRole } from '#supabase/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

const HMAC_FIELDS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order.id',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success'
]

function getField(obj: Record<string, any>, path: string) {
  return path.split('.').reduce((value, key) => value?.[key], obj)
}

function isValidHmac(transaction: Record<string, any>, receivedHmac: string, secret: string) {
  const concatenated = HMAC_FIELDS.map((field) => String(getField(transaction, field) ?? '')).join('')
  const computed = Buffer.from(createHmac('sha512', secret).update(concatenated).digest('hex'))
  const received = Buffer.from(receivedHmac)
  // Constant-time compare, so the response time gives away nothing about the right signature.
  return computed.length === received.length && timingSafeEqual(computed, received)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { hmac } = getQuery(event)
  const transaction = body.obj

  if (!transaction || typeof hmac !== 'string' || !isValidHmac(transaction, hmac, config.paymobHmacSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid Paymob signature' })
  }

  const orderNumber = transaction.special_reference || transaction.order?.merchant_order_id
  if (!orderNumber) {
    return { received: true }
  }

  const client = serverSupabaseServiceRole(event)

  const { data: order } = await client
    .from('orders')
    .select('id, total, status, items, paymob_order_id')
    .eq('order_number', orderNumber)
    .single()

  // The order number above isn't covered by Paymob's signature, but the Paymob order id is. A
  // customer sees a signed transaction in their return link, so without this check they could pay
  // once and resend that payment with another order's number to mark it paid (or cancelled).
  if (!order || !order.paymob_order_id || String(transaction.order?.id) !== order.paymob_order_id) {
    if (order) console.error(`Paymob webhook for ${orderNumber} doesn't match its Paymob order; ignored`)
    return { received: true }
  }

  // Changes the status only if it's still `from`, so a repeated callback (Paymob retries) or an
  // admin acting at the same moment can't move the stock twice. True if this call changed it.
  async function moveStatus(from: string, to: string) {
    const { data } = await client.from('orders').update({ status: to }).eq('id', order.id).eq('status', from).select('id')
    return Boolean(data?.length)
  }

  const paidAmount = Number(transaction.amount_cents) / 100
  const amountMatches = Math.abs(paidAmount - Number(order.total)) < 0.01

  if (transaction.success === true && amountMatches) {
    if (await moveStatus('awaiting_payment', 'confirmed')) return { received: true }

    // Paid after the order was cancelled: a declined card retried with another one, or paid after
    // the unpaid-order time limit. The money is in, so take the stock again and confirm. If the
    // items sold out meanwhile, leave it pending so the team sees it and contacts the customer.
    const { data: current } = await client.from('orders').select('status').eq('id', order.id).single()
    if (current?.status === 'cancelled') {
      const inStock = await takeFromStock(client, order.items).then(() => true, () => false)
      const reopened = await moveStatus('cancelled', inStock ? 'confirmed' : 'pending')
      if (!reopened && inStock) await returnToStock(client, order.items)
      if (reopened && !inStock) console.error(`Order ${orderNumber} was paid after it was cancelled, and its items are out of stock`)
    }
  } else if (transaction.success === false) {
    if (await moveStatus('awaiting_payment', 'cancelled')) await returnToStock(client, order.items)
  }

  return { received: true }
})
