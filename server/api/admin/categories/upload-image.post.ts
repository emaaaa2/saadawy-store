// Category photos go in their own folder, so the clean-up of unused product uploads
// (abandonedUploads.ts, which only looks at the top of the bucket) never touches them.
export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const upload = await readImageUpload(event)
  const slug = upload.field('slug')
  if (!STORE_CATEGORIES.some((category) => category.slug === slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown category' })
  }

  const url = await storeImage(event, `${CATEGORY_IMAGE_FOLDER}/${slug}-${uploadStamp()}.${upload.extension}`, upload)
  return { url }
})
