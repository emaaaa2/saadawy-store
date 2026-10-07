import { serverSupabaseServiceRole } from '#supabase/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const body = await readBody(event)
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!EMAIL_REGEX.test(email)) {
    throw adminError(400, 'invalidEmail', 'Enter a valid email address')
  }
  if (getOwnerEmails().includes(email)) {
    throw adminError(400, 'ownerEmail', 'This email is the store owner and already has full access')
  }

  const permissions = sanitizePermissions(body.permissions)
  if (permissions.length === 0) {
    throw adminError(400, 'chooseSection', 'Choose at least one section this admin can access')
  }

  const { data, error } = await serverSupabaseServiceRole(event)
    .from('admin_users')
    .insert({ email, permissions })
    .select('id, email, permissions, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw adminError(409, 'alreadyAdmin', 'This email is already an admin')
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { admin: data }
})
