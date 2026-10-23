import { randomInt } from 'node:crypto'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

// Every order holds its stock until it's handled, so one order (or one phone number) can't be
// allowed to lock up the whole shop.
const MAX_LINES = 40
const MAX_QUANTITY = 50
const MAX_OPEN_ORDERS_PER_PHONE = 5

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'order')

  const client = serverSupabaseServiceRole(event)
  const customer = await serverSupabaseUser(event).catch(() => null)
  const body = await readBody(event)

  const settings = await getStoreSettings(event)
  if (!enabledPaymentMethods(settings).some((method) => method.value === body.paymentMethod)) {
    throw customerError(400, 'paymentMethod', 'Please choose an available payment method')
  }

  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : ''
  const address = typeof body.address === 'string' ? body.address.trim() : ''
  const phone = normalizePhone(body.phone)
  if (customerName.length < 2 || customerName.length > 100) {
    throw customerError(400, 'customerName', 'Please enter your full name')
  }
  if (!isEgyptianMobile(phone)) {
    throw customerError(400, 'phoneInvalid', 'Please enter a valid Egyptian mobile number (e.g. 01012345678)')
  }
  if (address.length < 5 || address.length > 500) {
    throw customerError(400, 'address', 'Please enter your full address')
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_LINES) {
    throw customerError(400, 'invalidItems', 'One or more items are invalid')
  }

  const { count: openOrders } = await client
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('phone', phone)
    .in('status', ['awaiting_payment', 'pending'])
  if ((openOrders ?? 0) >= MAX_OPEN_ORDERS_PER_PHONE) {
    throw customerError(429, 'tooManyOpenOrders', 'You already have several orders waiting. Please wait for us to confirm them, or contact us on WhatsApp.')
  }

  const itemIds = body.items.map((item) => item.id)

  const { data: products, error: productsError } = await client
    .from('products')
    .select('id, name, price, sale_price, sku, category')
    .in('id', itemIds)

  if (productsError) {
    throw internalError(productsError)
  }

  const productMap = new Map(products.map((product) => [product.id, product]))

  const verifiedItems = body.items.map((item) => {
    const product = productMap.get(item.id)

    if (!product) {
      throw customerError(400, 'invalidItems', 'One or more items are invalid')
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      throw customerError(400, 'invalidQuantity', 'Invalid item quantity')
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

  if (body.couponCode) {
    const code = String(body.couponCode).trim().toUpperCase()
    const { data: coupon } = await client
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single()

    if (!coupon) {
      throw customerError(400, 'couponInvalid', 'Invalid coupon code')
    }

    const result = calculateDiscount(coupon, subtotal)
    if (!result.valid) {
      throw customerError(400, result.code!, result.reason!, result.params)
    }

    discount = result.discount
    couponCode = coupon.code
    couponRow = coupon
  }

  const governorate = typeof body.governorate === 'string' ? body.governorate.trim() : ''
  if (!governorate) {
    throw customerError(400, 'governorate', 'Governorate is required')
  }

  const { data: shippingSettings } = await client
    .from('shipping_settings')
    .select('tier1_fee, tier2_fee, tier3_fee, free_shipping_threshold')
    .eq('id', 1)
    .single()

  const afterDiscount = Math.max(0, subtotal - discount)
  const shippingFee = calculateShipping(governorate, afterDiscount, shippingSettings ?? DEFAULT_SHIPPING_SETTINGS)
  const total = afterDiscount + shippingFee

  // Free stock held by card orders nobody paid for, so it can be sold again.
  await cancelExpiredUnpaidOrders(event, { force: true })

  const reserved = []
  let couponClaimed = false

  // Puts back everything this request took if the order can't be completed.
  async function undo() {
    await returnToStock(client, reserved)
    if (couponClaimed) await releaseCouponUse(client, couponRow.id)
  }

  for (const item of verifiedItems) {
    const { data: success, error: stockError } = await client
      .rpc('decrement_stock', { product_id: item.id, qty: item.quantity })

    if (stockError) {
      await undo()
      throw internalError(stockError)
    }

    if (!success) {
      await undo()
      throw customerError(409, 'outOfStock', `${item.name} is out of stock`, { name: item.name })
    }

    reserved.push(item)
  }

  if (couponRow) {
    couponClaimed = await claimCouponUse(client, couponRow.id).catch(async (error) => {
      await undo()
      throw error
    })
    if (!couponClaimed) {
      await undo()
      throw customerError(400, 'couponUsedUp', 'This coupon has reached its usage limit')
    }
  }

  const status = body.paymentMethod === 'card' ? 'awaiting_payment' : 'pending'
  let orderNumber = ''

  // Random numbers can't repeat the way a clock-based one does; on the rare clash, pick another.
  for (let attempt = 0; attempt < 5 && !orderNumber; attempt++) {
    const candidate = `SDW-${randomInt(10_000_000, 100_000_000)}`
    const { data: taken } = await client.from('orders').select('id').eq('order_number', candidate).limit(1)
    if (taken?.length) continue

    const { error } = await client
      .from('orders')
      .insert({
        order_number: candidate,
        customer_name: customerName,
        phone,
        governorate,
        address,
        payment_method: body.paymentMethod,
        items: verifiedItems,
        total,
        discount,
        shipping_fee: shippingFee,
        coupon_code: couponCode,
        status,
        ...(customer?.sub ? { user_id: customer.sub } : {})
      })

    // 23505: another order got the same number at the same moment (unique index on order_number).
    if (error?.code === '23505') continue
    if (error) {
      await undo()
      throw internalError(error)
    }
    orderNumber = candidate
  }

  if (!orderNumber) {
    await undo()
    throw createError({ statusCode: 500, statusMessage: 'Could not create an order number' })
  }

  return {
    order: {
      order_number: orderNumber,
      customer_name: customerName,
      total
    }
  }
})
