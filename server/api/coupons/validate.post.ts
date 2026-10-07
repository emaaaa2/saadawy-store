import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
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

  return {
    valid: true,
    code: coupon.code,
    discount: result.discount,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value
  }
})
