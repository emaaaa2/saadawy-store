import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'coupons')

  const body = await readBody(event)
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''

  if (!code || !/^[A-Z0-9_-]{3,30}$/.test(code)) {
    throw adminError(400, 'couponCodeFormat', 'Code must be 3-30 letters/numbers, no spaces')
  }

  const client = serverSupabaseServiceRole(event)

  const row = { code, ...readCouponInput(body), active: true }
  const { error } = await client
    .from('coupons')
    .insert(row)

  if (error) {
    if (error.code === '23505') {
      throw adminError(409, 'couponExists', 'A coupon with this code already exists')
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logActivity(event, access.email, 'coupon.create', code, row)
  return { success: true }
})
