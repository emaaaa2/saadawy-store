export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/icon", "@nuxt/image", "@nuxt/eslint", "@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/supabase", "@nuxtjs/i18n"],

  // English by default, Arabic via the switch. Same URLs for both languages: the choice
  // lives in the "saadawy-lang" cookie, and first-time visitors get their browser's language.
  // Search engines send no language, so they see English. Messages live in i18n/locales and
  // only the language in use is loaded.
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en', name: 'English', dir: 'ltr', file: 'en.ts' },
      { code: 'ar', language: 'ar-EG', name: 'العربية', dir: 'rtl', file: 'ar.ts' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'saadawy-lang',
      fallbackLocale: 'en',
    },
    vueI18n: './i18n.config.ts',
  },

  runtimeConfig: {
  adminEmails: process.env.ADMIN_EMAILS,
   paymobSecretKey: process.env.PAYMOB_SECRET_KEY,
  paymobCardIntegrationId: process.env.PAYMOB_CARD_INTEGRATION_ID,
  paymobHmacSecret: process.env.PAYMOB_HMAC_SECRET,
  resendApiKey: process.env.RESEND_API_KEY,
  newsletterFromEmail: process.env.NEWSLETTER_FROM_EMAIL,
  public: {
    paymobPublicKey: process.env.PAYMOB_PUBLIC_KEY,
    siteUrl: process.env.SITE_URL
  }
},
  image: {
    // Local dev's sharp/ipx pipeline can be flaky depending on machine setup.
    // Skip image processing in dev (serves originals as-is); full optimization
    // still runs in production.
    provider: process.env.NODE_ENV === 'production' ? 'ipx' : 'none',
    domains: ['ocphzlgprdftniseamiw.supabase.co'],
    format: ['webp'],
    quality: 80,
  },
  supabase: {
    redirect: false
  },
  routeRules: {
    '/confirm': { ssr: false }
  },
  nitro: {
    // Nitro rewrites `typeof window` to "undefined" in server code, even inside strings — which
    // breaks papaparse (its worker source is a string containing it). On the server it's
    // "undefined" at runtime anyway, so leaving it as is only skips a small optimization.
    replace: { 'typeof window': 'typeof window' },
  },
  app: {
    pageTransition: { name: 'page'},
    head: {
      titleTemplate: '%s | Saadawy Store',
      meta: [
        { name: 'description', content: 'Saadawy Store — cosmetics, perfumes, skincare, haircare, bags, kitchen essentials and more, all in one place. Based in Shubra El-Kheima, Egypt.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Saadawy Store' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css'
  },
  css: ['~/assets/css/main.css'],
});