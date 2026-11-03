import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'coupons')

  const id = getRouterParam(event, 'id')
  const updates = readCouponInput(await readBody(event), { partial: true })

  if (!Object.keys(updates).length) {
    throw adminError(400, 'nothingToUpdate', 'Nothing to update')
  }

  const client = serverSupabaseServiceRole(event)

  const { data: before } = await client.from('coupons').select('*').eq('id', id).maybeSingle()
  const { error } = await client
    .from('coupons')
    .update(updates)
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  await logActivity(event, access.email, 'coupon.update', before?.code ?? id, { changes: changedColumns(before ?? {}, updates) })

  return { success: true }
})
