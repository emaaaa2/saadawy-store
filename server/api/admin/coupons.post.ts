import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const body = await readBody(event)
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  const discountType = body.discountType === 'fixed' ? 'fixed' : 'percentage'
  const discountValue = Number(body.discountValue)
  const minOrderTotal = body.minOrderTotal ? Number(body.minOrderTotal) : 0
  const usageLimit = body.usageLimit ? Number(body.usageLimit) : null
  const expiresAt = body.expiresAt || null

  if (!code || !/^[A-Z0-9_-]{3,30}$/.test(code)) {
    throw createError({ statusCode: 400, statusMessage: 'Code must be 3-30 letters/numbers, no spaces' })
  }
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid discount value' })
  }
  if (discountType === 'percentage' && discountValue > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Percentage discount cannot exceed 100' })
  }

  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('coupons')
    .insert({
      code,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_total: minOrderTotal,
      usage_limit: usageLimit,
      expires_at: expiresAt,
      active: true
    })

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A coupon with this code already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
