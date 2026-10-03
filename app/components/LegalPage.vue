<template>
  <div dir="rtl" lang="ar" class="px-6 py-phi-3 md:py-phi-4 font-['Alexandria',sans-serif]">
    <div class="max-w-3xl mx-auto">
      <nav class="flex flex-wrap gap-2 mb-8" aria-label="سياسات المتجر">
        <NuxtLink
          v-for="page in pages"
          :key="page.to"
          :to="page.to"
          class="text-sm px-4 py-2 rounded-full border transition"
          :class="route.path === page.to ? 'bg-olive text-beige border-olive' : 'border-olive/15 text-olive/70 hover:border-gold hover:text-olive'"
        >
          {{ page.label }}
        </NuxtLink>
      </nav>

      <h1 class="text-3xl md:text-4xl font-bold text-olive mb-2">{{ title }}</h1>
      <p class="text-sm text-taupe mb-8">آخر تحديث: {{ updated }}</p>

      <div class="legal-content bg-white rounded-3xl border border-olive/10 p-6 md:p-10">
        <slot />
      </div>

      <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-olive text-beige rounded-3xl p-6">
        <p class="text-center sm:text-right">عندك سؤال؟ فريقنا موجود يساعدك.</p>
        <a
          :href="`https://wa.me/${toWhatsAppNumber(settings.whatsappSupport)}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 bg-gold text-olive font-semibold px-6 py-3 rounded-full hover:bg-champagne transition"
        >
          <Icon name="mdi:whatsapp" class="text-xl" />
          كلمنا على واتساب
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  updated: { type: String, required: true },
})

const route = useRoute()
const settings = useStoreSettings()

const pages = [
  { to: '/returns', label: 'الاستبدال والاسترجاع' },
  { to: '/privacy', label: 'سياسة الخصوصية' },
  { to: '/terms', label: 'الشروط والأحكام' },
]
</script>

<style>
.legal-content {
  @apply text-olive/80 leading-loose;
}
.legal-content section + section {
  @apply mt-8 pt-8 border-t border-olive/10;
}
.legal-content h2 {
  @apply text-lg md:text-xl font-bold text-olive mb-3;
}
.legal-content p + p,
.legal-content p + ul,
.legal-content ul + p {
  @apply mt-3;
}
.legal-content ul {
  @apply list-disc pr-5 space-y-1.5;
}
.legal-content a {
  @apply text-gold font-semibold underline underline-offset-4 hover:text-olive;
}
.legal-content strong {
  @apply text-olive font-semibold;
}
</style>
