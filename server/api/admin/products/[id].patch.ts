import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')
  const updates = readProductInput(await readBody(event), { partial: true })

  if (!Object.keys(updates).length) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  const { data, error } = await client
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) throw productSaveError(error)

  return { product: data }
})
