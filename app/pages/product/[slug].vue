<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div v-if="pending" class="grid md:grid-cols-2 gap-phi-3">
      <div class="aspect-square bg-ink/5 rounded-2xl animate-pulse"></div>
      <div class="space-y-4">
        <div class="h-8 bg-ink/5 rounded-lg w-3/4 animate-pulse"></div>
        <div class="h-6 bg-ink/5 rounded-lg w-1/4 animate-pulse"></div>
        <div class="h-24 bg-ink/5 rounded-lg animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="!product" class="text-center py-phi-5">
      <Icon name="mdi:alert-circle-outline" class="text-5xl text-ink/20 mb-4" />
      <p class="text-ink font-semibold mb-1">{{ $t('product.notFound') }}</p>
      <NuxtLink to="/" class="text-gold hover:underline text-sm">{{ $t('common.backHome') }}</NuxtLink>
    </div>

    <div v-else>
      <nav class="flex items-center flex-wrap gap-1.5 text-sm text-taupe mb-4">
        <NuxtLink to="/" class="hover:text-gold transition">{{ $t('common.home') }}</NuxtLink>
        <Icon name="mdi:chevron-right" class="text-base shrink-0 rtl:-scale-x-100" />
        <NuxtLink :to="`/category/${product.category}`" class="hover:text-gold transition">
          {{ categoryName(product.category) }}
        </NuxtLink>
        <Icon name="mdi:chevron-right" class="text-base shrink-0 rtl:-scale-x-100" />
        <span dir="auto" class="text-ink truncate max-w-[200px] sm:max-w-none">{{ productName(product) }}</span>
      </nav>

      <div class="grid md:grid-cols-2 gap-phi-3">
      <div>
        <div class="relative aspect-square bg-tint rounded-2xl overflow-hidden">
          <NuxtImg
            v-if="galleryImages[activeImageIndex] && !failedImages.has(galleryImages[activeImageIndex])"
            :src="galleryImages[activeImageIndex]"
            :alt="productName(product)"
            :width="600"
            :height="600"
            loading="eager"
            class="w-full h-full object-cover"
            @error="failedImages.add(galleryImages[activeImageIndex])"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="mdi:image-outline" class="text-6xl text-ink/30" />
          </div>

          <span
            v-if="product.badge"
            class="absolute top-3 start-3 text-xs font-bold px-3 py-1.5 rounded-full"
            :class="{
              'bg-olive text-beige': product.badge === 'Best Seller',
              'bg-gold text-beige': product.badge === 'New',
              'bg-rose text-olive': product.badge === 'Sale',
            }"
          >
            {{ badgeLabel(product.badge) }}
          </span>

          <button
            class="absolute top-3 end-3 w-10 h-10 rounded-full bg-surface/90 flex items-center justify-center hover:text-gold transition"
            :aria-label="wishlist.isInWishlist(product.id) ? $t('common.removeFromWishlist') : $t('common.addToWishlist')"
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
              class="absolute start-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/90 flex items-center justify-center hover:text-gold transition"
              :aria-label="$t('product.prevImage')"
              @click="activeImageIndex = (activeImageIndex - 1 + galleryImages.length) % galleryImages.length"
            >
              <Icon name="mdi:chevron-left" class="text-2xl rtl:-scale-x-100" />
            </button>
            <button
              class="absolute end-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/90 flex items-center justify-center hover:text-gold transition"
              :aria-label="$t('product.nextImage')"
              @click="activeImageIndex = (activeImageIndex + 1) % galleryImages.length"
            >
              <Icon name="mdi:chevron-right" class="text-2xl rtl:-scale-x-100" />
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
            <NuxtImg :src="img" :alt="`${productName(product)} ${index + 1}`" :width="100" :height="100" loading="lazy" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <div>
        <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2">
          {{ categoryName(product.category) }}
        </p>
        <h1 dir="auto" class="text-phi-h2 font-bold text-ink mb-2">{{ productName(product) }}</h1>

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
              :class="star <= Math.round(averageRating) ? 'text-gold' : 'text-ink/15'"
            />
          </div>
          <span class="text-sm text-taupe">
            <template v-if="reviewCount > 0">
              {{ tc('product.reviewsSummary', reviewCount, { rating: averageRating.toFixed(1) }) }}
            </template>
            <template v-else>
              {{ $t('product.beFirstToReview') }}
            </template>
          </span>
        </button>

        <div class="mb-6">
          <span v-if="product.sale_price" class="text-lg text-taupe line-through me-2">
            {{ price(product.price) }}
          </span>
          <span class="text-3xl font-bold text-ink">
            {{ price(product.sale_price ?? product.price) }}
          </span>
        </div>

        <p v-if="productDescription(product)" dir="auto" class="text-ink/70 leading-relaxed mb-6 whitespace-pre-line">
          {{ productDescription(product) }}
        </p>

        <p v-if="product.brand" class="text-sm text-ink mb-4">
          <span class="font-semibold">{{ $t('product.brand') }}</span> <bdi>{{ product.brand }}</bdi>
        </p>

        <div v-if="productUsage(product)" class="mb-6">
          <h3 class="text-sm font-semibold text-ink mb-1">{{ $t('product.howToUse') }}</h3>
          <p dir="auto" class="text-sm text-ink/70 leading-relaxed whitespace-pre-line">{{ productUsage(product) }}</p>
        </div>

        <div class="flex items-center gap-2 mb-8">
          <Icon
            :name="product.stock > 0 ? 'mdi:check-circle' : 'mdi:close-circle'"
            :class="product.stock > 0 ? 'text-sage' : 'text-red-400'"
            class="text-lg"
          />
          <span class="text-sm" :class="product.stock > 0 ? 'text-sage' : 'text-red-400'">
            {{ product.stock > 0 ? $t('common.inStock') : $t('common.outOfStock') }}
          </span>
          <span v-if="product.stock > 0 && product.stock < 3" class="text-sm font-semibold text-red-500">
            — {{ $t('common.onlyLeft', { count: product.stock }) }}
          </span>
        </div>

        <div ref="mainCta" class="flex items-center gap-3">
          <div class="flex items-center border border-ink/20 rounded-full">
            <button
              class="w-10 h-10 flex items-center justify-center text-ink hover:bg-ink/5 transition"
              :aria-label="$t('product.decrease')"
              @click="quantity = Math.max(1, quantity - 1)"
            >
              <Icon name="mdi:minus" class="text-sm" />
            </button>
            <span class="w-8 text-center text-sm">{{ quantity }}</span>
            <button
              class="w-10 h-10 flex items-center justify-center text-ink hover:bg-ink/5 transition"
              :aria-label="$t('product.increase')"
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
            {{ $t('common.addToCart') }}
          </button>
        </div>

        <ul class="mt-6 pt-5 border-t border-ink/10 space-y-2.5 text-sm text-ink/80">
          <li v-if="storeSettings.paymentMethods.cash_on_delivery" class="flex items-center gap-2.5">
            <Icon name="mdi:cash" class="text-lg text-gold shrink-0" />
            {{ $t('product.trust.cod') }}
          </li>
          <li v-if="freeShippingOver" class="flex items-center gap-2.5">
            <Icon name="mdi:truck-fast-outline" class="text-lg text-gold shrink-0" />
            {{ $t('product.trust.freeShipping', { amount: price(freeShippingOver) }) }}
          </li>
          <li v-if="settingText('deliveryTime')" class="flex items-center gap-2.5">
            <Icon name="mdi:clock-outline" class="text-lg text-gold shrink-0" />
            {{ $t('product.trust.delivery', { time: settingText('deliveryTime') }) }}
          </li>
          <li class="flex items-center gap-2.5">
            <Icon name="mdi:check-decagram-outline" class="text-lg text-gold shrink-0" />
            {{ $t('product.trust.original') }}
          </li>
          <li class="flex items-center gap-2.5">
            <Icon name="mdi:whatsapp" class="text-lg text-gold shrink-0" />
            <span>
              {{ $t('product.trust.questions') }}
              <a :href="questionLink" target="_blank" rel="noopener noreferrer" class="font-semibold text-ink underline underline-offset-2 hover:text-gold transition">
                {{ $t('product.trust.askWhatsApp') }}
              </a>
            </span>
          </li>
        </ul>
      </div>
      </div>
    </div>

    <Transition name="cta-slide">
      <div
        v-if="product && showStickyCta"
        class="md:hidden fixed inset-x-0 bottom-0 z-40 bg-surface/95 backdrop-blur border-t border-ink/10 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <div class="flex items-center gap-3">
          <div class="min-w-0 flex-1">
            <p dir="auto" class="text-xs text-taupe truncate">{{ productName(product) }}</p>
            <p class="font-bold text-ink">
              {{ price(product.sale_price ?? product.price) }}
              <span v-if="product.sale_price" class="text-xs font-normal text-taupe line-through ms-1">{{ price(product.price) }}</span>
            </p>
          </div>
          <button
            :disabled="product.stock === 0"
            class="shrink-0 bg-olive text-beige px-5 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-40 flex items-center gap-2"
            @click="handleAddToCart"
          >
            <Icon name="mdi:cart-outline" class="text-lg" />
            {{ product.stock === 0 ? $t('common.outOfStock') : $t('common.addToCart') }}
          </button>
        </div>
      </div>
    </Transition>

    <div v-if="relatedProducts.length > 0" class="mt-phi-4">
      <h2 class="text-phi-h2 font-bold text-ink mb-phi-2">{{ $t('product.youMayAlsoLike') }}</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
        <ProductCard v-for="related in relatedProducts" :key="related.id" :product="related" :quick-view="false" />
      </div>
    </div>

    <div id="reviews">
      <ProductReviews v-if="product" :product-id="product.id" :open-trigger="reviewFormTrigger" />
    </div>

    <!-- Recently viewed lives in the browser's storage, so it's only drawn there. -->
    <ClientOnly>
      <div v-if="recentItems.length > 0" class="mt-phi-4">
        <h2 class="text-phi-h2 font-bold text-ink mb-phi-2">{{ $t('product.recentlyViewed') }}</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
          <ProductCard v-for="item in recentItems" :key="item.id" :product="item" :quick-view="false" />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
