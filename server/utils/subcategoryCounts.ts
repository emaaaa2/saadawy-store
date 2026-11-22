import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

/** How many products use each type, by category: { makeup: { lips: 12, … }, … }. */
export async function getSubcategoryCounts(event: H3Event) {
  const client = serverSupabaseServiceRole(event)
  const counts: Record<string, Record<string, number>> = {}
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client.from('products').select('category, subcategory').not('subcategory', 'is', null).range(from, from + 999)
    if (error) throw internalError(error)
    for (const p of data ?? []) {
      const inCategory = (counts[p.category] ??= {})
      inCategory[p.subcategory] = (inCategory[p.subcategory] ?? 0) + 1
    }
    if ((data ?? []).length < 1000) break
  }
  return counts
}

/** Every category's types as the dashboard and the store show them (saved list or defaults). */
export function allSubcategories(settings: StoreSettings) {
  return Object.fromEntries(STORE_CATEGORIES.map(({ slug }) => [slug, subcategoriesFor(settings, slug)]))
}
