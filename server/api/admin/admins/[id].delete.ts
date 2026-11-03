import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const access = await requireOwner(event)

  const { data, error } = await serverSupabaseServiceRole(event)
    .from('admin_users')
    .delete()
    .eq('id', getRouterParam(event, 'id'))
    .select('email, permissions')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (data?.length) await logActivity(event, access.email, 'admin.remove', data[0].email, { permissions: data[0].permissions })
  return { success: true }
})
