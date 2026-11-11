<template>
  <div class="px-6 py-phi-4 max-w-2xl mx-auto text-center">
    <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
      {{ $t('pages.contact.eyebrow') }}
    </span>
    <h1 class="text-phi-h1 font-bold text-ink mb-phi-2">{{ $t('pages.contact.title') }}</h1>
    <p class="text-ink/70 mb-phi-3 max-w-md mx-auto">
      {{ $t('pages.contact.text') }}
    </p>

    <div class="grid gap-phi-2" :class="{ 'sm:grid-cols-2': cards.length === 2, 'sm:grid-cols-3': cards.length >= 3 }">
      <a
        v-for="card in cards"
        :key="card.title"
        :href="card.link"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col items-center gap-3 bg-page border border-ink/10 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition"
      >
        <Icon :name="card.icon" class="text-4xl" :class="card.color" />
        <div>
          <p class="font-semibold text-ink">{{ card.title }}</p>
          <p class="text-sm text-taupe">{{ card.text }}</p>
        </div>
      </a>
    </div>

    <div v-if="follow.length" class="mt-phi-2 flex items-center justify-center gap-3">
      <span class="text-sm text-taupe">{{ $t('pages.contact.followUs') }}</span>
      <a
        v-for="item in follow"
        :key="item.name"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="item.name"
        class="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink/70 hover:border-gold hover:text-gold transition"
      >
        <Icon :name="item.icon" class="text-xl" />
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

// Big cards: chatting with us, the offers channel and Instagram; the other accounts as small icons below.
const cards = computed(() => [
  { title: 'WhatsApp', text: t('pages.contact.whatsappText'), icon: 'mdi:whatsapp', color: 'text-sage', link: `https://wa.me/${toWhatsAppNumber(settings.value.whatsappSupport)}` },
  { title: t('pages.contact.channelTitle'), text: t('pages.contact.channelText'), icon: 'mdi:bullhorn-outline', color: 'text-sage', link: settings.value.whatsappChannelUrl },
  { title: 'Instagram', text: t('pages.contact.instagramText'), icon: 'mdi:instagram', color: 'text-gold', link: settings.value.instagramUrl },
].filter((card) => card.link))

const follow = computed(() => [
  { name: 'Facebook', icon: 'mdi:facebook', link: settings.value.facebookUrl },
  { name: 'TikTok', icon: 'mdi:music-note', link: settings.value.tiktokUrl },
].filter((item) => item.link))

useSeoMeta({
  title: () => t('pages.contact.metaTitle'),
  description: () => t('pages.contact.metaDescription')
})
</script>
