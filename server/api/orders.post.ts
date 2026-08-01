import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  const itemIds = body.items.map((item) => item.id)

  const { data: products, error: productsError } = await client
    .from('products')
    .select('id, name, price, sale_price, sku, category')
    .in('id', itemIds)

  if (productsError) {
    throw createError({ statusCode: 500, statusMessage: productsError.message })
  }

  const productMap = new Map(products.map((product) => [product.id, product]))

  const verifiedItems = body.items.map((item) => {
    const product = productMap.get(item.id)

    if (!product) {
      throw createError({ statusCode: 400, statusMessage: 'One or more items are invalid' })
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid item quantity' })
    }

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      category: product.category,
      quantity: item.quantity
    }
  })

  const total = verifiedItems.reduce(
    (sum, item) => sum + (item.sale_price ?? item.price) * item.quantity,
    0
  )

  const reserved = []

  for (const item of verifiedItems) {
    const { data: success, error: stockError } = await client
      .rpc('decrement_stock', { product_id: item.id, qty: item.quantity })

    if (stockError) {
      for (const done of reserved) {
        await client.rpc('increment_stock', { product_id: done.id, qty: done.quantity })
      }
      throw createError({ statusCode: 500, statusMessage: stockError.message })
    }

    if (!success) {
      for (const done of reserved) {
        await client.rpc('increment_stock', { product_id: done.id, qty: done.quantity })
      }
      throw createError({ statusCode: 409, statusMessage: `${item.name} is out of stock` })
    }

    reserved.push(item)
  }

  const orderNumber = `SDW-${Date.now().toString().slice(-6)}`
  const status = body.paymentMethod === 'card' ? 'awaiting_payment' : 'pending'

  const { error } = await client
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: body.customerName,
      phone: body.phone,
      address: body.address,
      payment_method: body.paymentMethod,
      items: verifiedItems,
      total,
      status
    })

  if (error) {
    for (const done of reserved) {
      await client.rpc('increment_stock', { product_id: done.id, qty: done.quantity })
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return {
    order: {
      order_number: orderNumber,
      customer_name: body.customerName,
      total
    }
  }
})
