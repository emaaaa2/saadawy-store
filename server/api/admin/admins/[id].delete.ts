import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const { error } = await serverSupabaseServiceRole(event)
    .from('admin_users')
    .delete()
    .eq('id', getRouterParam(event, 'id'))

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
