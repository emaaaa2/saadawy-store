import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 24, 100)
  const category = query.category as string | undefined
  const subcategory = query.subcategory as string | undefined
  const search = query.search as string | undefined
  const sort = query.sort as string | undefined

  const from = (page - 1) * limit
  const to = from + limit - 1

  function buildQuery(photosFirst: boolean) {
    let dbQuery = client
      .from('products')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (sort === 'price_asc') {
      dbQuery = dbQuery.order('price', { ascending: true })
    } else if (sort === 'price_desc') {
      dbQuery = dbQuery.order('price', { ascending: false })
    } else if (sort === 'name_asc') {
      dbQuery = dbQuery.order('name', { ascending: true })
    } else {
      // Default order: products that have a real photo first, newest first within each group.
      if (photosFirst) dbQuery = dbQuery.order('has_photo', { ascending: false })
      dbQuery = dbQuery.order('created_at', { ascending: false })
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    if (subcategory) {
      dbQuery = dbQuery.eq('subcategory', subcategory)
    }

    if (search) {
      dbQuery = dbQuery.ilike('name', `%${search}%`)
    }

    return dbQuery
  }

  let { data, error, count } = await buildQuery(true)

  // has_photo comes from supabase_add_product_has_photo.sql; work without it until that's run.
  if (error?.message.includes('has_photo')) {
    ({ data, error, count } = await buildQuery(false))
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  const productIds = (data ?? []).map((p) => p.id)
  let products = data

  if (productIds.length > 0) {
    const { data: reviews } = await client
      .from('reviews')
      .select('product_id, rating')
      .eq('approved', true)
      .in('product_id', productIds)

    const ratingsByProduct = new Map<string, number[]>()
    for (const r of reviews ?? []) {
      if (!r.product_id) continue
      if (!ratingsByProduct.has(r.product_id)) ratingsByProduct.set(r.product_id, [])
      ratingsByProduct.get(r.product_id)!.push(r.rating)
    }

    products = (data ?? []).map((p) => {
      const ratings = ratingsByProduct.get(p.id)
      return {
        ...p,
        rating: ratings ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
        reviewCount: ratings ? ratings.length : 0
      }
    })
  }

  return {
    products,
    total: count,
    page,
    totalPages: Math.ceil((count ?? 0) / limit)
  }
})