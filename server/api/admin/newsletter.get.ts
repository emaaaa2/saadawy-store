import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  const client = serverSupabaseServiceRole(event)
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await client
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    subscribers: data,
    total: count,
    page,
    totalPages: Math.ceil((count ?? 0) / limit)
  }
})
