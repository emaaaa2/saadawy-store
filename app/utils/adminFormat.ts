// Labels below are getters, so they come out in the current language wherever they're read.

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  awaiting_payment: { badge: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400' },
  pending: { badge: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  confirmed: { badge: 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400', dot: 'bg-sky-500' },
  delivered: { badge: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  cancelled: { badge: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

export const ORDER_STATUS_META: Record<string, { label: string; badge: string; dot: string }> = Object.fromEntries(
  Object.entries(STATUS_STYLES).map(([status, styles]) => [
    status,
    { ...styles, get label() { return translate(`admin.status.${status}`) } },
  ])
)

export const ORDER_STATUS_OPTIONS = Object.keys(STATUS_STYLES).map((value) => ({
  value,
  get label() { return translate(`admin.status.${value}`) },
}))

const PAYMENT_METHOD_KEYS = ['cash_on_delivery', 'bank_transfer', 'card']

export const PAYMENT_LABELS: Record<string, string> = Object.defineProperties(
  {},
  Object.fromEntries(PAYMENT_METHOD_KEYS.map((key) => [
    key,
    { enumerable: true, get: () => translate(`admin.payment.${key}`) },
  ]))
)

export function paymentLabel(method: string | null | undefined) {
  if (!method) return translate('admin.payment.notSet')
  return PAYMENT_METHOD_KEYS.includes(method) ? translate(`admin.payment.${method}`) : method
}

/** plural(1, 'order') → "1 order" / "طلب واحد"; words: order, product, item, subscriber, review. */
export function plural(count: number, word: string) {
  return translatePlural(`admin.counts.${word}`, count, { count: count.toLocaleString('en-US') })
}

export const PRODUCT_CATEGORIES = ['skincare', 'makeup', 'haircare', 'perfume', 'bags', 'kitchen', 'hijab', 'accessories', 'uncategorized']
  .map((value) => ({ value, get label() { return translate(`categories.${value}`) } }))

export function categoryLabel(value: string | null | undefined) {
  if (!value) return '—'
  return PRODUCT_CATEGORIES.some((c) => c.value === value) ? translate(`categories.${value}`) : value
}

export function formatMoney(value: number | null | undefined) {
  const amount = Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
  return currentLang() === 'ar' ? `${amount} ج.م` : `EGP ${amount}`
}

export function formatDate(value: string | Date, withTime = false) {
  return new Date(value).toLocaleString(currentLang() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit', hour12: true } : {}),
  })
}

/** "2026-10-03" (a Cairo day from the reports API) → "3 Oct" / "3 أكتوبر". */
export function dayLabel(dayKey: string) {
  return new Date(`${dayKey}T00:00:00Z`).toLocaleDateString(currentLang() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

export function timeAgo(value: string | Date) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return translate('admin.common.ago.now')
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return translatePlural('admin.common.ago.minutes', minutes)
  const hours = Math.round(minutes / 60)
  if (hours < 24) return translatePlural('admin.common.ago.hours', hours)
  const days = Math.round(hours / 24)
  if (days < 7) return translatePlural('admin.common.ago.days', days)
  return formatDate(value)
}

/**
 * A failed $fetch, or a failure entry from a bulk action ({ reason, adminCode }),
 * as a message in the dashboard's language.
 */
export function adminErrorMessage(error: any) {
  const detail = error?.data?.data ?? (error?.adminCode ? error : null)
  if (detail?.adminCode) return translate(`admin.errors.${detail.adminCode}`, detail.params)
  if (detail?.code) return translate(`errors.${detail.code}`, detail.params)
  return error?.data?.statusMessage || error?.statusMessage || error?.reason || translate('admin.common.somethingWrong')
}
