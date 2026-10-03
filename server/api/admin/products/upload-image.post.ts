import { serverSupabaseServiceRole } from '#supabase/server'

const BUCKET = 'product-images'
const MAX_BYTES = 4 * 1024 * 1024 // Vercel rejects request bodies over ~4.5 MB.
const EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const parts = await readMultipartFormData(event)
  const file = parts?.find((part) => part.name === 'file' && part.data?.length)
  const sku = parts?.find((part) => part.name === 'sku')?.data.toString().replace(/[^\w-]/g, '').slice(0, 50)

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Choose an image to upload' })
  }
  const extension = EXTENSIONS[file.type ?? '']
  if (!extension) {
    throw createError({ statusCode: 400, statusMessage: 'Use a JPG, PNG, WebP or AVIF image' })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Image is too large (max 4 MB)' })
  }

  const path = `${sku || 'product'}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${extension}`
  const storage = serverSupabaseServiceRole(event).storage.from(BUCKET)

  const { error } = await storage.upload(path, file.data, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  rememberStoredImage(path)
  return { url: storage.getPublicUrl(path).data.publicUrl }
})
