import { serverSupabaseServiceRole } from '#supabase/server'

// Puts a deleted product back exactly as it was (same id, link, photos, categories).
export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'products')
  const client = serverSupabaseServiceRole(event)

  const { data: entry, error } = await client.from('admin_activity').select('*').eq('id', getRouterParam(event, 'id')).maybeSingle()
  if (error) throw internalError(error)
  if (!entry || entry.action !== 'product.delete' || !entry.details?.row) {
    throw adminError(400, 'cannotRestore', 'Only deleted products can be restored')
  }

  const { has_photo: _hasPhoto, ...row } = entry.details.row // worked out again when it's saved
  // A product with colours comes back without stock; adding its colours back sets the total again.
  const variants: Record<string, unknown>[] = Array.isArray(entry.details.variants) ? entry.details.variants : []
  if (variants.length) Object.assign(row, { stock: 0, has_variants: false })

  const { data: back, error: insertError } = await client.from('products').insert(row).select('id, sku, name').single()
  if (insertError) {
    if (insertError.code === '23505') {
      throw adminError(409, 'restoreTaken', 'This product is already back, or another product now uses its SKU or link')
    }
    throw internalError(insertError)
  }

  if (variants.length) {
    const { error: variantsError } = await client.from('product_variants').insert(variants)
    if (variantsError) console.error('Restoring the colours failed:', variantsError.message)
  }

  await logActivity(event, access.email, 'product.restore', back.sku ?? back.id, { name: back.name, from_entry: entry.id })
  return { product: back }
})
