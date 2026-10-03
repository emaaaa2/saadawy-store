import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const { data, error } = await serverSupabaseServiceRole(event)
    .from('admin_users')
    .select('id, email, permissions, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    owners: getOwnerEmails(),
    admins: (data ?? []).map((admin) => ({ ...admin, permissions: sanitizePermissions(admin.permissions) }))
  }
})
