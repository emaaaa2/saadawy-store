<template>
  <a
    :href="whatsappLink"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
    :class="ctaVisible ? 'bottom-24 md:bottom-6' : 'bottom-6'"
    aria-label="Chat with us on WhatsApp"
  >
    <Icon name="mdi:whatsapp" class="text-3xl" />
  </a>
</template>

<script setup>
const settings = useStoreSettings()
// Set by the product page while its fixed Add to Cart bar is showing on phones.
const ctaVisible = useState('mobile-cta-visible', () => false)
const message = 'Hi! I have a question about your products.'

const whatsappLink = computed(() => {
  return `https://wa.me/${toWhatsAppNumber(settings.value.whatsappSupport)}?text=${encodeURIComponent(message)}`
})
</script>
