// Puts the "dark" class on <html> when dark mode is chosen (store and dashboard share the choice),
// and colors the phone browser's bar to match the header (the --color-surface values in main.css).
export default defineNuxtPlugin(() => {
  const { isDark } = useTheme()

  useHead({
    htmlAttrs: {
      class: computed(() => (isDark.value ? 'dark' : '')),
    },
    meta: [
      { name: 'theme-color', content: computed(() => (isDark.value ? '#1e2421' : '#ffffff')) },
    ],
  })
})
