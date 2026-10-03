import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const row = readProductInput(await readBody(event))

  const { data, error } = await client
    .from('products')
    .insert({ ...row, slug: productSlug(row.sku as string | null, row.name as string) })
    .select()
    .single()

  if (error) throw productSaveError(error)

  return { product: data }
})
