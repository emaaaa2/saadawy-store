<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <h1 class="text-phi-h2 font-bold text-ink mb-1">{{ $t('listing.wishlist.title') }}</h1>
    <p v-if="wishlist.items.length" class="text-sm text-taupe mb-phi-3">{{ tc('listing.wishlist.count', wishlist.items.length) }}</p>

    <div v-if="wishlist.items.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:heart-outline" class="text-5xl text-ink/20 mb-4" />
      <p class="text-ink font-semibold mb-1">{{ $t('listing.wishlist.empty') }}</p>
      <p class="text-sm text-taupe mb-4">{{ $t('listing.wishlist.emptyText') }}</p>
      <NuxtLink to="/" class="text-gold hover:underline text-sm">{{ $t('listing.wishlist.browse') }}</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <ProductCard v-for="product in wishlist.items" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<script setup>
const wishlist = useWishlistStore()
const { t, tc } = useLang()

useSeoMeta({ title: () => t('listing.wishlist.title'), robots: 'noindex' })
</script>
