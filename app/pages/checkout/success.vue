<template>
  <div class="min-h-screen flex items-center justify-center px-6 text-center">
    <div>
      <template v-if="paymentPending">
        <Icon name="mdi:clock-outline" class="text-6xl text-gold mb-4" />
        <h1 class="text-2xl font-bold text-ink mb-2">{{ $t('checkout.success.pendingTitle') }}</h1>
        <p class="text-taupe mb-6">{{ $t('checkout.success.pendingText') }}</p>
      </template>
      <template v-else-if="paymentSucceeded">
        <Icon name="mdi:check-circle" class="text-6xl text-sage mb-4" />
        <h1 class="text-2xl font-bold text-ink mb-2">{{ $t('checkout.success.paidTitle') }}</h1>
        <p class="text-taupe mb-6">{{ $t('checkout.success.paidText') }}</p>
      </template>
      <template v-else>
        <Icon name="mdi:close-circle" class="text-6xl text-red-500 mb-4" />
        <h1 class="text-2xl font-bold text-ink mb-2">{{ $t('checkout.success.failedTitle') }}</h1>
        <p class="text-taupe mb-6">{{ $t('checkout.success.failedText') }}</p>
      </template>

      <a
        v-if="paymentSucceeded && whatsappUrl"
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition mb-3"
      >
        <Icon name="mdi:whatsapp" class="text-xl" />
        {{ $t('checkout.success.sendWhatsApp') }}
      </a>
      <br v-if="paymentSucceeded && whatsappUrl" />

      <NuxtLink to="/" class="bg-olive text-beige px-6 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition">
        {{ $t('checkout.success.continueShopping') }}
      </NuxtLink>

      <div v-if="paymentSucceeded || paymentPending" class="mt-4">
        <NuxtLink to="/track-order" class="text-sm text-gold hover:underline">
          {{ $t('checkout.success.trackOrder') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { t, price, productName } = useLang()
const paymentPending = computed(() => route.query.pending === 'true')
const paymentSucceeded = computed(() => route.query.success === 'true' && !paymentPending.value)

useSeoMeta({ title: () => t('checkout.success.metaTitle'), robots: 'noindex' })

const whatsappUrl = ref('')
const settings = useStoreSettings()

onMounted(() => {
  if (!paymentSucceeded.value) return

  const saved = sessionStorage.getItem('lastOrder')
  if (!saved) return

  const order = JSON.parse(saved)
  const line = (key, value) => t(`checkout.whatsapp.${key}`, { value })
  const message = [
    t('checkout.whatsapp.paid'),
    line('orderNumber', order.orderNumber),
    line('name', order.customerName),
    line('phone', order.phone),
    line('address', order.address),
    '',
    t('checkout.whatsapp.items'),
    ...order.items.map((item) => `- ${productName(item)} x${item.quantity}`),
    '',
    line('total', price(order.total)),
  ].join('\n')

  whatsappUrl.value = `https://wa.me/${toWhatsAppNumber(settings.value.whatsappOrders)}?text=${encodeURIComponent(message)}`
  sessionStorage.removeItem('lastOrder')
})
</script>
