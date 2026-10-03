import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'reports')

  const client = serverSupabaseServiceRole(event)

  const { data: orders, error } = await client
    .from('orders')
    .select('total, items, created_at, status, payment_method')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const today = cairoDay()
  const weekStart = cairoWeekStart()
  const month = today.slice(0, 7)
  const days = lastCairoDays(30)
  const daily = Object.fromEntries(days.map((day) => [day, { revenue: 0, orders: 0 }]))

  const totals = {
    todayRevenue: 0, todayOrders: 0,
    weekRevenue: 0, weekOrders: 0,
    monthRevenue: 0, monthOrders: 0,
    totalRevenue: 0, paidOrders: 0,
  }
  const statusCounts: Record<string, number> = {}
  const paymentRevenue: Record<string, { revenue: number; orders: number }> = {}
  const categoryRevenue: Record<string, number> = {}
  const productRevenue: Record<string, { id: string; name: string; sold: number; revenue: number }> = {}

  for (const order of orders ?? []) {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    if (REVENUE_EXCLUDED_STATUSES.includes(order.status)) continue

    const day = cairoDay(order.created_at)
    totals.totalRevenue += order.total
    totals.paidOrders++
    if (day === today) { totals.todayRevenue += order.total; totals.todayOrders++ }
    if (day >= weekStart) { totals.weekRevenue += order.total; totals.weekOrders++ }
    if (day.startsWith(month)) { totals.monthRevenue += order.total; totals.monthOrders++ }
    if (daily[day]) { daily[day].revenue += order.total; daily[day].orders++ }

    const method = order.payment_method || ''
    paymentRevenue[method] ??= { revenue: 0, orders: 0 }
    paymentRevenue[method].revenue += order.total
    paymentRevenue[method].orders++

    for (const item of order.items ?? []) {
      const itemTotal = (item.sale_price ?? item.price) * item.quantity
      const category = item.category || 'uncategorized'
      categoryRevenue[category] = (categoryRevenue[category] || 0) + itemTotal
      productRevenue[item.id] ??= { id: item.id, name: item.name, sold: 0, revenue: 0 }
      productRevenue[item.id].sold += item.quantity
      productRevenue[item.id].revenue += itemTotal
    }
  }

  return {
    ...totals,
    avgOrderValue: totals.paidOrders ? Math.round(totals.totalRevenue / totals.paidOrders) : 0,
    last30Days: days.map((day) => ({ date: day, label: cairoDayLabel(day), ...daily[day] })),
    statusCounts,
    paymentBreakdown: Object.entries(paymentRevenue)
      .map(([method, value]) => ({ method, ...value }))
      .sort((a, b) => b.revenue - a.revenue),
    topCategories: Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    topProducts: Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
  }
})
