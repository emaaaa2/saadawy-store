<template>
  <section class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-phi-3">
      <h2 class="text-phi-h2 font-bold text-olive">Best Sellers</h2>
      <NuxtLink
        to="/category/all"
        class="text-sm font-semibold text-gold hover:underline"
      >
        View All
      </NuxtLink>
    </div>

    <div
      class="flex gap-phi-2 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="snap-start shrink-0 w-[45%] sm:w-[30%] lg:w-[22%] bg-white rounded-2xl overflow-hidden border border-olive/10 hover:shadow-lg transition group"
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
              @click="quickView.open(product)"
            >
              <Icon name="mdi:eye-outline" class="text-sm" />
              Quick View
            </button>
          </div>

          <span
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
            aria-label="Add to wishlist"
          >
            <Icon name="mdi:heart-outline" class="text-lg" />
          </button>
        </div>

        <div class="p-3">
          <p class="text-sm font-medium text-olive mb-1 truncate">
            {{ product.name }}
          </p>
          <div class="flex items-center justify-between">
            <div>
              <span
                v-if="product.salePrice"
                class="text-xs text-taupe line-through mr-1"
              >
                EGP {{ product.price }}
              </span>
              <span class="font-bold text-olive text-sm">
                EGP {{ product.salePrice ?? product.price }}
              </span>
            </div>
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
  </section>
</template>

<script setup>
import { products } from "~/data/products";

const quickView = useQuickViewStore();
const cart = useCartStore();
</script>
