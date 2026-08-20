import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  const subtotal = Number(body.subtotal)

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a coupon code' })
  }
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order total' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data: coupon, error } = await client
    .from('coupons')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid coupon code' })
  }

  const result = calculateDiscount(coupon, subtotal)

  if (!result.valid) {
    throw createError({ statusCode: 400, statusMessage: result.reason })
  }

  return {
    valid: true,
    code: coupon.code,
    discount: result.discount,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value
  }
})
