<template>
  <div class="px-6 py-phi-4 max-w-2xl mx-auto text-center">
    <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3">
      Get in Touch
    </span>
    <h1 class="text-phi-h1 font-bold text-olive mb-phi-2">Contact Us</h1>
    <p class="text-olive/70 mb-phi-3 max-w-md mx-auto">
      Have a question about a product or your order? We're here to help.
    </p>

    <div class="grid gap-phi-2" :class="{ 'sm:grid-cols-2': settings.instagramUrl }">
      <a
        :href="`https://wa.me/${toWhatsAppNumber(settings.whatsappSupport)}`"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col items-center gap-3 bg-beige border border-olive/10 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition"
      >
        <Icon name="mdi:whatsapp" class="text-4xl text-sage" />
        <div>
          <p class="font-semibold text-olive">WhatsApp</p>
          <p class="text-sm text-taupe">Fastest way to reach us</p>
        </div>
      </a>
      <a
        v-if="settings.instagramUrl"
        :href="settings.instagramUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col items-center gap-3 bg-beige border border-olive/10 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition"
      >
        <Icon name="mdi:instagram" class="text-4xl text-gold" />
        <div>
          <p class="font-semibold text-olive">Instagram</p>
          <p class="text-sm text-taupe">Follow for new arrivals</p>
        </div>
      </a>
    </div>

    <div class="mt-phi-3 pt-phi-3 border-t border-olive/10">
      <div v-if="settings.address" class="flex items-start gap-3 justify-center mb-3">
        <Icon name="mdi:map-marker-outline" class="text-xl text-gold shrink-0 mt-0.5" />
        <p class="text-olive/80 text-left">{{ settings.address }}</p>
      </div>
      <div v-if="settings.openingHours" class="flex items-center gap-3 justify-center">
        <Icon name="mdi:clock-outline" class="text-xl text-gold" />
        <p class="text-olive/80">{{ settings.openingHours }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const settings = useStoreSettings()

useSeoMeta({
  title: 'Contact Us',
  description: 'Reach Saadawy Store on WhatsApp or Instagram, or visit our store in Shubra El-Kheima.'
})
</script>
