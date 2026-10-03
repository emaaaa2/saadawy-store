<template>
  <!-- Room under the footer for the product page's fixed Add to Cart bar on phones. -->
  <div :class="{ 'max-md:pb-20': ctaVisible }">
    <CartReminder v-if="!isCheckout" />

    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <!-- Keep checkout free of distractions and of buttons covering the form. -->
    <WhatsAppButton v-if="!isCheckout" />
    <ProductQuickView />
    <CartSidebar />
    <AppToast />
    <WelcomeOfferPopup />
  </div>
</template>

<script setup>
const route = useRoute()
const isCheckout = computed(() => route.path.startsWith('/checkout'))
const ctaVisible = useState('mobile-cta-visible', () => false)
</script>
