export const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: 'mdi:cash' },
  { value: 'bank_transfer', label: 'Bank Transfer / Vodafone Cash', icon: 'mdi:bank-transfer' },
  { value: 'card', label: 'Pay by Card', icon: 'mdi:credit-card-outline' },
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value']

export interface StoreSettings {
  whatsappOrders: string
  whatsappSupport: string
  paymentMethods: Record<PaymentMethod, boolean>
  vodafoneCash: string
  instapay: string
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  address: string
  addressEn: string
  openingHours: string
  openingHoursAr: string
  deliveryTime: string
  deliveryTimeAr: string
  mapUrl: string
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
  welcomePopupEnabled: boolean
  welcomeCouponCode: string
  welcomeMessage: string
  welcomeMessageAr: string
}

export const STORE_SETTINGS_DEFAULTS: StoreSettings = {
  whatsappOrders: '01025287580',
  whatsappSupport: '01026051881',
  paymentMethods: { cash_on_delivery: true, bank_transfer: true, card: true },
  vodafoneCash: '',
  instapay: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  address: 'برج الحرميين، بجوار مستشفى وادي الطب، الشارع الجديد، بهتيم، قسم ثان شبرا الخيمة، محافظة القليوبية',
  addressEn: 'Al-Haramain Tower, next to Wadi El-Teb Hospital, El-Shareaa El-Gedid, Bahtim, Shubra El-Kheima 2, Qalyubia',
  openingHours: 'Open daily: 10:00 AM – 2:00 AM',
  openingHoursAr: 'مفتوح يوميًا من 10 الصبح لـ 2 بالليل',
  deliveryTime: '',
  deliveryTimeAr: '',
  mapUrl: 'https://maps.app.goo.gl/52oY7s4JVhZtr1g37',
  facebookUrl: 'https://www.facebook.com/share/17ssH5Rhek/?mibextid=wwXIfr',
  instagramUrl: 'https://www.instagram.com/saadawy_store?igsh=ejJ2aW5obnAyMGhn',
  tiktokUrl: 'https://tiktok.com/@saadawy.store',
  welcomePopupEnabled: true,
  welcomeCouponCode: 'WELCOME10',
  welcomeMessage: 'Enjoy 10% off your first order — just use the code below at checkout.',
  welcomeMessageAr: 'استمتع بخصم 10% على أول طلب — استخدم الكود ده عند الدفع.',
}

// Texts shown on the store in both languages: which field holds each language.
// (`address` was Arabic-only before, the others English-only, so the names differ.)
export const BILINGUAL_SETTINGS = {
  address: { en: 'addressEn', ar: 'address' },
  openingHours: { en: 'openingHours', ar: 'openingHoursAr' },
  deliveryTime: { en: 'deliveryTime', ar: 'deliveryTimeAr' },
  welcomeMessage: { en: 'welcomeMessage', ar: 'welcomeMessageAr' },
} as const

export type BilingualSetting = keyof typeof BILINGUAL_SETTINGS

/** The text in the given language, or the other language's text if that one is empty. */
export function settingText(settings: StoreSettings, name: BilingualSetting, lang: 'en' | 'ar') {
  const fields = BILINGUAL_SETTINGS[name]
  const other = lang === 'ar' ? 'en' : 'ar'
  return settings[fields[lang]] || settings[fields[other]] || ''
}

const TEXT_LIMITS: Partial<Record<keyof StoreSettings, number>> = {
  address: 300,
  addressEn: 300,
  openingHours: 120,
  openingHoursAr: 120,
  deliveryTime: 60,
  deliveryTimeAr: 60,
  welcomeMessage: 300,
  welcomeMessageAr: 300,
}

// Keeps only known keys with the right types, so stored settings can never break the storefront.
export function sanitizeStoreSettings(input: unknown): StoreSettings {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const result = structuredClone(STORE_SETTINGS_DEFAULTS)

  for (const key of Object.keys(STORE_SETTINGS_DEFAULTS) as (keyof StoreSettings)[]) {
    const value = source[key]
    if (value === undefined) continue

    if (key === 'paymentMethods') {
      const methods = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
      for (const method of PAYMENT_METHODS) {
        if (typeof methods[method.value] === 'boolean') result.paymentMethods[method.value] = methods[method.value] as boolean
      }
    } else if (key === 'welcomePopupEnabled') {
      if (typeof value === 'boolean') result.welcomePopupEnabled = value
    } else if (typeof value === 'string') {
      (result[key] as string) = value.trim().slice(0, TEXT_LIMITS[key] ?? 200)
    }
  }

  result.welcomeCouponCode = result.welcomeCouponCode.toUpperCase()
  return result
}

// "01025287580" or "+20 102 528 7580" -> "201025287580" for wa.me links.
export function toWhatsAppNumber(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('0')) return `2${digits}`
  return digits
}

export function enabledPaymentMethods(settings: StoreSettings) {
  return PAYMENT_METHODS.filter((method) => settings.paymentMethods[method.value])
}
