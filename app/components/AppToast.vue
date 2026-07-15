<template>
  <Teleport to="body">
    <transition name="slide-up">
      <div
        v-if="toast.isVisible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-olive text-beige px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
      >
        <Icon name="mdi:check-circle" class="text-gold text-lg" />
        {{ toast.message }}
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const toast = useToastStore()
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