import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'settings')

  const { data, error } = await serverSupabaseServiceRole(event)
    .from('store_settings')
    .select('data, updated_at')
    .eq('id', 1)
    .maybeSingle()

  return {
    settings: sanitizeStoreSettings(data?.data),
    // False until supabase_add_store_settings.sql has been run.
    isSetUp: !error && !!data,
    updatedAt: data?.updated_at ?? null,
  }
})
