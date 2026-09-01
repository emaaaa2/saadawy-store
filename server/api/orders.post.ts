import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

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

  const subtotal = verifiedItems.reduce(
    (sum, item) => sum + (item.sale_price ?? item.price) * item.quantity,
    0
  )

  let discount = 0
  let couponCode: string | null = null
  let couponRow = null
  const serviceClient = serverSupabaseServiceRole(event)

  if (body.couponCode) {
    const code = String(body.couponCode).trim().toUpperCase()
    const { data: coupon } = await serviceClient
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single()

    if (!coupon) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid coupon code' })
    }

    const result = calculateDiscount(coupon, subtotal)
    if (!result.valid) {
      throw createError({ statusCode: 400, statusMessage: result.reason })
    }

    discount = result.discount
    couponCode = coupon.code
    couponRow = coupon
  }

  const governorate = typeof body.governorate === 'string' ? body.governorate.trim() : ''
  if (!governorate) {
    throw createError({ statusCode: 400, statusMessage: 'Governorate is required' })
  }

  const { data: shippingSettings } = await serviceClient
    .from('shipping_settings')
    .select('tier1_fee, tier2_fee, tier3_fee, free_shipping_threshold')
    .eq('id', 1)
    .single()

  const afterDiscount = Math.max(0, subtotal - discount)
  const shippingFee = calculateShipping(governorate, afterDiscount, shippingSettings ?? DEFAULT_SHIPPING_SETTINGS)
  const total = afterDiscount + shippingFee

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
      governorate,
      address: body.address,
      payment_method: body.paymentMethod,
      items: verifiedItems,
      total,
      discount,
      shipping_fee: shippingFee,
      coupon_code: couponCode,
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

  if (couponRow) {
    await serviceClient
      .from('coupons')
      .update({ used_count: couponRow.used_count + 1 })
      .eq('id', couponRow.id)
  }

  return {
    order: {
      order_number: orderNumber,
      customer_name: body.customerName,
      total
    }
  }
})
