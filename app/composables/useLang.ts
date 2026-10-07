// The site language, on top of @nuxtjs/i18n (configured in nuxt.config, messages in i18n/locales).
// Arabic flips the layout to right-to-left. Templates can use $t directly; this adds the
// store's own helpers (product names, prices, dates…) and keeps one short API for the code.

export type Lang = 'en' | 'ar'

type Params = Record<string, unknown>
type Product = { name?: string | null; name_en?: string | null; description?: string | null; description_en?: string | null; usage_info?: string | null; usage_info_en?: string | null } | null | undefined

/** The i18n instance, or null outside a Nuxt context (e.g. after an await on the server). */
function i18n() {
  return tryUseNuxtApp()?.$i18n ?? null
}

/** The current language without creating anything reactive (fine in loops and event handlers). */
export function currentLang(): Lang {
  return i18n()?.locale.value === 'ar' ? 'ar' : 'en'
}

/** Same as useLang().t, for plain helper functions outside components. */
export function translate(key: string, params?: Params): string {
  return i18n()?.t(key, params ?? {}) ?? key
}

/** Plurals: translatePlural('home.reviews.ago.day', 3) → "3 days ago" (forms in i18n/i18n.config.ts). */
export function translatePlural(key: string, count: number, params?: Params): string {
  return i18n()?.t(key, { count, ...params }, count) ?? key
}

export function useLang() {
  const { $i18n } = useNuxtApp()
  const lang = computed<Lang>(() => ($i18n.locale.value === 'ar' ? 'ar' : 'en'))
  const isAr = computed(() => lang.value === 'ar')
  const dir = computed(() => (isAr.value ? 'rtl' : 'ltr'))

  /** Switches language; the choice is saved in the "saadawy-lang" cookie. */
  const setLang = (next: Lang) => $i18n.setLocale(next)

  // These use the i18n instance itself, so they also work in head getters that run after setup.
  /** t('cart.title') or t('cart.added', { name }) — falls back to English, then to the key. */
  const t = (key: string, params?: Params) => $i18n.t(key, params ?? {})
  const tc = (key: string, count: number, params?: Params) => $i18n.t(key, { count, ...params }, count)

  /** For lists (e.g. bullet points or hero slides) stored in the translation files. */
  function tm<T = string>(key: string): T[] {
    const resolve = (value: unknown): unknown => {
      if (typeof value === 'string') return value
      if (Array.isArray(value)) return value.map(resolve)
      if (typeof value === 'function') return $i18n.rt(value as never)
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v)]))
      return value
    }
    const list = $i18n.tm(key)
    return Array.isArray(list) ? (list.map(resolve) as T[]) : []
  }

  // Products keep their original name in `name`; `name_en` etc. are the English versions.
  const productName = (p: Product) => (isAr.value ? p?.name : p?.name_en || p?.name) ?? ''
  const productDescription = (p: Product) => (isAr.value ? p?.description : p?.description_en || p?.description) ?? ''
  const productUsage = (p: Product) => (isAr.value ? p?.usage_info : p?.usage_info_en || p?.usage_info) ?? ''

  function price(value: number | string | null | undefined) {
    const amount = Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
    return isAr.value ? `${amount} ج.م` : `EGP ${amount}`
  }

  /** "3 October 2026" / "3 أكتوبر 2026" (Western digits in both, like prices). */
  function date(value: string | Date | null | undefined, withTime = false) {
    if (!value) return ''
    return new Date(value).toLocaleString(isAr.value ? 'ar-EG-u-nu-latn' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(withTime ? { hour: 'numeric', minute: '2-digit', hour12: true } : {}),
    })
  }

  const categoryName = (value: string | null | undefined) => (value ? t(`categories.${value}`) : '')
  const subcategoryLabel = (sub: { label: string; labelAr?: string } | null | undefined) =>
    (isAr.value ? sub?.labelAr || sub?.label : sub?.label) ?? ''
  // Governorates are stored by English name; their `label` is Arabic.
  const governorateName = (g: { value: string; label: string } | null | undefined) =>
    (isAr.value ? g?.label : g?.value) ?? ''

  // Store-settings texts that have an English and an Arabic version (address, opening hours, …).
  const storeSettings = useStoreSettings()
  const settingTextFor = (name: BilingualSetting) => settingText(storeSettings.value, name, lang.value)

  return {
    lang, isAr, dir, setLang, t, tc, tm,
    productName, productDescription, productUsage, price, date, categoryName, subcategoryLabel, governorateName,
    settingText: settingTextFor,
  }
}
