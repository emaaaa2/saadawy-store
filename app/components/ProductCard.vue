<template>
  <NuxtLink :to="`/product/${product.slug}`" class="group block">
    <div class="relative aspect-square bg-tint overflow-hidden">
      <NuxtImg
        v-if="product.image && !imageFailed"
        :src="product.image"
        :alt="$pname(product)"
        :width="300"
        :height="300"
        loading="lazy"
        class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        @error="imageFailed = true"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon name="mdi:image-outline" class="text-4xl text-ink/30" />
      </div>

      <span
        v-if="shownBadge"
        class="absolute top-2 start-2 text-xs font-bold px-2 py-1 rounded-full"
        :class="badgeStyles[shownBadge] ?? 'bg-olive text-beige'"
      >
        {{ badgeLabel(shownBadge) }}
      </span>

      <button
        class="absolute top-2 end-2 w-8 h-8 rounded-full bg-surface/80 flex items-center justify-center hover:text-gold transition"
        :aria-label="wishlist.isInWishlist(product.id) ? $t('common.removeFromWishlist') : $t('common.addToWishlist')"
        @click.stop.prevent="wishlist.toggle(product)"
      >
        <Icon
          :name="wishlist.isInWishlist(product.id) ? 'mdi:heart' : 'mdi:heart-outline'"
          class="text-lg"
          :class="wishlist.isInWishlist(product.id) ? 'text-gold' : ''"
        />
      </button>

      <div
        v-if="quickView"
        class="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
      >
        <button
          class="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-surface/95 text-ink hover:bg-gold hover:text-beige transition shadow-md"
          @click.stop.prevent="quickViewStore.open(product)"
        >
          <Icon name="mdi:eye-outline" class="text-sm" />
          {{ $t('common.quickView') }}
        </button>
      </div>
    </div>

    <div class="p-3">
      <p dir="auto" class="text-sm font-medium text-ink mb-1 truncate group-hover:text-gold transition">
        {{ $pname(product) }}
      </p>
      <div v-if="product.reviewCount" class="flex items-center gap-1 mb-1">
        <Icon
          v-for="star in 5"
          :key="star"
          name="mdi:star"
          class="text-xs"
          :class="star <= Math.round(product.rating) ? 'text-gold' : 'text-ink/15'"
        />
        <span class="text-xs text-taupe">({{ product.reviewCount }})</span>
      </div>
      <p v-if="product.stock > 0 && product.stock < 3" class="text-xs font-semibold text-red-500 mb-1">
        {{ $t('common.onlyLeft', { count: product.stock }) }}
      </p>
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0">
          <span v-if="product.sale_price" class="text-xs text-taupe line-through me-1">
            {{ $price(product.price) }}
          </span>
          <span class="font-bold text-ink text-sm">
            {{ $price(product.sale_price ?? product.price) }}
          </span>
        </div>
        <button
          class="w-7 h-7 shrink-0 rounded-full bg-olive text-beige flex items-center justify-center hover:bg-gold transition"
          :aria-label="$t('common.addToCart')"
          @click.stop.prevent="cart.addItem(product)"
        >
          <Icon name="mdi:cart-outline" class="text-sm" />
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, required: true },
  // Show this badge instead of the product's own (e.g. "Best Seller" in that section).
  badge: { type: String, default: '' },
  quickView: { type: Boolean, default: true },
})

const cart = useCartStore()
const wishlist = useWishlistStore()
const quickViewStore = useQuickViewStore()
const { t } = useLang()
const imageFailed = ref(false)

watch(() => props.product.image, () => { imageFailed.value = false })

const shownBadge = computed(() => props.badge || props.product.badge || '')

const badgeStyles = {
  'Best Seller': 'bg-olive text-beige',
  New: 'bg-gold text-beige',
  Sale: 'bg-rose text-olive',
}

const badgeKeys = { 'Best Seller': 'bestSeller', New: 'new', Sale: 'sale' }
const badgeLabel = (badge) => (badgeKeys[badge] ? t(`product.badges.${badgeKeys[badge]}`) : badge)
</script>
