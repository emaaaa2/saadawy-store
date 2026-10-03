// Served at /robots.txt. Points search engines at the sitemap on whatever
// domain SITE_URL is set to, so moving hosts or domains needs no code change.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string || 'https://saadawy-store.vercel.app').replace(/\/$/, '')

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    'User-Agent: *',
    'Disallow: /admin',
    'Disallow: /checkout',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
