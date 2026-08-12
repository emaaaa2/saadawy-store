<template>
  <section class="px-6 py-8 md:py-phi-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-4 md:mb-phi-3">
        <h2 class="text-xl md:text-phi-h2 font-bold text-olive">
          Real Moments, Real Saadawy
        </h2>
        <a
          href="https://www.instagram.com/saadawy_store?igsh=ejJ2aW5obnAyMGhn"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-semibold text-gold hover:underline shrink-0"
        >
          View All
        </a>
      </div>

      <div
        ref="scrollEl"
        class="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        @scroll="onScroll"
      >
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="snap-start shrink-0 w-[42%] sm:w-[30%] md:w-[23%] aspect-square rounded-2xl overflow-hidden"
        >
          <img
            :src="photo"
            alt="Saadawy Store customer moment"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 mt-4">
        <span
          v-for="(photo, index) in photos"
          :key="index"
          class="h-1.5 rounded-full transition-all"
          :class="index === activeDot ? 'w-5 bg-gold' : 'w-1.5 bg-olive/20'"
        ></span>
      </div>
    </div>
  </section>
</template>

<script setup>
const photos = [
  "/images/perfume2.jpg",
  "/images/bag2.jpg",
  "/images/hijab3.jpg",
  "/images/perfume3.jpg",
  "/images/skincare.jpg",
  "/images/makeup.jpg",
];

const scrollEl = ref(null);
const activeDot = ref(0);

function onScroll() {
  const el = scrollEl.value;
  if (!el) return;
  const itemWidth = el.scrollWidth / photos.length;
  activeDot.value = Math.min(
    photos.length - 1,
    Math.round(el.scrollLeft / itemWidth)
  );
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  scrollbar-width: none;
}
</style>
