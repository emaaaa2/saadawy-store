<template>
  <section class="px-6 py-phi-4 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-phi-3">
      <h2 class="text-phi-h2 font-bold text-olive">Best Sellers</h2>
      <NuxtLink
        to="/category/all"
        class="text-sm font-semibold text-gold hover:underline"
      >
        View All
      </NuxtLink>
    </div>

    <div class="grid md:grid-cols-3 gap-phi-2">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-phi-2 md:col-span-2">
        <div
          v-for="product in products"
          :key="product.id"
          class="bg-white rounded-2xl overflow-hidden border border-olive/10 hover:shadow-lg transition group"
        >
          <div
            class="relative aspect-square bg-gradient-to-br from-champagne to-rose flex items-center justify-center"
          >
            <Icon name="mdi:image-outline" class="text-4xl text-olive/30" />
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
              >
                <Icon name="mdi:cart-outline" class="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-olive rounded-2xl p-8 flex flex-col justify-center text-beige"
      >
        <p class="font-serif text-2xl leading-snug mb-4">
          Beauty.<br />Style.<br />Home Essentials.
        </p>
        <div
          class="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center"
        >
          <Icon name="mdi:flower-outline" class="text-gold text-xl" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { products } from "~/data/products";
</script>
