import { serverSupabaseServiceRole } from '#supabase/server'

const OPEN_STATUSES = ['awaiting_payment', 'pending', 'confirmed']
const RECENT_DAYS = 90

// By default: every order still being worked on, plus finished ones from the last 3 months, so
// the page stays fast as orders pile up. `scope=all` loads everything; `q` searches all orders.
export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'orders')
  await cancelExpiredUnpaidOrders(event, { force: true })

  const client = serverSupabaseServiceRole(event)
  const query = getQuery(event)
  const search = String(query.q ?? '').replace(/[,()%*\\]/g, ' ').trim()
  const all = query.scope === 'all'
  const openId = typeof query.open === 'string' && query.open ? query.open : null
  const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const recentFilter = `status.in.(${OPEN_STATUSES.join(',')}),created_at.gte.${since}`

  let request = client.from('orders').select('*').order('created_at', { ascending: false })
  if (search) request = request.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,phone.ilike.%${search}%`).limit(300)
  else if (!all) request = request.or(recentFilter)

  const { data, error } = await request
  if (error) throw internalError(error)
  const orders = data ?? []

  // An order opened from a link (?open=) is shown even if it's older than the window.
  if (openId && !orders.some((o) => String(o.id) === openId)) {
    const { data: extra } = await client.from('orders').select('*').eq('id', openId).maybeSingle()
    if (extra) orders.push(extra)
  }

  let olderCount = 0
  if (!search && !all) {
    const { count } = await client
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .not('status', 'in', `(${OPEN_STATUSES.join(',')})`)
      .lt('created_at', since)
    olderCount = count ?? 0
  }

  return { orders, olderCount }
})
