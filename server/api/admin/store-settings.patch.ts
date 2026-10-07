import { serverSupabaseServiceRole } from '#supabase/server'

const PHONE_FIELDS = ['whatsappOrders', 'whatsappSupport'] as const
const URL_FIELDS = ['mapUrl', 'facebookUrl', 'instagramUrl', 'tiktokUrl'] as const

export default defineEventHandler(async (event) => {
  await requireAdmin(event, 'settings')

  const settings = sanitizeStoreSettings(await readBody(event))

  for (const field of PHONE_FIELDS) {
    const digits = toWhatsAppNumber(settings[field])
    if (digits.length < 10 || digits.length > 15) {
      throw adminError(400, 'whatsappInvalid', 'Enter a valid WhatsApp number, e.g. 01012345678')
    }
  }
  for (const field of URL_FIELDS) {
    if (settings[field] && !/^https:\/\/\S+$/.test(settings[field])) {
      throw adminError(400, 'linksHttps', 'Links must start with https://')
    }
  }
  if (!enabledPaymentMethods(settings).length) {
    throw adminError(400, 'keepOnePayment', 'Keep at least one payment method turned on')
  }
  if (settings.welcomePopupEnabled && !settings.welcomeCouponCode) {
    throw adminError(400, 'welcomeCodeMissing', 'Add a coupon code for the welcome popup, or turn it off')
  }

  const updatedAt = new Date().toISOString()
  const { error } = await serverSupabaseServiceRole(event)
    .from('store_settings')
    .upsert({ id: 1, data: settings, updated_at: updatedAt })

  if (error) {
    const missingTable = error.code === '42P01' || error.message.includes('store_settings')
    throw missingTable
      ? adminError(500, 'settingsSql', 'Run supabase_add_store_settings.sql in Supabase first')
      : createError({ statusCode: 500, statusMessage: error.message })
  }

  return { settings, isSetUp: true, updatedAt }
})
