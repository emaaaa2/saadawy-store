import { serverSupabaseServiceRole } from '#supabase/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!EMAIL_REGEX.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid email address' })
  }

  const client = serverSupabaseServiceRole(event)

  const { error } = await client
    .from('newsletter_subscribers')
    .insert({ email })

  if (error) {
    if (error.code === '23505') {
      return { success: true, alreadySubscribed: true }
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, alreadySubscribed: false }
})
