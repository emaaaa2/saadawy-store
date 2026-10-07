<template>
  <section class="px-6 pt-6 md:pt-phi-2 pb-8 md:pb-phi-3 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-4 md:mb-phi-3">
      <h2 class="text-xl md:text-phi-h2 font-bold text-ink">{{ $t('home.newArrivals') }}</h2>
      <NuxtLink
        to="/new-arrivals"
        class="text-sm font-semibold text-gold hover:underline"
      >
        {{ $t('common.viewAll') }}
      </NuxtLink>
    </div>

    <div class="relative -mx-6">
      <div
        class="flex gap-phi-2 overflow-x-auto snap-x snap-mandatory scroll-ps-6 pb-4 px-6 scrollbar-hide"
      >
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          class="snap-start shrink-0 w-[45%] sm:w-[30%] lg:w-[22%]"
        />
      </div>

      <div class="pointer-events-none absolute end-0 top-0 bottom-4 w-16 bg-gradient-to-l rtl:bg-gradient-to-r from-page to-transparent"></div>
    </div>
  </section>
</template>

<script setup>
const { data } = await useFetch("/api/products", {
  query: { limit: 8, page: 2 },
});

const products = computed(() => data.value?.products ?? []);
</script>
