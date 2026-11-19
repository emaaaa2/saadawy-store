<template>
  <section v-if="products.length" class="px-6 pt-4 md:pt-phi-2 pb-4 md:pb-phi-2 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-4 md:mb-phi-2">
      <h2 class="text-xl md:text-phi-h2 font-bold text-ink">{{ title }}</h2>
      <NuxtLink v-if="link" :to="link" class="text-sm font-semibold text-gold hover:underline">
        {{ $t('common.viewAll') }}
      </NuxtLink>
    </div>

    <div class="relative -mx-6">
      <div class="flex gap-phi-2 overflow-x-auto snap-x snap-mandatory scroll-ps-6 pb-4 px-6 scrollbar-hide">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :badge="badge"
          class="snap-start shrink-0 w-[45%] sm:w-[30%] lg:w-[22%]"
        />
      </div>

      <div class="pointer-events-none absolute end-0 top-0 bottom-4 w-16 bg-gradient-to-l rtl:bg-gradient-to-r from-page to-transparent"></div>
    </div>
  </section>
</template>

<script setup>
// One horizontal shelf of products on the home page (hidden when it has none).
defineProps({
  title: { type: String, required: true },
  link: { type: String, default: '' },
  products: { type: Array, default: () => [] },
  badge: { type: String, default: '' },
})
</script>
