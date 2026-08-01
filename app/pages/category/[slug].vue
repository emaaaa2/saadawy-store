<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div class="mb-phi-3">
      <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2">
        Shop by Category
      </p>
      <h1 class="text-phi-h2 font-bold text-olive capitalize mb-4">
        {{ categoryName }}
      </h1>

      <div class="flex items-center bg-white border border-olive/15 rounded-full px-4 py-2.5 gap-2 max-w-sm">
        <Icon name="mdi:magnify" class="text-olive/40 text-lg shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search in this category..."
          class="bg-transparent text-olive placeholder-olive/40 outline-none text-sm w-full"
        />
        <button
          v-if="searchQuery"
          class="text-olive/40 hover:text-olive transition shrink-0"
          aria-label="Clear search"
          @click="searchQuery = ''"
        >
          <Icon name="mdi:close-circle" class="text-lg" />
        </button>
      </div>
    </div>

    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <div v-for="n in 8" :key="n" class="aspect-square bg-olive/5 rounded-2xl animate-pulse"></div>
    </div>

    <div v-else-if="products.length === 0 && !searchQuery" class="text-center py-phi-4">
      <Icon name="mdi:package-variant-closed" class="text-5xl text-olive/20 mb-4" />
      <p class="text-olive font-semibold mb-1">No products yet in this category</p>
      <p class="text-sm text-taupe">Check back soon, we're adding new items every week.</p>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:magnify-close" class="text-5xl text-olive/20 mb-4" />
      <p class="text-olive font-semibold mb-1">No matches for "{{ searchQuery }}"</p>
      <p class="text-sm text-taupe">Try a different search term.</p>
    </div>

    <div v-else v-fade-in class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/product/${product.slug}`"
        class="group bg-white rounded-2xl overflow-hidden border border-olive/10 hover:shadow-lg transition block"
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

          <span
            v-if="product.badge"
            class="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full"
            :class="{
              'bg-olive text-beige': product.badge === 'Best Seller',
              'bg-gold text-beige': product.badge === 'New',
              'bg-rose text-olive': product.badge === 'Sale',
            }"
          >
            {{ product.badge }}
          </span>

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

          <button
            class="absolute inset-x-2 bottom-2 bg-olive/90 text-beige text-xs font-semibold py-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            @click.stop.prevent="quickView.open(product)"
          >
            Quick View
          </button>
        </div>

        <div class="p-3">
          <p class="text-sm font-medium text-olive mb-1 truncate group-hover:text-gold transition">
            {{ product.name }}
          </p>
          <div class="flex items-center justify-between">
            <div>
              <span v-if="product.sale_price" class="text-xs text-taupe line-through mr-1">
                EGP {{ product.price }}
              </span>
              <span class="font-bold text-olive text-sm">
                EGP {{ product.sale_price ?? product.price }}
              </span>
            </div>
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

const categoryName = computed(() => {
  return route.params.slug.replace(/-/g, ' ')
})

const currentPage = ref(1)
const searchQuery = ref('')
const categorySlug = computed(() => route.params.slug)

watch(categorySlug, () => {
  currentPage.value = 1
  searchQuery.value = ''
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const { data, pending } = await useFetch('/api/products', {
  query: {
    category: categorySlug,
    search: searchQuery,
    page: currentPage,
    limit: 24
  },
  watch: [currentPage, searchQuery, categorySlug]
})

const products = computed(() => data.value?.products ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 1)
</script>