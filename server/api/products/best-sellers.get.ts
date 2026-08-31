import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const serviceClient = serverSupabaseServiceRole(event)
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 24, 100)
  const category = query.category as string | undefined
  const search = query.search as string | undefined
  const sort = query.sort as string | undefined

  const { data: orders, error: ordersError } = await serviceClient
    .from('orders')
    .select('items')
    .neq('status', 'cancelled')

  if (ordersError) {
    throw createError({ statusCode: 500, statusMessage: ordersError.message })
  }

  const salesByProductId = new Map()

  for (const order of orders) {
    for (const item of order.items ?? []) {
      salesByProductId.set(item.id, (salesByProductId.get(item.id) || 0) + item.quantity)
    }
  }

  const soldIds = [...salesByProductId.keys()]

  if (soldIds.length === 0) {
    return { products: [], total: 0, page, totalPages: 1 }
  }

  let dbQuery = client
    .from('products')
    .select('*')
    .in('id', soldIds)

  if (category) {
    dbQuery = dbQuery.eq('category', category)
  }

  if (search) {
    dbQuery = dbQuery.ilike('name', `%${search}%`)
  }

  const { data: products, error: productsError } = await dbQuery

  if (productsError) {
    throw createError({ statusCode: 500, statusMessage: productsError.message })
  }

  let ranked = products.map((product) => ({ ...product, unitsSold: salesByProductId.get(product.id) }))

  if (sort === 'price_asc') {
    ranked.sort((a, b) => a.price - b.price)
  } else if (sort === 'price_desc') {
    ranked.sort((a, b) => b.price - a.price)
  } else if (sort === 'name_asc') {
    ranked.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    ranked.sort((a, b) => b.unitsSold - a.unitsSold)
  }

  const total = ranked.length
  const from = (page - 1) * limit
  let paged = ranked.slice(from, from + limit)

  const productIds = paged.map((p) => p.id)
  if (productIds.length > 0) {
    const { data: reviews } = await serviceClient
      .from('reviews')
      .select('product_id, rating')
      .eq('approved', true)
      .in('product_id', productIds)

    const ratingsByProduct = new Map()
    for (const r of reviews ?? []) {
      if (!r.product_id) continue
      if (!ratingsByProduct.has(r.product_id)) ratingsByProduct.set(r.product_id, [])
      ratingsByProduct.get(r.product_id).push(r.rating)
    }

    paged = paged.map((p) => {
      const ratings = ratingsByProduct.get(p.id)
      return {
        ...p,
        rating: ratings ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
        reviewCount: ratings ? ratings.length : 0
      }
    })
  }

  return {
    products: paged,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
})
