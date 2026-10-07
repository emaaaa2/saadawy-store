import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')
  const updates = readProductInput(await readBody(event), { partial: true })

  if (!Object.keys(updates).length) {
    throw adminError(400, 'nothingToUpdate', 'Nothing to update')
  }

  const save = (row: Record<string, unknown>) => client
    .from('products')
    .update(row)
    .eq('id', productId)
    .select()
    .single()

  let { data, error } = await save(updates)
  const fallback = error && isMissingTranslationColumns(error) ? withoutEmptyTranslations(updates) : null
  if (fallback && Object.keys(fallback).length) ({ data, error } = await save(fallback))

  if (error) throw productSaveError(error)

  return { product: data }
})
