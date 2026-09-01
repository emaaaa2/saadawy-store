import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const body = await readBody(event)

  const fields = ['tier1_fee', 'tier2_fee', 'tier3_fee', 'free_shipping_threshold'] as const
  const update: Record<string, number> = {}

  for (const field of fields) {
    const value = Number(body[field])
    if (!Number.isFinite(value) || value < 0) {
      throw createError({ statusCode: 400, statusMessage: `Invalid value for ${field}` })
    }
    update[field] = value
  }

  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('shipping_settings')
    .update(update)
    .eq('id', 1)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
