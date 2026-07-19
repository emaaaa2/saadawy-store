<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div class="mb-phi-3">
      <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2">
        Search Results
      </p>
      <h1 class="text-phi-h2 font-bold text-olive">
        "{{ route.query.q }}"
      </h1>
      <p class="text-sm text-taupe mt-1">{{ products.length }} products found</p>
    </div>

    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <div v-for="n in 8" :key="n" class="aspect-square bg-olive/5 rounded-2xl animate-pulse"></div>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:magnify-close" class="text-5xl text-olive/20 mb-4" />
      <p class="text-olive font-semibold mb-1">No products found</p>
      <p class="text-sm text-taupe">Try a different search term.</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <div
        v-for="product in products"
        :key="product.id"
        class="group bg-white rounded-2xl overflow-hidden border border-olive/10 hover:shadow-lg transition"
      >
        <div class="relative aspect-square bg-champagne overflow-hidden">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="mdi:image-outline" class="text-4xl text-olive/30" />
          </div>

          <button
            class="absolute inset-x-2 bottom-2 bg-olive/90 text-beige text-xs font-semibold py-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            @click="quickView.open(product)"
          >
            Quick View
          </button>
        </div>

        <div class="p-3">
          <NuxtLink :to="`/product/${product.slug}`" class="text-sm font-medium text-olive mb-1 truncate hover:text-gold transition block">
            {{ product.name }}
          </NuxtLink>
          <div class="flex items-center justify-between">
            <span class="font-bold text-olive text-sm">
              EGP {{ product.sale_price ?? product.price }}
            </span>
            <button
              class="w-7 h-7 rounded-full bg-olive text-beige flex items-center justify-center hover:bg-gold transition"
              aria-label="Add to cart"
              @click="cart.addItem(product)"
            >
              <Icon name="mdi:cart-outline" class="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const quickView = useQuickViewStore()
const cart = useCartStore()

const { data, pending } = await useFetch('/api/products', {
  query: { search: route.query.q }
})

const products = computed(() => data.value?.products ?? [])
</script>