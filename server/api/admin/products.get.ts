import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

  if (session !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event)

  let allProducts = []
  let from = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + batchSize - 1)

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    allProducts = allProducts.concat(data)

    if (data.length < batchSize) break
    from += batchSize
  }

  return { products: allProducts }
})