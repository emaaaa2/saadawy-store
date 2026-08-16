<template>
  <section class="px-6 pt-6 md:pt-phi-2 pb-8 md:pb-phi-3 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-4 md:mb-phi-3">
      <h2 class="text-xl md:text-phi-h2 font-bold text-olive">New Arrivals</h2>
      <NuxtLink
        to="/category/all"
        class="text-sm font-semibold text-gold hover:underline"
      >
        View All
      </NuxtLink>
    </div>

    <div class="relative -mx-6">
    <div
      class="flex gap-phi-2 overflow-x-auto snap-x snap-mandatory scroll-pl-6 pb-4 px-6 scrollbar-hide"
    >
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/product/${product.slug}`"
        class="snap-start shrink-0 w-[45%] sm:w-[30%] lg:w-[22%] bg-white rounded-2xl overflow-hidden border border-olive/10 hover:shadow-lg transition group block"
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

          <div
            class="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 group-hover:opacity-100 transition"
          >
            <button
              class="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-white/95 text-olive hover:bg-gold transition shadow"
              aria-label="Quick view"
              @click.stop.prevent="quickView.open(product)"
            >
              <Icon name="mdi:eye-outline" class="text-sm" />
              Quick View
            </button>
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
        </div>

        <div class="p-3">
          <p class="text-sm font-medium text-olive mb-1 truncate group-hover:text-gold transition">
            {{ product.name }}
          </p>
          <div class="flex items-center justify-between">
            <div>
              <span
                v-if="product.sale_price"
                class="text-xs text-taupe line-through mr-1"
              >
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

    <div class="pointer-events-none absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-beige to-transparent"></div>
    </div>
  </section>
</template>

<script setup>
const quickView = useQuickViewStore();
const cart = useCartStore();
const wishlist = useWishlistStore();

const { data } = await useFetch("/api/products", {
  query: { limit: 8, page: 2 },
});

const products = computed(() => data.value?.products ?? []);
</script>
