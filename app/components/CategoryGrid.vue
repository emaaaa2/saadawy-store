<template>
  <section class="bg-white px-6 py-8 md:py-phi-4">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-6 md:mb-phi-4">
        <span
          class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3"
        >
          Explore Our Collections
        </span>
        <h2 class="text-xl md:text-phi-h2 font-bold text-olive">Shop by Category</h2>
      </div>

      <div class="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-6">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/category/${cat.slug}`"
          class="group flex flex-col items-center gap-2.5"
        >
          <div
            class="relative rounded-xl overflow-hidden bg-champagne/40 ring-1 ring-olive/10 shadow-sm group-hover:ring-2 group-hover:ring-gold group-hover:shadow-lg transition-all duration-300"
            :style="circleStyle"
          >
            <img
              v-if="cat.image && !failedImages.has(cat.image)"
              :src="cat.image"
              :alt="cat.name"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              @error="failedImages.add(cat.image)"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center">
              <Icon :name="cat.icon" class="text-3xl text-olive/40 transition-transform duration-300 group-hover:scale-125" />
            </div>
          </div>

          <p class="text-xs md:text-base font-medium text-olive text-center leading-tight group-hover:text-gold transition">
            {{ cat.name }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const categories = [
  { slug: 'skincare', name: 'Skincare', icon: 'mdi:water-outline', image: '/images/skincare.jpg' },
  { slug: 'makeup', name: 'Makeup', icon: 'mdi:lipstick', image: '/images/makeup.jpg' },
  { slug: 'haircare', name: 'Haircare', icon: 'mdi:hair-dryer', image: '/images/pic.jpg' },
  { slug: 'perfume', name: 'Perfume', icon: 'mdi:spray-bottle', image: '/images/perfume1.jpg' },
  { slug: 'bags', name: 'Bags', icon: 'mdi:bag-personal-outline', image: '/images/bag.jpg' },
  { slug: 'kitchen', name: 'Kitchen', icon: 'mdi:pot-mix-outline', image: '/images/kitchen.jpg' },
  { slug: 'hijab', name: 'Hijab & Essentials', icon: 'mdi:tshirt-crew-outline', image: '/images/hijab.jpg' },
  { slug: 'accessories', name: 'Accessories', icon: 'mdi:necklace', image: '/images/hijab2.jpg' },
]

const isDesktop = ref(false);
const failedImages = reactive(new Set());

function updateIsDesktop() {
  isDesktop.value = window.innerWidth >= 768;
}

onMounted(() => {
  updateIsDesktop();
  window.addEventListener("resize", updateIsDesktop);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateIsDesktop);
});

const circleStyle = computed(() => {
  const size = isDesktop.value ? "7rem" : "4.5rem";
  return { width: size, height: size };
});
</script>
