import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  const orderNumber = `SDW-${Date.now().toString().slice(-6)}`

  const { error } = await client
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: body.customerName,
      phone: body.phone,
      address: body.address,
      payment_method: body.paymentMethod,
      items: body.items,
      total: body.total,
      status: 'pending'
    })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return {
    order: {
      order_number: orderNumber,
      customer_name: body.customerName,
      total: body.total
    }
  }
})