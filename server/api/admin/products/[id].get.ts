import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const productId = getRouterParam(event, 'id')

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (error) {
    throw adminError(404, 'productNotFound', 'Product not found')
  }

  const storedImages = await getStoredImageNames(event)
  const missingPhotos = [data.image, ...(data.images ?? [])].filter((url) => url && !hasStoredImage(url, storedImages))

  return { product: data, missingPhotos }
})
