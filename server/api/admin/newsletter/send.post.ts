import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdminSession(event, config.sessionSecret)

  if (!config.resendApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Email service is not configured yet (missing RESEND_API_KEY)' })
  }
  if (!config.newsletterFromEmail) {
    throw createError({ statusCode: 500, statusMessage: 'Email service is not configured yet (missing NEWSLETTER_FROM_EMAIL)' })
  }

  const body = await readBody(event)
  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!subject) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a subject' })
  }
  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a message' })
  }

  const client = serverSupabaseServiceRole(event)
  const { data: subscribers, error } = await client
    .from('newsletter_subscribers')
    .select('email')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (!subscribers || subscribers.length === 0) {
    return { success: true, sent: 0 }
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #44564C;">Saadawy Store</h2>
      <div style="color: #333; line-height: 1.6; white-space: pre-line;">${escapeHtml(message)}</div>
      <p style="margin-top: 32px; font-size: 12px; color: #999;">
        You're receiving this because you subscribed to Saadawy Store updates.
      </p>
    </div>
  `

  const batches = []
  for (let i = 0; i < subscribers.length; i += 100) {
    batches.push(subscribers.slice(i, i + 100))
  }

  let sentCount = 0
  const failedEmails = []

  for (const batch of batches) {
    const payload = batch.map((s) => ({
      from: config.newsletterFromEmail,
      to: [s.email],
      subject,
      html
    }))

    try {
      const response = await $fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`
        },
        body: payload
      })
      sentCount += Array.isArray(response?.data) ? response.data.length : batch.length
    } catch (err) {
      failedEmails.push(...batch.map((s) => s.email))
    }
  }

  return {
    success: true,
    sent: sentCount,
    failed: failedEmails.length,
    total: subscribers.length
  }
})

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
