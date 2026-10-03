import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'coupons')

  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { coupons: data }
})
