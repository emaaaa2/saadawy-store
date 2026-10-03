import { serverSupabaseServiceRole } from '#supabase/server'

const SORTS = {
  newest: { column: 'created_at', ascending: false },
  name: { column: 'name', ascending: true },
  stock: { column: 'stock', ascending: true },
  price: { column: 'price', ascending: false },
} as const

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'products')

  const client = serverSupabaseServiceRole(event)
  const query = getQuery(event)

  const page = Math.max(Number(query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100)
  // Characters that would break the PostgREST filter syntax.
  const search = String(query.search ?? '').replace(/[,()%*\\]/g, ' ').trim()
  const category = String(query.category ?? '')
  const stock = String(query.stock ?? '')
  const photo = String(query.photo ?? '')
  const sort = SORTS[String(query.sort) as keyof typeof SORTS] ?? SORTS.newest

  const from = (page - 1) * limit
  const to = from + limit - 1

  // Same filters for the full query and for the id-only scan used by the photo filter.
  function filtered(dbQuery: any) {
    let q = dbQuery.order(sort.column, { ascending: sort.ascending }).order('id')
    if (search) q = q.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`)
    if (category && category !== 'all') q = q.eq('category', category)
    if (stock === 'low') q = q.lte('stock', LOW_STOCK_LIMIT)
    else if (stock === 'out') q = q.eq('stock', 0)
    else if (stock === 'in') q = q.gt('stock', LOW_STOCK_LIMIT)
    return q
  }

  const storedImages = await getStoredImageNames(event)
  let products: any[]
  let total: number

  if (photo === 'missing' || photo === 'has') {
    // Whether a photo file exists isn't in the database, so find the matching ids first.
    const wantPhoto = photo === 'has'
    const ids: string[] = []
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await filtered(client.from('products').select('id, image')).range(offset, offset + 999)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      for (const row of data) {
        if (hasStoredImage(row.image, storedImages) === wantPhoto) ids.push(row.id)
      }
      if (data.length < 1000) break
    }

    const pageIds = ids.slice(from, to + 1)
    const { data, error } = pageIds.length
      ? await client.from('products').select('*').in('id', pageIds)
      : { data: [], error: null }
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    const position = new Map(pageIds.map((id, index) => [id, index]))
    products = (data ?? []).sort((a, b) => position.get(a.id)! - position.get(b.id)!)
    total = ids.length
  } else {
    const { data, error, count } = await filtered(client.from('products').select('*', { count: 'exact' })).range(from, to)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    products = data ?? []
    total = count ?? 0
  }

  return {
    products: products.map((product) => ({ ...product, photoMissing: !hasStoredImage(product.image, storedImages) })),
    total,
    page,
    pageSize: limit,
    totalPages: Math.max(Math.ceil(total / limit), 1)
  }
})
