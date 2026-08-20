export function calculateDiscount(coupon: {
  discount_type: string
  discount_value: number
  min_order_total: number | null
  usage_limit: number | null
  used_count: number
  active: boolean
  expires_at: string | null
}, subtotal: number): { valid: boolean; reason?: string; discount: number } {
  if (!coupon.active) {
    return { valid: false, reason: 'This coupon is no longer active', discount: 0 }
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return { valid: false, reason: 'This coupon has expired', discount: 0 }
  }

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, reason: 'This coupon has reached its usage limit', discount: 0 }
  }

  const minOrder = coupon.min_order_total ?? 0
  if (subtotal < minOrder) {
    return { valid: false, reason: `This coupon requires a minimum order of EGP ${minOrder}`, discount: 0 }
  }

  const discount = coupon.discount_type === 'percentage'
    ? Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100
    : Math.min(coupon.discount_value, subtotal)

  return { valid: true, discount }
}
