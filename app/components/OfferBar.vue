<template>
  <div
    class="bg-gold text-olive text-center text-sm font-medium py-2.5 px-4 relative overflow-hidden h-10 flex items-center justify-center gap-2"
  >
    <transition name="fade" mode="out-in">
      <div :key="currentIndex" class="flex items-center gap-2">
        <Icon :name="offers[currentIndex].icon" class="text-base shrink-0" />
        <p>{{ offers[currentIndex].text }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
const offers = [
  {
    text: "Free shipping on orders over EGP 500",
    icon: "mdi:truck-fast-outline",
  },
  { text: "New arrivals every week", icon: "mdi:sparkles" },
  { text: "Follow us on Instagram @saadawy.store", icon: "mdi:instagram" },
];

const currentIndex = ref(0);
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % offers.length;
  }, 4000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
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
</style>
