import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

// Saves the categories' names and photos (kept in store_settings next to the other settings).
export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'products')
  const body = await readBody(event)
  const categories = sanitizeCategories(body?.categories)

  const before = await getStoreSettings(event)
  const updatedAt = new Date().toISOString()
  const { error } = await serverSupabaseServiceRole(event)
    .from('store_settings')
    .upsert({ id: 1, data: { ...before, categories }, updated_at: updatedAt })

  if (error) {
    const missingTable = error.code === '42P01' || error.message.includes('store_settings')
    throw missingTable
      ? adminError(500, 'settingsSql', 'Run supabase_add_store_settings.sql in Supabase first')
      : createError({ statusCode: 500, statusMessage: error.message })
  }

  // One log entry per category that changed.
  const columns = (c: CategoryCustomization | undefined) => ({ name: c?.nameAr || null, name_en: c?.nameEn || null, photo: c?.image || null })
  for (const { slug } of STORE_CATEGORIES) {
    const changes = changedColumns(columns(before.categories[slug]), columns(categories[slug]))
    if (Object.keys(changes).length) await logActivity(event, access.email, 'category.update', slug, { changes })
  }

  await removeUnusedCategoryImages(event, categories)
  return { categories, updatedAt }
})

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
