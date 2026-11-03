import { serverSupabaseServiceRole } from '#supabase/server'

// Puts a deleted product back exactly as it was (same id, link, photos, categories). Owner only.
export default defineEventHandler(async (event) => {
  const access = await requireOwner(event)
  const client = serverSupabaseServiceRole(event)

  const { data: entry, error } = await client.from('admin_activity').select('*').eq('id', getRouterParam(event, 'id')).maybeSingle()
  if (error) throw internalError(error)
  if (!entry || entry.action !== 'product.delete' || !entry.details?.row) {
    throw adminError(400, 'cannotRestore', 'Only deleted products can be restored')
  }

  const { has_photo: _hasPhoto, ...row } = entry.details.row // worked out again when it's saved
  const { data: back, error: insertError } = await client.from('products').insert(row).select('id, sku, name').single()
  if (insertError) {
    if (insertError.code === '23505') {
      throw adminError(409, 'restoreTaken', 'This product is already back, or another product now uses its SKU or link')
    }
    throw internalError(insertError)
  }

  await logActivity(event, access.email, 'product.restore', back.sku ?? back.id, { name: back.name, from_entry: entry.id })
  return { product: back }
})
