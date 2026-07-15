<template>
  <div>
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 z-[200] bg-olive flex flex-col items-center justify-center gap-6"
      >
        <img
          src="/logo.svg"
          alt="Saadawy Store"
          class="h-32 animate-pulse"
        />
        <div class="w-40 h-1 bg-beige/20 rounded-full overflow-hidden">
          <div class="h-full bg-gold rounded-full loading-bar"></div>
        </div>
      </div>
    </Transition>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-bar {
  width: 0%;
  animation: loading 1s ease-in-out forwards;
}

@keyframes loading {
  0% { width: 0%; }
  100% { width: 100%; }
}
</style>