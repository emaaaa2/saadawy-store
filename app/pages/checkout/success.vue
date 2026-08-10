<template>
  <div class="min-h-screen flex items-center justify-center px-6 text-center">
    <div>
      <template v-if="paymentPending">
        <Icon name="mdi:clock-outline" class="text-6xl text-gold mb-4" />
        <h1 class="text-2xl font-bold text-olive mb-2">Payment Pending</h1>
        <p class="text-taupe mb-6">We're still confirming your payment. We'll contact you once it's done.</p>
      </template>
      <template v-else-if="paymentSucceeded">
        <Icon name="mdi:check-circle" class="text-6xl text-sage mb-4" />
        <h1 class="text-2xl font-bold text-olive mb-2">Payment Successful!</h1>
        <p class="text-taupe mb-6">Thank you for your order. We'll contact you soon.</p>
      </template>
      <template v-else>
        <Icon name="mdi:close-circle" class="text-6xl text-red-500 mb-4" />
        <h1 class="text-2xl font-bold text-olive mb-2">Payment Failed</h1>
        <p class="text-taupe mb-6">Your payment didn't go through. Please try again or contact us on WhatsApp.</p>
      </template>

      <a
        v-if="paymentSucceeded && whatsappUrl"
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition mb-3"
      >
        <Icon name="mdi:whatsapp" class="text-xl" />
        Confirm via WhatsApp
      </a>
      <br v-if="paymentSucceeded && whatsappUrl" />

      <NuxtLink to="/" class="bg-olive text-beige px-6 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition">
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const paymentPending = computed(() => route.query.pending === 'true')
const paymentSucceeded = computed(() => route.query.success === 'true' && !paymentPending.value)

const whatsappUrl = ref('')

onMounted(() => {
  if (!paymentSucceeded.value) return

  const saved = sessionStorage.getItem('lastOrder')
  if (!saved) return

  const order = JSON.parse(saved)
  const itemsList = order.items
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join('%0A')

  const message = `Hi! I just paid for my order.%0AOrder Number: ${order.orderNumber}%0AName: ${order.customerName}%0APhone: ${order.phone}%0AAddress: ${encodeURIComponent(order.address)}%0A%0AItems:%0A${itemsList}%0A%0ATotal: EGP ${order.total}`

  whatsappUrl.value = `https://wa.me/201025287580?text=${message}`
  sessionStorage.removeItem('lastOrder')
})
</script>
