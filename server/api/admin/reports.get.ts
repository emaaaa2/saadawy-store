import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

if (session !== config.sessionSecret) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data: orders, error } = await client
    .from('orders')
    .select('total, items, created_at, status')
    .neq('status', 'cancelled')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let todayRevenue = 0
  let weekRevenue = 0
  let monthRevenue = 0
  let todayOrders = 0
  let weekOrders = 0
  let monthOrders = 0

  const dailySales = {}
  const categoryRevenue = {}

  for (const order of orders) {
    const orderDate = new Date(order.created_at)

    if (orderDate >= startOfToday) {
      todayRevenue += order.total
      todayOrders++
    }
    if (orderDate >= startOfWeek) {
      weekRevenue += order.total
      weekOrders++
    }
    if (orderDate >= startOfMonth) {
      monthRevenue += order.total
      monthOrders++
    }

    const dayKey = orderDate.toISOString().split('T')[0]
    dailySales[dayKey] = (dailySales[dayKey] || 0) + order.total

    for (const item of order.items) {
      const category = item.category || 'uncategorized'
      const itemTotal = (item.sale_price ?? item.price) * item.quantity
      categoryRevenue[category] = (categoryRevenue[category] || 0) + itemTotal
    }
  }

  const last14Days = []
  for (let i = 13; i >= 0; i--) {
    const date = new Date(startOfToday)
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split('T')[0]
    last14Days.push({
      date: key,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dailySales[key] || 0
    })
  }

  const topCategories = Object.entries(categoryRevenue)
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)

  return {
    todayRevenue,
    weekRevenue,
    monthRevenue,
    todayOrders,
    weekOrders,
    monthOrders,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length) : 0,
    last14Days,
    topCategories
  }
})