import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const row = readProductInput(await readBody(event))

  const slug = productSlug(row.sku as string | null, row.name as string)
  const save = (values: Record<string, unknown>) => client
    .from('products')
    .insert({ ...values, slug })
    .select()
    .single()

  let { data, error } = await save(row)
  const fallback = error && isMissingTranslationColumns(error) ? withoutEmptyTranslations(row) : null
  if (fallback) ({ data, error } = await save(fallback))

  if (error) throw productSaveError(error)

  return { product: data }
})
