import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')

  const { data: product, error: readError } = await client.from('products').select('*').eq('id', productId).maybeSingle()
  if (readError) throw internalError(readError)
  if (!product) throw adminError(404, 'productNotFound', 'This product no longer exists')

  // The whole product (photos, categories, English names) is saved in the activity log first, so
  // it can be restored from the dashboard. If that copy can't be saved, the product isn't deleted.
  let entryId: number
  try {
    entryId = await recordActivity(event, access.email, 'product.delete', product.sku ?? productId, { name: product.name, row: product })
  } catch (error) {
    console.error('Activity log failed before a delete:', error)
    throw adminError(500, 'activitySql', 'Run supabase_admin_activity.sql in Supabase first')
  }

  const { error } = await client.from('products').delete().eq('id', productId)
  if (error) {
    // Nothing was deleted: drop the log entry so it doesn't offer a restore.
    await client.from('admin_activity').delete().eq('id', entryId)
    throw internalError(error)
  }

  return { success: true }
})
