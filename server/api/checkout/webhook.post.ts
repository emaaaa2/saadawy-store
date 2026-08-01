import { serverSupabaseServiceRole } from '#supabase/server'
import { createHmac } from 'node:crypto'

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
  const computedHmac = createHmac('sha512', secret).update(concatenated).digest('hex')
  return computedHmac === receivedHmac
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
    .select('total, status, items')
    .eq('order_number', orderNumber)
    .single()

  if (!order || order.status === 'confirmed' || order.status === 'cancelled') {
    return { received: true }
  }

  const paidAmount = Number(transaction.amount_cents) / 100
  const amountMatches = Math.abs(paidAmount - Number(order.total)) < 0.01

  if (transaction.success === true && amountMatches) {
    await client.from('orders').update({ status: 'confirmed' }).eq('order_number', orderNumber)
  } else if (transaction.success === false) {
    await client.from('orders').update({ status: 'cancelled' }).eq('order_number', orderNumber)

    for (const item of order.items) {
      await client.rpc('increment_stock', { product_id: item.id, qty: item.quantity })
    }
  }

  return { received: true }
})
