import { createHmac, timingSafeEqual } from 'node:crypto'

// Unsubscribe links carry the email and a signature made with a server-only secret, so only the
// person who got the email can use theirs, and nobody can unsubscribe someone else.
function secret() {
  const key = process.env.NEWSLETTER_SECRET || process.env.NUXT_SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!key) throw createError({ statusCode: 500, statusMessage: 'Newsletter secret is not configured' })
  return `newsletter-unsubscribe:${key}`
}

export function unsubscribeSignature(email: string) {
  return createHmac('sha256', secret()).update(email.trim().toLowerCase()).digest('hex').slice(0, 32)
}

export function isValidUnsubscribe(email: string, signature: string) {
  if (!email || !/^[0-9a-f]{32}$/.test(signature)) return false
  const expected = Buffer.from(unsubscribeSignature(email))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** The store page where the subscriber confirms (a button, so email scanners opening links don't unsubscribe anyone). */
export function unsubscribePageUrl(siteUrl: string, email: string) {
  return `${siteUrl}/unsubscribe?e=${encodeURIComponent(email)}&s=${unsubscribeSignature(email)}`
}

/** For the List-Unsubscribe header: mail apps post here directly from their own "Unsubscribe" button. */
export function unsubscribeApiUrl(siteUrl: string, email: string) {
  return `${siteUrl}/api/newsletter/unsubscribe?e=${encodeURIComponent(email)}&s=${unsubscribeSignature(email)}`
}
