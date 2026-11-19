export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const upload = await readImageUpload(event)
  const sku = upload.field('sku').replace(/[^\w-]/g, '').slice(0, 50)

  const path = `${sku || 'product'}-${uploadStamp()}.${upload.extension}`
  const url = await storeImage(event, path, upload)

  rememberStoredImage(path)
  return { url }
})
