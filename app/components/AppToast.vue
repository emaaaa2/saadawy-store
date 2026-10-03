<template>
  <Teleport to="body">
    <transition name="slide-up">
      <div
        v-if="toast.isVisible"
        role="status"
        class="fixed left-1/2 -translate-x-1/2 z-[150] w-max max-w-[calc(100vw-2rem)] sm:max-w-md text-beige pl-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5 text-sm font-medium transition-[bottom] duration-200"
        :class="[
          toast.type === 'error' ? 'bg-red-700' : 'bg-olive',
          toast.action ? 'pr-2' : 'pr-5',
          ctaVisible ? 'bottom-24 md:bottom-6' : 'bottom-6',
        ]"
      >
        <Icon
          :name="toast.type === 'error' ? 'mdi:alert-circle' : 'mdi:check-circle'"
          class="text-lg shrink-0"
          :class="toast.type === 'error' ? 'text-white' : 'text-gold'"
        />
        <span dir="auto" class="line-clamp-2 min-w-0">{{ toast.message }}</span>
        <button
          v-if="toast.action === 'cart'"
          type="button"
          class="shrink-0 bg-gold text-olive text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-champagne transition"
          @click="openCart"
        >
          View cart
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const toast = useToastStore()
const cartUI = useCartUIStore()
// Set by the product page while its fixed Add to Cart bar is showing on phones.
const ctaVisible = useState('mobile-cta-visible', () => false)

function openCart() {
  toast.hide()
  cartUI.open()
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