const route = useRoute()
const cart = useCartStore()
const wishlist = useWishlistStore()
const recentlyViewed = useRecentlyViewedStore()
const { t, tc, isAr, price, productName, productDescription, productUsage, categoryName, settingText } = useLang()
const quantity = ref(1)

const failedImages = reactive(new Set())

const { data, pending } = await useFetch(`/api/products/${route.params.slug}`)
const product = computed(() => data.value?.product ?? null)

const badgeKeys = { 'Best Seller': 'bestSeller', New: 'new', Sale: 'sale' }
const badgeLabel = (badge) => (badgeKeys[badge] ? t(`product.badges.${badgeKeys[badge]}`) : badge)

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

// Search engines read the English page (the default language), so the original Arabic
// name also goes in the title, description and product data; otherwise searches in Arabic
// wouldn't find the product. It isn't added to the page itself.
const originalName = computed(() => {
  const p = product.value
  if (!p || isAr.value || !p.name || p.name === productName(p)) return ''
  return p.name
})
const seoName = computed(() => {
  if (!product.value) return ''
  return originalName.value ? `${productName(product.value)} – ${originalName.value}` : productName(product.value)
})

useSeoMeta({
  title: () => (product.value ? seoName.value : t('product.notFound')),
  ogTitle: () => (product.value ? seoName.value : undefined),
  description: () => product.value
    ? `${seoName.value} — ${price(product.value.sale_price ?? product.value.price)}. ${productDescription(product.value) || t('product.metaFallback')}`
    : undefined,
  ogDescription: () => product.value
    ? `${seoName.value} — ${price(product.value.sale_price ?? product.value.price)}`
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

const storeSettings = useStoreSettings()
const { data: shippingSettings } = await useFetch('/api/shipping-settings', { key: 'shipping-settings' })
const freeShippingOver = computed(() => Number(shippingSettings.value?.free_shipping_threshold) || 0)

const questionLink = computed(() => {
  if (!product.value) return ''
  const text = t('product.trust.whatsAppMessage', {
    name: productName(product.value),
    link: `${siteUrl}/product/${product.value.slug}`,
  })
  return `https://wa.me/${toWhatsAppNumber(storeSettings.value.whatsappSupport)}?text=${encodeURIComponent(text)}`
})

// On phones, keep an Add to Cart bar at the bottom while the main button is off screen.
const mainCta = ref(null)
const showStickyCta = ref(false)
const ctaVisible = useState('mobile-cta-visible', () => false)
let ctaObserver = null

watch(showStickyCta, (value) => { ctaVisible.value = value })

watch(mainCta, (element) => {
  ctaObserver?.disconnect()
  if (!element || !import.meta.client) return
  ctaObserver = new IntersectionObserver(([entry]) => {
    showStickyCta.value = !entry.isIntersecting
  })
  ctaObserver.observe(element)
}, { flush: 'post' })

onUnmounted(() => {
  ctaObserver?.disconnect()
  ctaVisible.value = false
})

const recentItems = computed(() => {
  return recentlyViewed.items.filter((item) => item.id !== product.value?.id).slice(0, 4)
})

watch(product, (value) => {
  if (value) recentlyViewed.track(value)
}, { immediate: true })

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://saadawystore.com'

useHead(() => {
  if (!product.value) return {}

  const p = product.value
  const amount = p.sale_price ?? p.price
  const image = p.image ? (p.image.startsWith('http') ? p.image : `${siteUrl}${p.image}`) : `${siteUrl}/images/pic.jpg`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName(p),
    alternateName: originalName.value || undefined,
    image,
    description: productDescription(p) || productName(p),
    sku: p.sku,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${p.slug}`,
      priceCurrency: 'EGP',
      price: amount,
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  }

  if (reviewCount.value > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.value.toFixed(1),
      reviewCount: reviewCount.value
    }
  }

  return {
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema)
      }
    ]
  }
})
</script>
<style scoped>
.cta-slide-enter-active,
.cta-slide-leave-active {
  transition: transform 0.25s ease;
}
.cta-slide-enter-from,
.cta-slide-leave-to {
  transform: translateY(100%);
}
</style>
