export const ORDER_STATUS_META: Record<string, { label: string; badge: string; dot: string }> = {
  awaiting_payment: { label: 'Awaiting payment', badge: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400' },
  pending: { label: 'Pending', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', badge: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  delivered: { label: 'Delivered', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
}

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_META).map(([value, meta]) => ({ value, label: meta.label }))

export const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
  card: 'Card',
}

export function paymentLabel(method: string | null | undefined) {
  return method ? PAYMENT_LABELS[method] ?? method : 'Not set'
}

/** plural(1, 'order') → "1 order", plural(3, 'order') → "3 orders" */
export function plural(count: number, word: string) {
  return `${count.toLocaleString('en-US')} ${word}${count === 1 ? '' : 's'}`
}

export const PRODUCT_CATEGORIES = [
  { value: 'skincare', label: 'Skincare' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'haircare', label: 'Haircare' },
  { value: 'perfume', label: 'Perfume' },
  { value: 'bags', label: 'Bags' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'hijab', label: 'Hijab & Essentials' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'uncategorized', label: 'Uncategorized' },
]

export function categoryLabel(value: string | null | undefined) {
  return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value ?? '—'
}

export function formatMoney(value: number | null | undefined) {
  return `EGP ${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export function formatDate(value: string | Date, withTime = false) {
  const date = new Date(value)
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit', hour12: true } : {}),
  })
}

export function timeAgo(value: string | Date) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(value)
}

export function adminErrorMessage(error: any) {
  return error?.data?.statusMessage || error?.statusMessage || 'Something went wrong. Please try again.'
}
