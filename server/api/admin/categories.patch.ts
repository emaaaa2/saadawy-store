import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

// Saves the categories' names and photos and their types (subcategories), kept in store_settings
// next to the other settings. Body: { categories, subcategories: { makeup: [{ value?, label, labelAr }], … } }.
// A type without a value is new and gets one here; a type left out is removed, and its products
// stay in their category without a type.
export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'products')
  const body = (await readBody(event)) ?? {}
  const before = await getStoreSettings(event)

  const categories = body.categories && typeof body.categories === 'object' ? sanitizeCategories(body.categories) : before.categories
  const subcategories = body.subcategories && typeof body.subcategories === 'object'
    ? { ...before.subcategories, ...sanitizeSubcategories(withValues(body.subcategories)) }
    : before.subcategories
  const after = { ...before, categories, subcategories }

  const client = serverSupabaseServiceRole(event)
  const updatedAt = new Date().toISOString()
  const { error } = await client.from('store_settings').upsert({ id: 1, data: after, updated_at: updatedAt })

  if (error) {
    const missingTable = error.code === '42P01' || error.message.includes('store_settings')
    throw missingTable
      ? adminError(500, 'settingsSql', 'Run supabase_add_store_settings.sql in Supabase first')
      : createError({ statusCode: 500, statusMessage: error.message })
  }

  // Products of a removed type stay in their category, without a type.
  let cleared = 0
  for (const { slug } of STORE_CATEGORIES) {
    const kept = new Set(subcategoriesFor(after, slug).map((s) => s.value))
    const removed = subcategoriesFor(before, slug).map((s) => s.value).filter((value) => !kept.has(value))
    if (!removed.length) continue
    const { data, error: clearError } = await client.from('products').update({ subcategory: null }).eq('category', slug).in('subcategory', removed).select('id')
    if (clearError) throw internalError(clearError)
    cleared += data?.length ?? 0
  }

  // One log entry per category that changed (name, photo or types).
  const names = (list: Subcategory[]) => list.map((s) => s.labelAr || s.label).join('، ') || null
  const columns = (settings: StoreSettings, slug: StoreCategory) => {
    const c = settings.categories[slug]
    return { name: c?.nameAr || null, name_en: c?.nameEn || null, photo: c?.image || null, subcategories: names(subcategoriesFor(settings, slug)) }
  }
  for (const { slug } of STORE_CATEGORIES) {
    const changes = changedColumns(columns(before, slug), columns(after, slug))
    if (Object.keys(changes).length) await logActivity(event, access.email, 'category.update', slug, { changes })
  }

  await removeUnusedCategoryImages(event, categories)
  return {
    categories,
    subcategories: allSubcategories(after),
    subcategoryCounts: await getSubcategoryCounts(event),
    cleared,
    updatedAt,
  }
})

// New types (no value yet) get one from their English name, or "type-xxxx" with only an Arabic
// name; never one already used in the same category.
function withValues(input: Record<string, unknown>) {
  const result: Record<string, unknown[]> = {}
  for (const [slug, list] of Object.entries(input)) {
    if (!Array.isArray(list)) continue
    const items = list.map((item) => (item && typeof item === 'object' ? { ...(item as Record<string, unknown>) } : {})) as Record<string, unknown>[]
    const taken = new Set(items.map((i) => (typeof i.value === 'string' ? i.value : '')).filter(Boolean))
    for (const item of items) {
      if (typeof item.value === 'string' && item.value) continue
      const base = subcategorySlug(String(item.label ?? ''))
      let value = base || `type-${Math.random().toString(36).slice(2, 6)}`
      for (let n = 2; taken.has(value); n++) value = base ? `${base}-${n}` : `type-${Math.random().toString(36).slice(2, 6)}`
      taken.add(value)
      item.value = value
    }
    result[slug] = items
  }
  return result
}

const DAY_MS = 24 * 60 * 60 * 1000

// Photos replaced, or uploaded and then not saved. Only ones older than a day, so a photo
// another admin has just uploaded and not saved yet stays.
async function removeUnusedCategoryImages(event: H3Event, categories: StoreSettings['categories']) {
  try {
    const storage = serverSupabaseServiceRole(event).storage.from(IMAGE_BUCKET)
    const { data, error } = await storage.list(CATEGORY_IMAGE_FOLDER, { limit: 1000 })
    if (error || !data) return

    const used = new Set(Object.values(categories).map((c) => decodeURIComponent(c.image.split('?')[0].split('/').pop() ?? '')))
    const unused = data.filter((file) => file.id && !used.has(file.name) && Date.now() - new Date(file.created_at).getTime() > DAY_MS)
    if (unused.length) await storage.remove(unused.map((file) => `${CATEGORY_IMAGE_FOLDER}/${file.name}`))
  } catch (error) {
    console.error('Removing unused category photos failed:', error instanceof Error ? error.message : error)
  }
}
