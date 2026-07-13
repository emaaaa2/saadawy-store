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

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.slug"
        :to="`/category/${cat.slug}`"
        class="group bg-beige border border-olive/15 rounded-2xl overflow-hidden hover:border-gold hover:shadow-lg transition"
      >
        <div class="relative aspect-square bg-champagne/40">
          <img
            v-if="cat.image"
            :src="cat.image"
            :alt="cat.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon :name="cat.icon" class="text-3xl text-olive/40" />
          </div>
        </div>

        <p class="font-semibold text-olive text-sm text-center py-3">
          {{ cat.name }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
const categories = [
  {
    slug: "skincare",
    name: "Skincare",
    icon: "mdi:water-outline",
    image: "/images/skincare.jpg",
  },
  {
    slug: "perfume",
    name: "Perfume",
    icon: "mdi:spray-bottle",
    image: "/images/perfume2.jpg",
  },
  {
    slug: "bags",
    name: "Bags",
    icon: "mdi:bag-personal-outline",
    image: "/images/bag2.jpg",
  },
  {
    slug: "kitchen",
    name: "Kitchen",
    icon: "mdi:pot-mix-outline",
    image: "/images/kitchen.jpg",
  },
  {
    slug: "hijab",
    name: "Hijab & Essentials",
    icon: "mdi:tshirt-crew-outline",
    image: "/images/hijab.jpg",
  },
  {
    slug: "accessories",
    name: "Accessories",
    icon: "mdi:necklace",
    image: "/images/makeup.jpg",
  },
];
</script>
