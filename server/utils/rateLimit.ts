import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

// How many times one visitor (IP) may do each thing: [max, per seconds]. Generous for a real
// shopper, but a script can't flood the store. Counted in Supabase (supabase_rate_limits.sql),
// because Vercel runs several server copies that don't share memory.
const LIMITS = {
  order: [[6, 10 * 60], [20, 24 * 60 * 60]],
  payment: [[10, 10 * 60]],
  coupon: [[20, 10 * 60]],
  track: [[20, 10 * 60]],
  review: [[5, 60 * 60]],
  newsletter: [[5, 60 * 60]],
} satisfies Record<string, [number, number][]>

let warned = false

/** Throws a 429 when this visitor has done `action` too often. */
export async function rateLimit(event: H3Event, action: keyof typeof LIMITS) {
  // Vercel sets x-real-ip to the visitor's address (and overwrites any value the visitor sends).
  const ip = getRequestHeader(event, 'x-real-ip') || getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const client = serverSupabaseServiceRole(event)

  const results = await Promise.all(LIMITS[action].map(([max, seconds]) =>
    client.rpc('hit_rate_limit', { hit_key: `${action}:${seconds}:${ip}`, max_hits: max, window_seconds: seconds })))

  for (const { data: allowed, error } of results) {
    if (error) {
      // Not set up yet, or the database is busy: let the request through rather than block shoppers.
      if (!warned) console.error('Rate limit check failed (has supabase_rate_limits.sql been run?):', error.message)
      warned = true
      return
    }
    if (allowed === false) {
      throw customerError(429, 'tooManyRequests', 'Too many attempts. Please wait a few minutes and try again.')
    }
  }
}
