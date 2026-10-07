export type Theme = 'light' | 'dark'

// The store's light/dark mode. Light until the visitor switches; the choice is saved
// in a cookie so the server renders the right colors on the first load (no flash).
export function useTheme() {
  const cookie = useCookie<string | null>('saadawy-theme', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' })
  const theme = useState<Theme>('theme', () => (cookie.value === 'dark' ? 'dark' : 'light'))
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(next: Theme) {
    theme.value = next
    cookie.value = next
  }

  return { theme, isDark, setTheme, toggleTheme: () => setTheme(isDark.value ? 'light' : 'dark') }
}
