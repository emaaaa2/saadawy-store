// Customer phone numbers: the checkout form and the server use the same rules.

// Arabic-Indic and Persian digits, in order 0–9.
const EASTERN_DIGITS = ['٠١٢٣٤٥٦٧٨٩', '۰۱۲۳۴۵۶۷۸۹']

/** "+20 100 123 4567", "٠١٠٠١٢٣٤٥٦٧", "0020100…" → "01001234567". Anything else is returned cleaned up. */
export function normalizePhone(input: unknown) {
  let digits = String(input ?? '')
    .replace(/[٠-٩۰-۹]/g, (d) => String(EASTERN_DIGITS.find((set) => set.includes(d))!.indexOf(d)))
    .replace(/\D/g, '')
  if (digits.startsWith('0020')) digits = digits.slice(4)
  else if (digits.startsWith('20') && digits.length === 12) digits = digits.slice(2)
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`
  return digits
}

/** An Egyptian mobile number: 010, 011, 012 or 015 followed by 8 digits. */
export function isEgyptianMobile(input: unknown) {
  return /^01[0125]\d{8}$/.test(normalizePhone(input))
}
