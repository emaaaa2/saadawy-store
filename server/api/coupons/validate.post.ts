import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Stops anyone trying codes one after another until one works.
  await rateLimit(event, 'coupon')

  const body = await readBody(event)
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  const subtotal = Number(body.subtotal)

  if (!code) {
    throw customerError(400, 'couponMissing', 'Please enter a coupon code')
  }
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw customerError(400, 'invalidTotal', 'Invalid order total')
  }

  const client = serverSupabaseServiceRole(event)

  const { data: coupon, error } = await client
    .from('coupons')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !coupon) {
    throw customerError(404, 'couponInvalid', 'Invalid coupon code')
  }

  const result = calculateDiscount(coupon, subtotal)

  if (!result.valid) {
    throw customerError(400, result.code!, result.reason!, result.params)
  }

  // Checked again when the order is placed; here only when the phone is already filled in
  // (or the customer is signed in), so they hear about it before ordering.
  if (isFirstOrderCoupon(coupon.code, await getStoreSettings(event))) {
    const phone = normalizePhone(body.phone)
    const customer = await serverSupabaseUser(event).catch(() => null)
    if (await hasPreviousOrder(client, { phone: isEgyptianMobile(phone) ? phone : undefined, userId: customer?.sub })) {
      throw customerError(400, 'couponFirstOrder', 'This code is for your first order only')
    }
  }

  return {
    valid: true,
    code: coupon.code,
    discount: result.discount,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value
  }
})
