import type { serverSupabaseServiceRole } from '#supabase/server'

type Client = ReturnType<typeof serverSupabaseServiceRole>

// used_count only changes if it still holds the value we read; if another order changed it first,
// read it again and retry. That way two orders at once can't both take a coupon's last use.
async function changeCouponUses(client: Client, couponId: string | number, change: 1 | -1) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: coupon, error } = await client
      .from('coupons')
      .select('used_count, usage_limit')
      .eq('id', couponId)
      .single()
    if (error) throw internalError(error)

    if (change === 1 && coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) return false
    if (change === -1 && coupon.used_count <= 0) return true

    const { data: updated, error: updateError } = await client
      .from('coupons')
      .update({ used_count: coupon.used_count + change })
      .eq('id', couponId)
      .eq('used_count', coupon.used_count)
      .select('id')
    if (updateError) throw internalError(updateError)
    if (updated?.length) return true
  }
  throw createError({ statusCode: 503, statusMessage: 'Coupon is busy, please try again' })
}

/** Counts one use of the coupon; false if it's already used up. */
export const claimCouponUse = (client: Client, couponId: string | number) => changeCouponUses(client, couponId, 1)

/** Gives back a use claimed for an order that then failed. */
export const releaseCouponUse = (client: Client, couponId: string | number) => changeCouponUses(client, couponId, -1)

export function calculateDiscount(coupon: {
  discount_type: string
  discount_value: number
  min_order_total: number | null
  usage_limit: number | null
  used_count: number
  active: boolean
  expires_at: string | null
}, subtotal: number): { valid: boolean; reason?: string; code?: string; params?: Record<string, unknown>; discount: number } {
  if (!coupon.active) {
    return { valid: false, reason: 'This coupon is no longer active', code: 'couponInactive', discount: 0 }
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return { valid: false, reason: 'This coupon has expired', code: 'couponExpired', discount: 0 }
  }

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, reason: 'This coupon has reached its usage limit', code: 'couponUsedUp', discount: 0 }
  }

  const minOrder = coupon.min_order_total ?? 0
  if (subtotal < minOrder) {
    return { valid: false, reason: `This coupon requires a minimum order of EGP ${minOrder}`, code: 'couponMinOrder', params: { amount: minOrder }, discount: 0 }
  }

  const discount = coupon.discount_type === 'percentage'
    ? Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100
    : Math.min(coupon.discount_value, subtotal)

  return { valid: true, discount }
}
