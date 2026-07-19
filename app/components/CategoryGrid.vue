<template>
  <section class="px-6 py-phi-4 max-w-6xl mx-auto">
    <div class="text-center mb-phi-4">
      <span
        class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-3"
      >
        Explore Our Collections
      </span>
      <h2 class="text-phi-h2 font-bold text-olive">Shop by Category</h2>
    </div>

<div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
       <NuxtLink
  v-for="cat in categories"
  :key="cat.slug"
  :to="`/category/${cat.slug}`"
  class="group bg-beige border border-olive/15 rounded-xl overflow-hidden hover:border-gold hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
>
  <div class="relative aspect-square bg-champagne/40 overflow-hidden">
    <img
      v-if="cat.image"
      :src="cat.image"
      :alt="cat.name"
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div v-else class="w-full h-full flex items-center justify-center">
      <Icon :name="cat.icon" class="text-2xl text-olive/40 transition-transform duration-300 group-hover:scale-125" />
    </div>
  </div>

  <p class="font-medium text-olive text-xs text-center py-2 px-1 truncate">{{ cat.name }}</p>
</NuxtLink>
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
</script>
