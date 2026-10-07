<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="store.isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="store.close()"></div>

        <div
          class="relative bg-surface rounded-2xl overflow-hidden max-w-2xl w-full grid sm:grid-cols-2 shadow-xl"
        >
          <button
            class="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-surface/90 flex items-center justify-center hover:text-gold transition"
            :aria-label="$t('common.close')"
            @click="store.close()"
          >
            <Icon name="mdi:close" class="text-lg" />
          </button>

          <button
            v-if="store.product"
            class="absolute top-3 start-3 z-10 w-8 h-8 rounded-full bg-surface/90 flex items-center justify-center hover:text-gold transition"
            :aria-label="wishlist.isInWishlist(store.product.id) ? $t('common.removeFromWishlist') : $t('common.addToWishlist')"
            @click="wishlist.toggle(store.product)"
          >
            <Icon
              :name="wishlist.isInWishlist(store.product.id) ? 'mdi:heart' : 'mdi:heart-outline'"
              class="text-lg"
              :class="wishlist.isInWishlist(store.product.id) ? 'text-gold' : ''"
            />
          </button>

          <div
            class="aspect-square bg-tint flex items-center justify-center"
          >
            <img
              v-if="store.product?.image && !failedImages.has(store.product.image)"
              :src="store.product.image"
              :alt="$pname(store.product)"
              class="w-full h-full object-cover"
              @error="failedImages.add(store.product.image)"
            />
            <Icon
              v-else
              name="mdi:image-outline"
              class="text-5xl text-ink/30"
            />
          </div>

          <div class="p-6 flex flex-col justify-center">
            <span
              v-if="store.product?.badge"
              class="inline-block w-fit text-xs font-bold px-2 py-1 rounded-full bg-olive text-beige mb-3"
            >
              {{ badgeLabel(store.product.badge) }}
            </span>

            <h3 dir="auto" class="text-xl font-bold text-ink mb-2">
              {{ $pname(store.product) }}
            </h3>

            <div class="mb-4">
              <span
                v-if="store.product?.sale_price"
                class="text-sm text-taupe line-through me-2"
              >
                {{ $price(store.product?.price) }}
              </span>
              <span class="text-2xl font-bold text-ink">
                {{ $price(store.product?.sale_price ?? store.product?.price) }}
              </span>
            </div>

            <button
              class="bg-olive text-beige px-6 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition flex items-center justify-center gap-2"
              @click="
                cart.addItem(store.product);
                store.close();
              "
            >
              <Icon name="mdi:cart-outline" class="text-lg" />
              {{ $t('common.addToCart') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const store = useQuickViewStore();
const cart = useCartStore();
const wishlist = useWishlistStore();
const failedImages = reactive(new Set());
const { t } = useLang();

const badgeKeys = { 'Best Seller': 'bestSeller', New: 'new', Sale: 'sale' };
const badgeLabel = (badge) => (badgeKeys[badge] ? t(`product.badges.${badgeKeys[badge]}`) : badge);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
