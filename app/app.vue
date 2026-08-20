<template>
  <div>
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 z-[200] loading-bg flex flex-col items-center justify-center gap-6 pointer-events-none"
      >
        <div class="relative flex items-center justify-center w-44 h-44">
          <div class="absolute inset-0 rounded-full loading-ring-track"></div>
          <div class="absolute inset-0 rounded-full loading-ring-spin"></div>
          <img
            src="/logo-beige.svg"
            alt="Saadawy Store"
            class="h-20 relative z-10 loading-logo"
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
  background: radial-gradient(circle at center, #4d6055 0%, #3a4a41 100%);
}

.loading-logo {
  animation: breathe 1.8s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(176, 141, 87, 0.25));
}

.loading-ring-track {
  border: 1px solid rgba(251, 244, 235, 0.12);
}

.loading-ring-spin {
  background: conic-gradient(from 0deg, transparent 0%, #E6D3A3 8%, #B08D57 20%, transparent 38%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  animation: spin 2.4s linear infinite;
  filter: drop-shadow(0 0 6px rgba(176, 141, 87, 0.4));
}

.loading-tagline {
  color: #E6D3A3;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  opacity: 0.85;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.94; }
  50% { transform: scale(1.05); opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>