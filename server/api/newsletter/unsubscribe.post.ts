import { serverSupabaseServiceRole } from '#supabase/server'

// From the unsubscribe page (JSON body) or a mail app's one-click button (query string, RFC 8058).
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = getRequestHeader(event, 'content-type')?.includes('application/json') ? await readBody(event) : {}
  const email = String(body?.e ?? query.e ?? '').trim().toLowerCase()
  const signature = String(body?.s ?? query.s ?? '')

  if (!isValidUnsubscribe(email, signature)) {
    throw customerError(400, 'unsubscribeLink', 'This unsubscribe link is not valid')
  }

  const { error } = await serverSupabaseServiceRole(event).from('newsletter_subscribers').delete().eq('email', email)
  if (error) throw internalError(error)

  return { unsubscribed: true }
})
