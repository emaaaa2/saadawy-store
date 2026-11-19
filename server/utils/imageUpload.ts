import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export const IMAGE_BUCKET = 'product-images'
/** Folder in the bucket for the photos of Dashboard → Categories. */
export const CATEGORY_IMAGE_FOLDER = 'categories'
const MAX_BYTES = 4 * 1024 * 1024 // Vercel rejects request bodies over ~4.5 MB.
const EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
}

export interface ImageUpload {
  data: Buffer
  type: string
  extension: string
  /** A text field sent along with the image ('' if missing). */
  field: (name: string) => string
}

/** The image sent as the form field "file", checked for type and size. */
export async function readImageUpload(event: H3Event): Promise<ImageUpload> {
  const parts = await readMultipartFormData(event)
  const file = parts?.find((part) => part.name === 'file' && part.data?.length)

  if (!file) {
    throw adminError(400, 'chooseImage', 'Choose an image to upload')
  }
  const extension = EXTENSIONS[file.type ?? '']
  if (!extension) {
    throw adminError(400, 'imageType', 'Use a JPG, PNG, WebP or AVIF image')
  }
  if (file.data.length > MAX_BYTES) {
    throw adminError(413, 'imageTooLarge', 'Image is too large (max 4 MB)', { max: 4 })
  }

  return {
    data: file.data,
    type: file.type!,
    extension,
    field: (name) => parts?.find((part) => part.name === name)?.data.toString() ?? '',
  }
}

/** 12 characters from the time and chance, so a new photo never reuses an old (cached) link. */
export function uploadStamp() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** Saves the image at `path` in the photos bucket and returns its public link. */
export async function storeImage(event: H3Event, path: string, upload: ImageUpload) {
  const storage = serverSupabaseServiceRole(event).storage.from(IMAGE_BUCKET)

  const { error } = await storage.upload(path, upload.data, {
    contentType: upload.type,
    cacheControl: '31536000',
    upsert: false,
  })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return storage.getPublicUrl(path).data.publicUrl
}
