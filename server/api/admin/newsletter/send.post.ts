import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const access = await requireAdmin(event, 'newsletter')

  if (!config.resendApiKey) {
    throw adminError(500, 'emailNotConfigured', 'Email service is not configured yet (missing RESEND_API_KEY)', { setting: 'RESEND_API_KEY' })
  }
  if (!config.newsletterFromEmail) {
    throw adminError(500, 'emailNotConfigured', 'Email service is not configured yet (missing NEWSLETTER_FROM_EMAIL)', { setting: 'NEWSLETTER_FROM_EMAIL' })
  }

  const body = await readBody(event)
  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!subject) {
    throw adminError(400, 'subjectRequired', 'Please enter a subject')
  }
  if (!message) {
    throw adminError(400, 'messageRequired', 'Please enter a message')
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

  const siteUrl = config.public.siteUrl || 'https://saadawy-store.vercel.app'
  // Each subscriber gets their own unsubscribe link, in the footer and in the List-Unsubscribe
  // header that Gmail and other mail apps turn into their own "Unsubscribe" button.
  const htmlFor = (email: string) => `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #44564C;">Saadawy Store</h2>
      <div dir="auto" style="color: #333; line-height: 1.6; white-space: pre-line;">${escapeHtml(message)}</div>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999; line-height: 1.6;">
        <p dir="rtl" style="margin: 0 0 4px;">وصلك الإيميل ده عشان اشتركت في نشرة سعداوي. <a href="${unsubscribePageUrl(siteUrl, email)}" style="color: #8a6d3b;">إلغاء الاشتراك</a></p>
        <p style="margin: 0;">You're receiving this because you subscribed to Saadawy Store updates. <a href="${unsubscribePageUrl(siteUrl, email)}" style="color: #8a6d3b;">Unsubscribe</a></p>
      </div>
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
      html: htmlFor(s.email),
      headers: {
        'List-Unsubscribe': `<${unsubscribeApiUrl(siteUrl, s.email)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
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

  await logActivity(event, access.email, 'newsletter.send', null, { subject, sent: sentCount, failed: failedEmails.length })

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
