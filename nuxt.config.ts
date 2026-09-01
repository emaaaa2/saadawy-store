export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/icon", "@nuxt/image", "@nuxt/eslint", "@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/supabase"],
  
  runtimeConfig: {
  adminPassword: process.env.ADMIN_PASSWORD,
  sessionSecret: process.env.SESSION_SECRET,
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
    domains: ['ocphzlgprdftniseamiw.supabase.co'],
    format: ['webp'],
    quality: 80,
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*'],
      redirect: false
    }
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
  css: ['~/assets/css/main.css'],
});