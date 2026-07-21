import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

  if (session !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event)
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 50
  const search = query.search
  const category = query.category

  const from = (page - 1) * limit
  const to = from + limit - 1

  let dbQuery = client
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    dbQuery = dbQuery.ilike('name', `%${search}%`)
  }

  if (category && category !== 'all') {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    products: data,
    total: count,
    page,
    totalPages: Math.ceil((count ?? 0) / limit)
  }
})