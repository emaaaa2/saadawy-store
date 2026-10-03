import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

function signedInWithOAuth(amr: unknown) {
  if (!Array.isArray(amr)) return false
  return amr.some((entry) => (typeof entry === 'string' ? entry : entry?.method) === 'oauth')
}

export function getOwnerEmails() {
  return String(useRuntimeConfig().adminEmails || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function sanitizePermissions(value: unknown): AdminPermission[] {
  if (!Array.isArray(value)) return []
  return ADMIN_PERMISSIONS.filter((permission) => value.includes(permission))
}

async function getAdminAccess(event: H3Event): Promise<{ signedIn: boolean; access: AdminAccess | null }> {
  const claims = await serverSupabaseUser(event).catch(() => null)
  if (!claims) return { signedIn: false, access: null }

  const email = typeof claims.email === 'string' ? claims.email.toLowerCase() : ''
  // Only trust the email when this session came from Google, so a password
  // sign-up that merely claims an admin's address can never pass.
  if (!email || !signedInWithOAuth(claims.amr)) return { signedIn: true, access: null }

  if (getOwnerEmails().includes(email)) {
    return { signedIn: true, access: { email, isOwner: true, permissions: [...ADMIN_PERMISSIONS] } }
  }

  const { data } = await serverSupabaseServiceRole(event)
    .from('admin_users')
    .select('permissions')
    .eq('email', email)
    .maybeSingle()

  if (!data) return { signedIn: true, access: null }
  return { signedIn: true, access: { email, isOwner: false, permissions: sanitizePermissions(data.permissions) } }
}

export async function requireAdmin(event: H3Event, permission?: AdminPermission) {
  const { signedIn, access } = await getAdminAccess(event)

  if (!signedIn) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (!access || (permission && !access.permissions.includes(permission))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return access
}

export async function requireOwner(event: H3Event) {
  const access = await requireAdmin(event)
  if (!access.isOwner) {
    throw createError({ statusCode: 403, statusMessage: 'Only the store owner can manage admins' })
  }
  return access
}
