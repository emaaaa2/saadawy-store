import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

  if (session !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data: orders, error: ordersError } = await client
    .from('orders')
    .select('items')

  if (ordersError) {
    throw createError({ statusCode: 500, statusMessage: ordersError.message })
  }

  const salesCount = {}
  for (const order of orders) {
    for (const item of order.items) {
      salesCount[item.id] = (salesCount[item.id] || 0) + item.quantity
      salesCount[`${item.id}_name`] = item.name
    }
  }

  const topSelling = Object.keys(salesCount)
    .filter(key => !key.endsWith('_name'))
    .map(id => ({
      id,
      name: salesCount[`${id}_name`],
      sold: salesCount[id]
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)

  const { data: lowStock, error: stockError } = await client
    .from('products')
    .select('id, name, stock')
    .lte('stock', 5)
    .order('stock', { ascending: true })

  if (stockError) {
    throw createError({ statusCode: 500, statusMessage: stockError.message })
  }

  const { count: totalProducts } = await client
  .from('products')
  .select('*', { count: 'exact', head: true })

const pendingCount = orders.filter((o) => o.status === 'pending').length


return {
  topSelling,
  lowStock,
  totalOrders: orders.length,
  totalProducts,
  pendingCount
}
})