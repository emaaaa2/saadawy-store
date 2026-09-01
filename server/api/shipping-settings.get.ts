import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('shipping_settings')
    .select('tier1_fee, tier2_fee, tier3_fee, free_shipping_threshold')
    .eq('id', 1)
    .single()

  if (error || !data) {
    return DEFAULT_SHIPPING_SETTINGS
  }

  return data
})
