<template>
  <a
    :href="whatsappLink"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
    aria-label="Chat with us on WhatsApp"
  >
    <Icon name="mdi:whatsapp" class="text-3xl" />
  </a>
</template>

<script setup>
const phoneNumber = '201026051881'
const message = 'Hi! I have a question about your products.'

const whatsappLink = computed(() => {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
})
</script>