<template>
  <transition name="slide-down">
    <div v-if="showReminder" class="bg-gold/15 border-b border-gold/30 px-4 py-2.5">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm text-olive">
          <Icon name="mdi:cart-outline" class="text-lg shrink-0" />
          <span>You have {{ cart.itemCount }} item{{ cart.itemCount > 1 ? 's' : '' }} waiting in your cart</span>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            class="text-sm font-semibold text-olive hover:text-gold transition underline"
            @click="cartUI.open(); showReminder = false"
          >
            View Cart
          </button>
          <button
            class="text-olive/50 hover:text-olive transition"
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