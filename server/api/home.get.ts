import { serverSupabaseServiceRole } from '#supabase/server'

// The product shelves on the home page, store-style (Noon / Amazon): offers, new arrivals and one row
// per section. One request for the whole page, cached for a few minutes so a busy day (ads) doesn't hit
// the database on every visit; dashboard changes show up here within that time. Only products the store
// shows (with a photo, see storeVisibility.ts) and that are in stock.
const SECTIONS = ['makeup', 'skincare', 'perfume', 'haircare', 'kitchen', 'bags', 'accessories', 'hijab']
const PER_SHELF = 12
const MIN_SHELF = 4 // a section with fewer products gets no row
const FIELDS = 'id, sku, slug, name, name_en, brand, price, sale_price, image, badge, stock, category, subcategory, created_at'
// Products with colours open their page from the card instead of going straight to the cart.
const WITH_VARIANTS = `${FIELDS}, has_variants`

export default defineCachedEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const load = (fields: string) => {
    const shelf = () => client.from('products').select(fields).or(SHOWN_IN_STORE).gt('stock', 0).order('created_at', { ascending: false })
    return Promise.all([
      shelf().not('sale_price', 'is', null).limit(60),
      shelf().limit(16),
      ...SECTIONS.map((category) => shelf().eq('category', category).limit(PER_SHELF)),
    ])
  }

  let results = await load(WITH_VARIANTS)
  // 42703: has_variants isn't there until supabase_add_product_variants.sql is run.
  if (results.some((r) => r.error?.code === '42703')) results = await load(FIELDS)
  const [deals, newArrivals, ...sections] = results
  for (const result of results) {
    if (result.error) throw internalError(result.error)
  }

  const onSale = (deals.data ?? []).filter((p) => Number(p.sale_price) < Number(p.price)).slice(0, 16)
  const shelves = SECTIONS.map((slug, i) => ({ slug, products: sections[i].data ?? [] })).filter((s) => s.products.length >= MIN_SHELF)

  // Star ratings for every product on the page, in one query.
  const all = [...onSale, ...(newArrivals.data ?? []), ...shelves.flatMap((s) => s.products)]
  const ratings = new Map<string, number[]>()
  if (all.length) {
    const { data: reviews } = await client.from('reviews').select('product_id, rating').eq('approved', true).in('product_id', [...new Set(all.map((p) => p.id))])
    for (const r of reviews ?? []) {
      if (!r.product_id) continue
      if (!ratings.has(r.product_id)) ratings.set(r.product_id, [])
      ratings.get(r.product_id)!.push(r.rating)
    }
  }
  const withRating = <T extends { id: string }>(list: T[]) => list.map((p) => {
    const r = ratings.get(p.id)
    return { ...p, rating: r ? r.reduce((a, b) => a + b, 0) / r.length : null, reviewCount: r ? r.length : 0 }
  })

  return {
    deals: withRating(onSale),
    newArrivals: withRating(newArrivals.data ?? []),
    sections: shelves.map((s) => ({ slug: s.slug, products: withRating(s.products) })),
  }
}, { name: 'home-shelves', getKey: () => 'all', maxAge: 300, swr: true })
