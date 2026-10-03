import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

// Falls back to the defaults if the table hasn't been created yet.
export async function getStoreSettings(event: H3Event): Promise<StoreSettings> {
  const { data } = await serverSupabaseServiceRole(event)
    .from('store_settings')
    .select('data')
    .eq('id', 1)
    .maybeSingle()

  return sanitizeStoreSettings(data?.data)
}
