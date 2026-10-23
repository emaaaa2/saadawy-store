import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'payment')

  const config = useRuntimeConfig()
  const body = await readBody(event)
  const siteUrl = config.public.siteUrl

  const client = serverSupabaseServiceRole(event)

  const { data: order } = await client
    .from('orders')
    .select('id, total, items, customer_name, phone, address, status')
    .eq('order_number', body.orderNumber)
    .single()

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }
  // Only an order still waiting for its card payment can be paid (not a cancelled or confirmed one).
  if (order.status !== 'awaiting_payment') {
    throw createError({ statusCode: 409, statusMessage: 'This order can no longer be paid' })
  }

  const response = await $fetch('https://accept.paymob.com/v1/intention/', {
    method: 'POST',
    headers: {
      Authorization: `Token ${config.paymobSecretKey}`
    },
    body: {
      amount: Math.round(order.total * 100),
      currency: 'EGP',
      payment_methods: [Number(config.paymobCardIntegrationId)],
      items: order.items.map((item) => ({
        name: item.name,
        amount: Math.round((item.sale_price ?? item.price) * 100),
        quantity: item.quantity
      })),
      billing_data: {
        first_name: order.customer_name.split(' ')[0] || order.customer_name,
        last_name: order.customer_name.split(' ')[1] || 'N/A',
        phone_number: order.phone,
        email: 'customer@saadawy.com',
        country: 'EG',
        state: 'NA',
        city: 'NA',
        street: order.address
      },
      special_reference: body.orderNumber,
      notification_url: `${siteUrl}/api/checkout/webhook`,
      redirection_url: `${siteUrl}/checkout/success`
    }
  })

  if (!response.client_secret || !response.intention_order_id) {
    throw createError({ statusCode: 502, statusMessage: 'Payment provider did not return a client secret' })
  }

  // Paymob's own order id comes back (signed) in the payment webhook; the webhook only accepts a
  // payment for this order if it matches. Without it a payment can't be confirmed, so don't start one.
  const { error: linkError } = await client
    .from('orders')
    .update({ paymob_order_id: String(response.intention_order_id) })
    .eq('id', order.id)
  if (linkError) throw internalError(linkError)

  return {
    clientSecret: response.client_secret
  }
})
