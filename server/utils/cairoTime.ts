// Dates are grouped by the store's local day (Cairo), not the server's UTC day.
const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Cairo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DAY_MS = 24 * 60 * 60 * 1000

/** "YYYY-MM-DD" in Cairo time; these strings sort and compare correctly. */
export function cairoDay(date: Date | string | number = Date.now()) {
  return dayFormat.format(new Date(date))
}

/** Cairo day keys for the last `count` days, oldest first, ending today. */
export function lastCairoDays(count: number) {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => cairoDay(now - (count - 1 - i) * DAY_MS))
}

export function cairoDayLabel(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** Day key of the most recent Saturday (start of the week in Egypt). */
export function cairoWeekStart() {
  const today = cairoDay()
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay() // 0 = Sunday … 6 = Saturday
  const daysSinceSaturday = (weekday + 1) % 7
  return cairoDay(Date.now() - daysSinceSaturday * DAY_MS)
}

// Orders that brought in money: not cancelled, and card orders only once paid.
export const REVENUE_EXCLUDED_STATUSES = ['cancelled', 'awaiting_payment']
