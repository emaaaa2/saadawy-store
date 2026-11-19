export const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: 'mdi:cash' },
  { value: 'bank_transfer', label: 'Mobile Wallet / InstaPay', icon: 'mdi:wallet-outline' },
  { value: 'card', label: 'Pay by Card', icon: 'mdi:credit-card-outline' },
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value']

// The store's categories in menu order, with the photo and icon they have until the dashboard
// (Dashboard → Categories) gives them another name or photo.
export const STORE_CATEGORIES = [
  { slug: 'skincare', icon: 'mdi:water-outline', image: '/images/skincare.jpg' },
  { slug: 'makeup', icon: 'mdi:lipstick', image: '/images/makeup.jpg' },
  { slug: 'haircare', icon: 'mdi:hair-dryer', image: '/images/pic.jpg' },
  { slug: 'perfume', icon: 'mdi:spray-bottle', image: '/images/perfume1.jpg' },
  { slug: 'bags', icon: 'mdi:bag-personal-outline', image: '/images/bag.jpg' },
  { slug: 'kitchen', icon: 'mdi:pot-mix-outline', image: '/images/kitchen.jpg' },
  { slug: 'hijab', icon: 'mdi:tshirt-crew-outline', image: '/images/hijab.jpg' },
  { slug: 'accessories', icon: 'mdi:necklace', image: '/images/hijab2.jpg' },
] as const

export type StoreCategory = (typeof STORE_CATEGORIES)[number]['slug']

/** What the dashboard changed for a category; an empty field keeps the default name or photo. */
export interface CategoryCustomization {
  nameAr: string
  nameEn: string
  image: string
}

export const CATEGORY_NAME_LIMIT = 40

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
  whatsappChannelUrl: string
  welcomePopupEnabled: boolean
  welcomeCouponCode: string
  welcomeMessage: string
  welcomeMessageAr: string
  categories: Partial<Record<StoreCategory, CategoryCustomization>>
}

export const STORE_SETTINGS_DEFAULTS: StoreSettings = {
  whatsappOrders: '01114939842',
  whatsappSupport: '01114939842',
  paymentMethods: { cash_on_delivery: true, bank_transfer: true, card: true },
  vodafoneCash: '',
  instapay: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  address: 'برج الحرميين، بجوار مستشفى وادي الطب، أعلى فرع أورانج، الشارع الجديد، بهتيم، قسم ثان شبرا الخيمة، محافظة القليوبية',
  addressEn: 'Al-Haramain Tower, next to Wadi El-Teb Hospital, above the Orange branch, El-Shareaa El-Gedid, Bahtim, Shubra El-Kheima 2, Qalyubia',
  openingHours: 'Open daily: 10:00 AM – 2:00 AM',
  openingHoursAr: 'مفتوح يوميًا من 10 الصبح لـ 2 بالليل',
  deliveryTime: '',
  deliveryTimeAr: '',
  mapUrl: 'https://maps.app.goo.gl/52oY7s4JVhZtr1g37',
  facebookUrl: 'https://www.facebook.com/SaadawysStore',
  instagramUrl: 'https://www.instagram.com/saadawy_store/',
  tiktokUrl: 'https://www.tiktok.com/@saadawystore',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029VbD3FFY5kg7196r1ie0H',
  welcomePopupEnabled: true,
  welcomeCouponCode: 'WELCOME10',
  welcomeMessage: 'Enjoy 10% off your first order — just use the code below at checkout.',
  welcomeMessageAr: 'استمتع بخصم 10% على أول طلب — استخدم الكود ده عند الدفع.',
  categories: {},
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
    } else if (key === 'categories') {
      result.categories = sanitizeCategories(value)
    } else if (key === 'welcomePopupEnabled') {
      if (typeof value === 'boolean') result.welcomePopupEnabled = value
    } else if (typeof value === 'string') {
      (result[key] as string) = value.trim().slice(0, TEXT_LIMITS[key] ?? 200)
    }
  }

  result.welcomeCouponCode = result.welcomeCouponCode.toUpperCase()
  return result
}

/** Only the store's categories, names cut to length, photos only as https links; untouched ones are left out. */
export function sanitizeCategories(input: unknown): StoreSettings['categories'] {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const text = (value: unknown, limit: number) => (typeof value === 'string' ? value.trim().slice(0, limit) : '')
  const result: StoreSettings['categories'] = {}

  for (const { slug } of STORE_CATEGORIES) {
    const entry = (source[slug] && typeof source[slug] === 'object' ? source[slug] : {}) as Record<string, unknown>
    const image = text(entry.image, 500)
    const customization: CategoryCustomization = {
      nameAr: text(entry.nameAr, CATEGORY_NAME_LIMIT),
      nameEn: text(entry.nameEn, CATEGORY_NAME_LIMIT),
      image: /^https:\/\/\S+$/.test(image) ? image : '',
    }
    if (customization.nameAr || customization.nameEn || customization.image) result[slug] = customization
  }
  return result
}

// "01114939842" or "+20 111 493 9842" -> "201114939842" for wa.me links.
export function toWhatsAppNumber(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('0')) return `2${digits}`
  return digits
}

export function enabledPaymentMethods(settings: StoreSettings) {
  return PAYMENT_METHODS.filter((method) => settings.paymentMethods[method.value])
}
