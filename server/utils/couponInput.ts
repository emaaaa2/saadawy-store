function fail(code: string, message: string): never {
  throw adminError(400, code, message)
}

/** Coupon form body → coupon columns. With `partial`, only fields present in the body. */
export function readCouponInput(body: Record<string, any>, { partial = false } = {}) {
  const has = (key: string) => body[key] !== undefined
  const row: Record<string, unknown> = {}

  if (!partial || has('discountType') || has('discountValue')) {
    const discountType = body.discountType === 'fixed' ? 'fixed' : 'percentage'
    const discountValue = Number(body.discountValue)
    if (!Number.isFinite(discountValue) || discountValue <= 0) fail('discountInvalid', 'Please enter a valid discount value')
    if (discountType === 'percentage' && discountValue > 100) fail('percentMax', 'Percentage discount cannot exceed 100')
    row.discount_type = discountType
    row.discount_value = discountValue
  }

  if (!partial || has('minOrderTotal')) {
    const min = body.minOrderTotal ? Number(body.minOrderTotal) : 0
    if (!Number.isFinite(min) || min < 0) fail('minOrderInvalid', 'Minimum order must be 0 or more')
    row.min_order_total = min
  }

  if (!partial || has('usageLimit')) {
    const limit = body.usageLimit ? Number(body.usageLimit) : null
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) fail('usageLimitInvalid', 'Usage limit must be a whole number above 0')
    row.usage_limit = limit
  }

  if (!partial || has('expiresAt')) {
    const expiresAt = body.expiresAt || null
    if (expiresAt && Number.isNaN(Date.parse(expiresAt))) fail('expiryInvalid', 'Invalid expiry date')
    row.expires_at = expiresAt
  }

  if (has('active')) {
    if (typeof body.active !== 'boolean') fail('invalidRequest', 'active must be true or false')
    row.active = body.active
  }

  return row
}
