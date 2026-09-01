<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="showPopup"
        class="fixed inset-0 z-[150] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="dismiss"></div>

        <div class="relative bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-xl text-center p-8">
          <button
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-champagne flex items-center justify-center hover:text-gold transition"
            aria-label="Close"
            @click="dismiss"
          >
            <Icon name="mdi:close" class="text-lg" />
          </button>

          <Icon name="mdi:gift-outline" class="text-4xl text-gold mb-3" />

          <h2 class="text-xl font-bold text-olive mb-2">Welcome to Saadawy Store!</h2>
          <p class="text-sm text-taupe mb-5">
            Enjoy 10% off your first order — just use the code below at checkout.
          </p>

          <button
            class="w-full border-2 border-dashed border-gold rounded-xl py-3 flex items-center justify-center gap-2 text-olive font-bold tracking-wide hover:bg-champagne/40 transition"
            @click="copyCode"
          >
            <span>{{ couponCode }}</span>
            <Icon :name="copied ? 'mdi:check' : 'mdi:content-copy'" class="text-lg" :class="copied ? 'text-sage' : 'text-gold'" />
          </button>
          <p v-if="copied" class="text-xs text-sage mt-2">Copied! Paste it at checkout.</p>

          <button
            class="mt-5 text-sm text-taupe hover:text-olive transition underline"
            @click="dismiss"
          >
            No thanks, continue shopping
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const couponCode = 'WELCOME10'
const showPopup = ref(false)
const copied = ref(false)
const STORAGE_KEY = 'saadawy-welcome-offer-seen'

onMounted(() => {
  if (localStorage.getItem(STORAGE_KEY)) return

  setTimeout(() => {
    showPopup.value = true
  }, 2500)
})

function dismiss() {
  showPopup.value = false
  localStorage.setItem(STORAGE_KEY, '1')
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(couponCode)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // clipboard access unavailable, code is still visible to copy manually
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
