import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 12, 50)

  let dbQuery = client
    .from('reviews')
    .select('id, customer_name, location, rating, comment, created_at, product_id')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (query.productId) {
    dbQuery = dbQuery.eq('product_id', query.productId)
  }

  const { data, error } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { reviews: data }
})
