<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div v-if="pending" class="grid md:grid-cols-2 gap-phi-3">
      <div class="aspect-square bg-olive/5 rounded-2xl animate-pulse"></div>
      <div class="space-y-4">
        <div class="h-8 bg-olive/5 rounded-lg w-3/4 animate-pulse"></div>
        <div class="h-6 bg-olive/5 rounded-lg w-1/4 animate-pulse"></div>
        <div class="h-24 bg-olive/5 rounded-lg animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="!product" class="text-center py-phi-5">
      <Icon name="mdi:alert-circle-outline" class="text-5xl text-olive/20 mb-4" />
      <p class="text-olive font-semibold mb-1">Product not found</p>
      <NuxtLink to="/" class="text-gold hover:underline text-sm">Back to homepage</NuxtLink>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-phi-3">
      <div>
        <div class="relative aspect-square bg-champagne rounded-2xl overflow-hidden">
          <NuxtImg
            v-if="galleryImages[activeImageIndex] && !failedImages.has(galleryImages[activeImageIndex])"
            :src="galleryImages[activeImageIndex]"
            :alt="product.name"
            width="600"
            height="600"
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="eager"
            class="w-full h-full object-cover"
            @error="failedImages.add(galleryImages[activeImageIndex])"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="mdi:image-outline" class="text-6xl text-olive/30" />
          </div>

          <span
            v-if="product.badge"
            class="absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full"
            :class="{
              'bg-olive text-beige': product.badge === 'Best Seller',
              'bg-gold text-beige': product.badge === 'New',
              'bg-rose text-olive': product.badge === 'Sale',
            }"
          >
            {{ product.badge }}
          </span>

          <button
            class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:text-gold transition"
            :aria-label="wishlist.isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
            @click="wishlist.toggle(product)"
          >
            <Icon
              :name="wishlist.isInWishlist(product.id) ? 'mdi:heart' : 'mdi:heart-outline'"
              class="text-xl"
              :class="wishlist.isInWishlist(product.id) ? 'text-gold' : ''"
            />
          </button>

          <template v-if="galleryImages.length > 1">
            <button
              class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:text-gold transition"
              aria-label="Previous image"
              @click="activeImageIndex = (activeImageIndex - 1 + galleryImages.length) % galleryImages.length"
            >
              <Icon name="mdi:chevron-left" class="text-2xl" />
            </button>
            <button
              class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:text-gold transition"
              aria-label="Next image"
              @click="activeImageIndex = (activeImageIndex + 1) % galleryImages.length"
            >
              <Icon name="mdi:chevron-right" class="text-2xl" />
            </button>
          </template>
        </div>

        <div v-if="galleryImages.length > 1" class="grid grid-cols-5 gap-2 mt-3">
          <button
            v-for="(img, index) in galleryImages"
            :key="index"
            class="aspect-square rounded-lg overflow-hidden border-2 transition"
            :class="index === activeImageIndex ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'"
            @click="activeImageIndex = index"
          >
            <NuxtImg :src="img" :alt="`${product.name} ${index + 1}`" width="100" height="100" loading="lazy" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <div>
        <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2 capitalize">
          {{ product.category }}
        </p>
        <h1 class="text-phi-h2 font-bold text-olive mb-2">{{ product.name }}</h1>

        <button
          class="flex items-center gap-2 mb-4 hover:opacity-80 transition"
          @click="scrollToReviews"
        >
          <div class="flex gap-0.5">
            <Icon
              v-for="star in 5"
              :key="star"
              name="mdi:star"
              class="text-base"
              :class="star <= Math.round(averageRating) ? 'text-gold' : 'text-olive/15'"
            />
          </div>
          <span class="text-sm text-taupe">
            <template v-if="reviewCount > 0">
              {{ averageRating.toFixed(1) }} ({{ reviewCount }} review{{ reviewCount > 1 ? "s" : "" }})
            </template>
            <template v-else>
              Be the first to review
            </template>
          </span>
        </button>

        <div class="mb-6">
          <span v-if="product.sale_price" class="text-lg text-taupe line-through mr-2">
            EGP {{ product.price }}
          </span>
          <span class="text-3xl font-bold text-olive">
            EGP {{ product.sale_price ?? product.price }}
          </span>
        </div>

        <p class="text-olive/70 leading-relaxed mb-6">
          {{ product.description }}
        </p>

        <p v-if="product.brand" class="text-sm text-olive mb-4">
          <span class="font-semibold">Brand:</span> {{ product.brand }}
        </p>

        <div v-if="product.usage_info" class="mb-6">
          <h3 class="text-sm font-semibold text-olive mb-1">Ingredients / How to Use</h3>
          <p class="text-sm text-olive/70 leading-relaxed whitespace-pre-line">{{ product.usage_info }}</p>
        </div>

        <div class="flex items-center gap-2 mb-8">
          <Icon
            :name="product.stock > 0 ? 'mdi:check-circle' : 'mdi:close-circle'"
            :class="product.stock > 0 ? 'text-sage' : 'text-red-400'"
            class="text-lg"
          />
          <span class="text-sm" :class="product.stock > 0 ? 'text-sage' : 'text-red-400'">
            {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center border border-olive/20 rounded-full">
            <button
              class="w-10 h-10 flex items-center justify-center text-olive hover:bg-olive/5 transition"
              @click="quantity = Math.max(1, quantity - 1)"
            >
              <Icon name="mdi:minus" class="text-sm" />
            </button>
            <span class="w-8 text-center text-sm">{{ quantity }}</span>
            <button
              class="w-10 h-10 flex items-center justify-center text-olive hover:bg-olive/5 transition"
              @click="quantity = Math.min(product.stock, quantity + 1)"
            >
              <Icon name="mdi:plus" class="text-sm" />
            </button>
          </div>

          <button
            :disabled="product.stock === 0"
            class="flex-1 bg-olive text-beige py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            @click="handleAddToCart"
          >
            <Icon name="mdi:cart-outline" class="text-lg" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>

    <div v-if="relatedProducts.length > 0" class="mt-phi-4">
      <h2 class="text-phi-h2 font-bold text-olive mb-phi-2">You May Also Like</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
        <NuxtLink
          v-for="related in relatedProducts"
          :key="related.id"
          :to="`/product/${related.slug}`"
          class="group block"
        >
          <div class="relative aspect-square bg-champagne overflow-hidden">
            <NuxtImg
              v-if="related.image && !failedImages.has(related.image)"
              :src="related.image"
              :alt="related.name"
              width="300"
              height="300"
              sizes="(min-width: 768px) 25vw, 50vw"
              loading="lazy"
              class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              @error="failedImages.add(related.image)"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon name="mdi:image-outline" class="text-4xl text-olive/30" />
            </div>

            <button
              class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:text-gold transition"
              :aria-label="wishlist.isInWishlist(related.id) ? 'Remove from wishlist' : 'Add to wishlist'"
              @click.stop.prevent="wishlist.toggle(related)"
            >
              <Icon
                :name="wishlist.isInWishlist(related.id) ? 'mdi:heart' : 'mdi:heart-outline'"
                class="text-lg"
                :class="wishlist.isInWishlist(related.id) ? 'text-gold' : ''"
              />
            </button>
          </div>

          <div class="p-3">
            <p class="text-sm font-medium text-olive mb-1 truncate group-hover:text-gold transition">
              {{ related.name }}
            </p>
            <div v-if="related.reviewCount" class="flex items-center gap-1 mb-1">
              <Icon
                v-for="star in 5"
                :key="star"
                name="mdi:star"
                class="text-xs"
                :class="star <= Math.round(related.rating) ? 'text-gold' : 'text-olive/15'"
              />
              <span class="text-xs text-taupe">({{ related.reviewCount }})</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-bold text-olive text-sm">
                EGP {{ related.sale_price ?? related.price }}
              </span>
              <button
                class="w-7 h-7 rounded-full bg-olive text-beige flex items-center justify-center hover:bg-gold transition"
                aria-label="Add to cart"
                @click.stop.prevent="cart.addItem(related)"
              >
                <Icon name="mdi:cart-outline" class="text-sm" />
              </button>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div id="reviews">
      <ProductReviews v-if="product" :product-id="product.id" :open-trigger="reviewFormTrigger" />
    </div>

    <div v-if="recentItems.length > 0" class="mt-phi-4">
      <h2 class="text-phi-h2 font-bold text-olive mb-phi-2">Recently Viewed</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
        <NuxtLink
          v-for="item in recentItems"
          :key="item.id"
          :to="`/product/${item.slug}`"
          class="group block"
        >
          <div class="relative aspect-square bg-champagne overflow-hidden">
            <NuxtImg
              v-if="item.image && !failedImages.has(item.image)"
              :src="item.image"
              :alt="item.name"
              width="300"
              height="300"
              sizes="(min-width: 768px) 25vw, 50vw"
              loading="lazy"
              class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              @error="failedImages.add(item.image)"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon name="mdi:image-outline" class="text-4xl text-olive/30" />
            </div>
          </div>

          <div class="p-3">
            <p class="text-sm font-medium text-olive mb-1 truncate group-hover:text-gold transition">
              {{ item.name }}
            </p>
            <span class="font-bold text-olive text-sm">
              EGP {{ item.sale_price ?? item.price }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const cart = useCartStore()
const wishlist = useWishlistStore()
const recentlyViewed = useRecentlyViewedStore()
const quantity = ref(1)

const failedImages = reactive(new Set())

const { data, pending } = await useFetch(`/api/products/${route.params.slug}`)
const product = computed(() => data.value?.product ?? null)

const activeImageIndex = ref(0)
const galleryImages = computed(() => {
  if (!product.value) return []
  const extra = product.value.images ?? []
  const all = product.value.image ? [product.value.image, ...extra] : extra
  return [...new Set(all)]
})

watch(product, () => {
  activeImageIndex.value = 0
})

useSeoMeta({
  title: () => product.value?.name ?? 'Product',
  ogTitle: () => product.value?.name,
  description: () => product.value
    ? `${product.value.name} — EGP ${product.value.sale_price ?? product.value.price}. ${product.value.description ?? 'Shop now at Saadawy Store.'}`
    : undefined,
  ogDescription: () => product.value
    ? `${product.value.name} — EGP ${product.value.sale_price ?? product.value.price}`
    : undefined,
  ogImage: () => product.value?.image || '/images/pic.jpg'
})

const relatedData = ref(null)
if (product.value) {
  const { data: related } = await useFetch('/api/products', {
    query: { category: product.value.category, limit: 5 }
  })
  relatedData.value = related.value
}

const relatedProducts = computed(() => {
  return (relatedData.value?.products ?? [])
    .filter((p) => p.id !== product.value?.id)
    .slice(0, 4)
})

const reviewsSummary = ref(null)
if (product.value) {
  const { data: reviewsData } = await useFetch('/api/reviews', {
    query: { productId: product.value.id, limit: 50 }
  })
  reviewsSummary.value = reviewsData.value
}

const reviewCount = computed(() => reviewsSummary.value?.reviews?.length ?? 0)
const averageRating = computed(() => {
  const reviews = reviewsSummary.value?.reviews ?? []
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
})

const reviewFormTrigger = ref(0)

function scrollToReviews() {
  document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  reviewFormTrigger.value++
}

function handleAddToCart() {
  for (let i = 0; i < quantity.value; i++) {
    cart.addItem(product.value)
  }
}

const recentItems = computed(() => {
  return recentlyViewed.items.filter((item) => item.id !== product.value?.id).slice(0, 4)
})

watch(product, (value) => {
  if (value) recentlyViewed.track(value)
}, { immediate: true })
</script>