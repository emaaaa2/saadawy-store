import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

const BUCKET = 'product-images'
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`
const CACHE_MS = 60 * 1000

let cache: { at: number; names: Set<string> } | null = null

/** File names in the product-images bucket, cached for a minute. */
export async function getStoredImageNames(event: H3Event) {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.names

  const storage = serverSupabaseServiceRole(event).storage.from(BUCKET)
  const names = new Set<string>()
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await storage.list('', { limit: 1000, offset })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    data.forEach((file) => names.add(file.name))
    if (data.length < 1000) break
  }

  cache = { at: Date.now(), names }
  return names
}

export function rememberStoredImage(name: string) {
  cache?.names.add(name)
}

/** False when the URL points into our bucket at a file that isn't there (or there's no URL). */
export function hasStoredImage(url: string | null | undefined, names: Set<string>) {
  if (!url) return false
  const index = url.indexOf(PUBLIC_PREFIX)
  if (index === -1) return true // Hosted somewhere else; assume it works.
  const name = decodeURIComponent(url.slice(index + PUBLIC_PREFIX.length).split('?')[0])
  return names.has(name)
}
