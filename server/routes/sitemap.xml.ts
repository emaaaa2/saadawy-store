import { serverSupabaseServiceRole } from '#supabase/server'

const STATIC_PAGES = [
  '',
  'about',
  'contact',
  'wishlist',
  'track-order',
  'category/skincare',
  'category/makeup',
  'category/haircare',
  'category/perfume',
  'category/bags',
  'category/kitchen',
  'category/hijab'
]

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string || 'https://saadawy-store.vercel.app').replace(/\/$/, '')

  const client = serverSupabaseServiceRole(event)

  const products: { slug: string; created_at: string }[] = []
  const batchSize = 1000
  let from = 0

  while (true) {
    const { data, error } = await client
      .from('products')
      .select('slug, created_at')
      .range(from, from + batchSize - 1)

    if (error || !data || data.length === 0) break

    products.push(...data)
    if (data.length < batchSize) break
    from += batchSize
  }

  const urls = [
    ...STATIC_PAGES.map((path) => ({
      loc: `${siteUrl}/${path}`,
      priority: path === '' ? '1.0' : '0.7'
    })),
    ...products.map((p) => ({
      loc: `${siteUrl}/product/${p.slug}`,
      lastmod: p.created_at?.slice(0, 10),
      priority: '0.6'
    }))
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})

function escapeXml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
