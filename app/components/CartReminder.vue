<template>
  <transition name="slide-down">
    <div v-if="showReminder" class="bg-olive shadow-md px-4 py-3">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
            <Icon name="mdi:cart-outline" class="text-lg text-gold" />
          </div>
          <p class="text-sm text-beige truncate">
            You have {{ cart.itemCount }} item{{ cart.itemCount > 1 ? "s" : "" }} waiting in your cart
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            class="text-sm font-semibold bg-gold text-olive px-4 py-1.5 rounded-full hover:bg-beige transition"
            @click="cartUI.open(); showReminder = false"
          >
            View Cart
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full text-beige/60 hover:text-beige hover:bg-beige/10 transition"
            aria-label="Dismiss"
            @click="dismissReminder"
          >
            <Icon name="mdi:close" class="text-lg" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const cart = useCartStore()
const cartUI = useCartUIStore()
const showReminder = ref(false)

onMounted(() => {
  if (cart.items.length === 0) return

  const dismissedAt = localStorage.getItem('saadawy-reminder-dismissed')
  const now = Date.now()

  if (dismissedAt && now - Number(dismissedAt) < 1000 * 60 * 60) {
    return
  }

  setTimeout(() => {
    showReminder.value = true
  }, 1500)
})

function dismissReminder() {
  showReminder.value = false
  localStorage.setItem('saadawy-reminder-dismissed', Date.now().toString())
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
