import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const access = await requireOwner(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const permissions = sanitizePermissions(body.permissions)

  if (permissions.length === 0) {
    throw adminError(400, 'noSectionsLeft', 'Choose at least one section, or remove this admin instead')
  }

  const { data: before } = await serverSupabaseServiceRole(event).from('admin_users').select('email, permissions').eq('id', id).maybeSingle()
  const { data, error } = await serverSupabaseServiceRole(event)
    .from('admin_users')
    .update({ permissions })
    .eq('id', id)
    .select('id')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data?.length) {
    throw adminError(404, 'adminNotFound', 'Admin not found')
  }

  await logActivity(event, access.email, 'admin.permissions', before?.email ?? id, { from: before?.permissions ?? null, to: permissions })
  return { success: true }
})
