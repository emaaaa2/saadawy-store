import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'dashboard')

  const client = serverSupabaseServiceRole(event)

  const [ordersResult, lowStockResult, productsResult, outOfStockResult] = await Promise.all([
    client
      .from('orders')
      .select('id, order_number, customer_name, total, status, created_at, items')
      .order('created_at', { ascending: false }),
    client
      .from('products')
      .select('id, name, sku, stock, image', { count: 'exact' })
      .lte('stock', LOW_STOCK_LIMIT)
      .order('stock', { ascending: true })
      .limit(8),
    client.from('products').select('id', { count: 'exact', head: true }),
    client.from('products').select('id', { count: 'exact', head: true }).eq('stock', 0),
  ])

  const error = ordersResult.error || lowStockResult.error
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const orders = ordersResult.data ?? []
  const storedImages = await getStoredImageNames(event)
  const today = cairoDay()
  const month = today.slice(0, 7)
  const days = lastCairoDays(7)
  const daily = Object.fromEntries(days.map((day) => [day, { revenue: 0, orders: 0 }]))

  let todayRevenue = 0
  let todayOrders = 0
  let monthRevenue = 0
  let monthOrders = 0
  const sold: Record<string, { id: string; name: string; sold: number }> = {}

  for (const order of orders) {
    if (REVENUE_EXCLUDED_STATUSES.includes(order.status)) continue
    const day = cairoDay(order.created_at)

    if (day === today) {
      todayRevenue += order.total
      todayOrders++
    }
    if (day.startsWith(month)) {
      monthRevenue += order.total
      monthOrders++
    }
    if (daily[day]) {
      daily[day].revenue += order.total
      daily[day].orders++
    }
    for (const item of order.items ?? []) {
      sold[item.id] ??= { id: item.id, name: item.name, sold: 0 }
      sold[item.id].sold += item.quantity
    }
  }

  return {
    todayRevenue,
    todayOrders,
    monthRevenue,
    monthOrders,
    pendingCount: orders.filter((o) => o.status === 'pending').length,
    totalOrders: orders.length,
    totalProducts: productsResult.count ?? 0,
    lowStockCount: lowStockResult.count ?? 0,
    outOfStockCount: outOfStockResult.count ?? 0,
    lowStock: (lowStockResult.data ?? []).map((product) => ({
      ...product,
      photoMissing: !hasStoredImage(product.image, storedImages),
    })),
    topSelling: Object.values(sold).sort((a, b) => b.sold - a.sold).slice(0, 5),
    recentOrders: orders.slice(0, 6).map(({ items, ...order }) => ({ ...order, itemCount: items?.length ?? 0 })),
    last7Days: days.map((day) => ({ date: day, label: cairoDayLabel(day), ...daily[day] })),
  }
})
