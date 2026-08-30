<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <h1 class="text-phi-h2 font-bold text-olive mb-phi-3">Wishlist</h1>

    <div v-if="wishlist.items.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:heart-outline" class="text-5xl text-olive/20 mb-4" />
      <p class="text-olive font-semibold mb-1">Your wishlist is empty</p>
      <NuxtLink to="/" class="text-gold hover:underline text-sm">Continue shopping</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <div
        v-for="product in wishlist.items"
        :key="product.id"
        class="group"
      >
        <div class="relative aspect-square bg-champagne overflow-hidden">
          <img
            v-if="product.image && !failedImages.has(product.image)"
            :src="product.image"
            :alt="product.name"
            class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            @error="failedImages.add(product.image)"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="mdi:image-outline" class="text-4xl text-olive/30" />
          </div>

          <button
            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:text-gold transition"
            aria-label="Remove from wishlist"
            @click="wishlist.removeItem(product.id)"
          >
            <Icon name="mdi:heart" class="text-lg text-gold" />
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
const wishlist = useWishlistStore()
const cart = useCartStore()
const failedImages = reactive(new Set())
</script>
