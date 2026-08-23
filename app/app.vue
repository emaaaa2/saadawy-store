<template>
  <div>
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 z-[200] loading-bg flex flex-col items-center justify-center gap-6 pointer-events-none"
      >
        <div class="relative flex items-center justify-center w-44 h-44">
          <img
            src="/logo-icon-petals-olive.svg"
            alt="Saadawy Store"
            class="h-28 relative z-10 loading-logo-petals"
          />
          <img
            src="/logo-icon-frame-olive.svg"
            alt=""
            class="h-28 absolute z-20 loading-logo-frame"
          />
        </div>
        <p class="loading-tagline">Saadawy Store</p>
      </div>
    </Transition>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const isLoading = ref(true)
const cart = useCartStore()
const wishlist = useWishlistStore()
const recentlyViewed = useRecentlyViewedStore()

onMounted(() => {
  cart.loadFromStorage()
  wishlist.loadFromStorage()
  recentlyViewed.loadFromStorage()

  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<style scoped>
.fade-enter-active {
  transition: opacity 0.5s ease;
}
.fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-enter-from {
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

.loading-bg {
  background: #ffffff;
}

.loading-logo-petals {
  filter: drop-shadow(0 0 10px rgba(68, 86, 76, 0.15));
}

.loading-logo-frame {
  animation: spin-logo 1.8s linear infinite;
  filter: drop-shadow(0 0 6px rgba(176, 141, 87, 0.3));
}

.loading-tagline {
  color: #44564c;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  opacity: 0.7;
}

@keyframes spin-logo {
  to { transform: rotate(360deg); }
}
</style>