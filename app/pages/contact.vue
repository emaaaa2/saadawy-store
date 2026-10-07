<template>
  <div class="px-6 py-phi-4 max-w-2xl mx-auto text-center">
    <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
      {{ $t('pages.contact.eyebrow') }}
    </span>
    <h1 class="text-phi-h1 font-bold text-ink mb-phi-2">{{ $t('pages.contact.title') }}</h1>
    <p class="text-ink/70 mb-phi-3 max-w-md mx-auto">
      {{ $t('pages.contact.text') }}
    </p>

    <div class="grid gap-phi-2" :class="{ 'sm:grid-cols-2': settings.instagramUrl }">
      <a
        :href="`https://wa.me/${toWhatsAppNumber(settings.whatsappSupport)}`"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col items-center gap-3 bg-page border border-ink/10 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition"
      >
        <Icon name="mdi:whatsapp" class="text-4xl text-sage" />
        <div>
          <p class="font-semibold text-ink">WhatsApp</p>
          <p class="text-sm text-taupe">{{ $t('pages.contact.whatsappText') }}</p>
        </div>
      </a>
      <a
        v-if="settings.instagramUrl"
        :href="settings.instagramUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col items-center gap-3 bg-page border border-ink/10 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition"
      >
        <Icon name="mdi:instagram" class="text-4xl text-gold" />
        <div>
          <p class="font-semibold text-ink">Instagram</p>
          <p class="text-sm text-taupe">{{ $t('pages.contact.instagramText') }}</p>
        </div>
      </a>
    </div>

    <div class="mt-phi-3 pt-phi-3 border-t border-ink/10">
      <div v-if="settingText('address')" class="flex items-start gap-3 justify-center mb-3">
        <Icon name="mdi:map-marker-outline" class="text-xl text-gold shrink-0 mt-0.5" />
        <p dir="auto" class="text-ink/80 text-start">{{ settingText('address') }}</p>
      </div>
      <div v-if="settingText('openingHours')" class="flex items-center gap-3 justify-center">
        <Icon name="mdi:clock-outline" class="text-xl text-gold" />
        <p dir="auto" class="text-ink/80">{{ settingText('openingHours') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const settings = useStoreSettings()
const { t, settingText } = useLang()

useSeoMeta({
  title: () => t('pages.contact.metaTitle'),
  description: () => t('pages.contact.metaDescription')
})
</script>
