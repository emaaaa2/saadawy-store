// vue-i18n options (used by @nuxtjs/i18n, see nuxt.config).
//
// Plurals are written as forms separated by " | ". English uses two (one | many).
// Arabic uses five: none | one | two | 3–10 | 11 and up, e.g.
//   'مفيش طلبات | طلب واحد | طلبين | {count} طلبات | {count} طلب'
function arabicPlural(choice: number, choicesLength: number) {
  const n = Math.abs(choice)
  if (choicesLength < 5) return n === 1 ? 0 : 1
  if (n === 0) return 0
  if (n === 1) return 1
  if (n === 2) return 2
  const lastTwo = n % 100
  return lastTwo >= 3 && lastTwo <= 10 ? 3 : 4
}

export default defineI18nConfig(() => ({
  fallbackLocale: 'en',
  pluralRules: { ar: arabicPlural },
}))
