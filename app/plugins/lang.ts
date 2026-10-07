// Makes $price and $pname available in every template ($t comes from @nuxtjs/i18n), and keeps
// <html lang dir> and the title suffix in sync with the chosen language.
export default defineNuxtPlugin({
  name: 'saadawy:lang',
  dependsOn: ['i18n:plugin'],
  setup() {
    const { lang, dir, t, price, productName } = useLang()

    useHead({
      htmlAttrs: { lang, dir },
      titleTemplate: (title) => (title ? `${title} | ${t('common.storeName')}` : t('common.storeName')),
    })

    return {
      provide: { price, pname: productName },
    }
  },
})
