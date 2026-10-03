import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

function signedInWithOAuth(amr: unknown) {
  if (!Array.isArray(amr)) return false
  return amr.some((entry) => (typeof entry === 'string' ? entry : entry?.method) === 'oauth')
}

export async function requireAdmin(event: H3Event) {
  const claims = await serverSupabaseUser(event).catch(() => null)
  if (!claims) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const allowedEmails = String(useRuntimeConfig().adminEmails || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const email = typeof claims.email === 'string' ? claims.email.toLowerCase() : ''

  // Only trust the email when this session came from Google, so a password
  // sign-up that merely claims an admin's address can never pass.
  if (!email || !allowedEmails.includes(email) || !signedInWithOAuth(claims.amr)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return claims
}
