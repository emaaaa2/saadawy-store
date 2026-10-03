import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const permissions = sanitizePermissions(body.permissions)

  if (permissions.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Choose at least one section, or remove this admin instead' })
  }

  const { data, error } = await serverSupabaseServiceRole(event)
    .from('admin_users')
    .update({ permissions })
    .eq('id', id)
    .select('id')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Admin not found' })
  }

  return { success: true }
})
