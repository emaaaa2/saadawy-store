<template>
  <section class="px-6 py-phi-4 max-w-6xl mx-auto">
  <div class="text-center mb-phi-4">
    <span class="inline-block text-sm font-semibold text-gold uppercase tracking-wide mb-phi-1">
      Shop by Category
    </span>
    <h2 class="text-phi-h2 font-bold text-olive">
      Six worlds, one roof
    </h2>
  </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.slug"
        :to="`/category/${cat.slug}`"
        class="group bg-beige border border-olive/15 rounded-2xl p-6 text-center hover:border-gold hover:shadow-lg transition"
      >
        <div class="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-olive/10 group-hover:bg-gold/20 transition">
          <Icon :name="cat.icon" class="text-2xl text-olive" />
        </div>
        <p class="font-semibold text-olive text-sm">{{ cat.name }}</p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
const categories = [
  { slug: 'skincare', name: 'Skincare', icon: 'mdi:water-outline' },
  { slug: 'perfume', name: 'Perfume', icon: 'mdi:spray-bottle' },
  { slug: 'bags', name: 'Bags', icon: 'mdi:bag-personal-outline' },
  { slug: 'kitchen', name: 'Kitchen', icon: 'mdi:pot-mix-outline' },
  { slug: 'hijab', name: 'Hijab & Essentials', icon: 'mdi:tshirt-crew-outline' },
  { slug: 'accessories', name: 'Accessories', icon: 'mdi:necklace' },
]
</script>