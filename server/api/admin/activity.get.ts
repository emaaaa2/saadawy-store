import { serverSupabaseServiceRole } from '#supabase/server'

// The dashboard activity log (supabase_admin_activity.sql). Store owner only.
export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const query = getQuery(event)
  const page = Math.max(Number(query.page) || 1, 1)
  const limit = 50
  const from = (page - 1) * limit
  const area = String(query.area ?? '')
  const search = String(query.search ?? '').replace(/[,()%*\\]/g, ' ').trim()

  let request = serverSupabaseServiceRole(event)
    .from('admin_activity')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)
  // area = the part before the dot: product, order, coupon, settings …
  if (/^[a-z]+$/.test(area)) request = request.like('action', `${area}%`)
  if (search) request = request.or(`target.ilike.%${search}%,admin_email.ilike.%${search}%`)

  const { data, error, count } = await request
  if (error) {
    if (error.code === '42P01' || error.message.includes('admin_activity')) {
      throw adminError(500, 'activitySql', 'Run supabase_admin_activity.sql in Supabase first')
    }
    throw internalError(error)
  }

  return { entries: data, total: count ?? 0, page, pageSize: limit, totalPages: Math.max(Math.ceil((count ?? 0) / limit), 1) }
})
