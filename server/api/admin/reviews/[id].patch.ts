import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const access = await requireAdmin(event, 'reviews')

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (typeof body.approved !== 'boolean') {
    throw adminError(400, 'invalidRequest', 'approved must be a boolean')
  }

  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('reviews')
    .update({ approved: body.approved })
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logActivity(event, access.email, body.approved ? 'review.approve' : 'review.hide', id)
  return { success: true }
})
