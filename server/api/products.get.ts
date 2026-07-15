import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 24
  const category = query.category as string | undefined
  const search = query.search as string | undefined

  const from = (page - 1) * limit
  const to = from + limit - 1

  let dbQuery = client
    .from('products')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (category) {
    dbQuery = dbQuery.eq('category', category)
  }

  if (search) {
    dbQuery = dbQuery.ilike('name', `%${search}%`)
  }

  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return {
    products: data,
    total: count,
    page,
    totalPages: Math.ceil((count ?? 0) / limit)
  }
})