import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

const BUCKET = 'product-images'
const PREFIX = `/storage/v1/object/public/${BUCKET}/`
// Names given by upload-image.post.ts: "{sku}-{time in base 36}{4 random}.webp". Photos added any
// other way (named by SKU) never match, so they are never touched here.
const DASHBOARD_UPLOAD = /^[\w-]+-[0-9a-z]{12}\.(webp|jpg|png|avif)$/
// Long enough that a product page left open with an unsaved photo doesn't lose it.
const KEEP_DAYS = 3
const RUN_EVERY_MS = 6 * 60 * 60 * 1000
let lastRun = 0

/**
 * Deletes photos uploaded from the dashboard that no product uses any more (removed from a
 * product, or uploaded and never saved), once they're a few days old. Runs at most every 6 hours.
 */
export async function cleanUpAbandonedUploads(event: H3Event) {
  if (Date.now() - lastRun < RUN_EVERY_MS) return
  lastRun = Date.now()

  try {
    const client = serverSupabaseServiceRole(event)
    const storage = client.storage.from(BUCKET)
    const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000

    const candidates: string[] = []
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await storage.list('', { limit: 1000, offset })
      if (error) throw error
      for (const file of data) {
        if (DASHBOARD_UPLOAD.test(file.name) && new Date(file.created_at).getTime() < cutoff) candidates.push(file.name)
      }
      if (data.length < 1000) break
    }
    if (!candidates.length) return

    const used = new Set<string>()
    const fileName = (url: unknown) => {
      const i = typeof url === 'string' ? url.indexOf(PREFIX) : -1
      return i === -1 ? null : decodeURIComponent((url as string).slice(i + PREFIX.length).split('?')[0])
    }
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client.from('products').select('image, images').range(from, from + 999)
      if (error) throw error
      for (const p of data) [p.image, ...(p.images ?? [])].forEach((url) => { const name = fileName(url); if (name) used.add(name) })
      if (data.length < 1000) break
    }

    const unused = candidates.filter((name) => !used.has(name))
    for (let i = 0; i < unused.length; i += 100) {
      const { error } = await storage.remove(unused.slice(i, i + 100))
      if (error) throw error
    }
    if (unused.length) console.log(`Removed ${unused.length} unused dashboard photo(s)`)
  } catch (error) {
    console.error('Cleaning up unused photos failed:', error)
  }
}
