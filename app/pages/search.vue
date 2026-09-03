<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div class="mb-phi-3">
      <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2">
        Search Results
      </p>
      <h1 class="text-phi-h2 font-bold text-olive">
        "{{ route.query.q }}"
      </h1>
      <p class="text-sm text-taupe mt-1">{{ total }} products found</p>
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
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/product/${product.slug}`"
        class="group block"
      >
        <div class="relative aspect-square bg-champagne overflow-hidden">
          <NuxtImg
            v-if="product.image && !failedImages.has(product.image)"
            :src="product.image"
            :alt="product.name"
            width="400"
            height="400"
            sizes="(min-width: 768px) 25vw, 50vw"
            loading="lazy"
            class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            @error="failedImages.add(product.image)"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="mdi:image-outline" class="text-4xl text-olive/30" />
          </div>

          <button
            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:text-gold transition"
            :aria-label="wishlist.isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
            @click.stop.prevent="wishlist.toggle(product)"
          >
            <Icon
              :name="wishlist.isInWishlist(product.id) ? 'mdi:heart' : 'mdi:heart-outline'"
              class="text-lg"
              :class="wishlist.isInWishlist(product.id) ? 'text-gold' : ''"
            />
          </button>

          <div
            class="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          >
            <button
              class="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white/95 text-olive hover:bg-gold hover:text-beige transition shadow-md"
              aria-label="Quick view"
              @click.stop.prevent="quickView.open(product)"
            >
              <Icon name="mdi:eye-outline" class="text-sm" />
              Quick View
            </button>
          </div>
        </div>

        <div class="p-3">
          <p class="text-sm font-medium text-olive mb-1 truncate group-hover:text-gold transition">
            {{ product.name }}
          </p>
          <div v-if="product.reviewCount" class="flex items-center gap-1 mb-1">
            <Icon
              v-for="star in 5"
              :key="star"
              name="mdi:star"
              class="text-xs"
              :class="star <= Math.round(product.rating) ? 'text-gold' : 'text-olive/15'"
            />
            <span class="text-xs text-taupe">({{ product.reviewCount }})</span>
          </div>
          <p v-if="product.stock > 0 && product.stock < 3" class="text-xs font-semibold text-red-500 mb-1">
            Only {{ product.stock }} left!
          </p>
          <div class="flex items-center justify-between">
            <span class="font-bold text-olive text-sm">
              EGP {{ product.sale_price ?? product.price }}
            </span>
            <button
              class="w-7 h-7 rounded-full bg-olive text-beige flex items-center justify-center hover:bg-gold transition"
              aria-label="Add to cart"
              @click.stop.prevent="cart.addItem(product)"
            >
              <Icon name="mdi:cart-outline" class="text-sm" />
            </button>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-phi-3">
      <button
        :disabled="currentPage === 1"
        class="px-4 py-2 rounded-full text-sm border border-olive/20 disabled:opacity-30 hover:bg-olive/5 transition"
        @click="currentPage--"
      >
        Previous
      </button>
      <span class="text-sm text-olive/70">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        class="px-4 py-2 rounded-full text-sm border border-olive/20 disabled:opacity-30 hover:bg-olive/5 transition"
        @click="currentPage++"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const quickView = useQuickViewStore()
const cart = useCartStore()
const wishlist = useWishlistStore()

const currentPage = ref(1)
const searchTerm = computed(() => route.query.q)

watch(searchTerm, () => {
  currentPage.value = 1
})

const { data, pending } = await useFetch('/api/products', {
  query: { search: searchTerm, page: currentPage, limit: 24 },
  watch: [currentPage, searchTerm]
})

const products = computed(() => data.value?.products ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 1)
const failedImages = reactive(new Set())
</script>