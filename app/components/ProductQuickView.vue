<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="store.isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="store.close()"></div>

        <div class="relative bg-white rounded-2xl overflow-hidden max-w-2xl w-full grid sm:grid-cols-2 shadow-xl">
          <button
            class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:text-gold transition"
            aria-label="Close"
            @click="store.close()"
          >
            <Icon name="mdi:close" class="text-lg" />
          </button>

          <div class="aspect-square bg-champagne flex items-center justify-center">
            <img
              v-if="store.product?.image"
              :src="store.product.image"
              :alt="store.product.name"
              class="w-full h-full object-cover"
            />
            <Icon v-else name="mdi:image-outline" class="text-5xl text-olive/30" />
          </div>

          <div class="p-6 flex flex-col justify-center">
            <span
              v-if="store.product?.badge"
              class="inline-block w-fit text-xs font-bold px-2 py-1 rounded-full bg-olive text-beige mb-3"
            >
              {{ store.product.badge }}
            </span>

            <h3 class="text-xl font-bold text-olive mb-2">{{ store.product?.name }}</h3>

            <div class="mb-4">
              <span v-if="store.product?.salePrice" class="text-sm text-taupe line-through mr-2">
                EGP {{ store.product?.price }}
              </span>
              <span class="text-2xl font-bold text-olive">
                EGP {{ store.product?.salePrice ?? store.product?.price }}
              </span>
            </div>

            <button
              class="bg-olive text-beige px-6 py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition flex items-center justify-center gap-2"
              @click="cart.addItem(store.product); quickViewStore.close()"
            >
              <Icon name="mdi:cart-outline" class="text-lg" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const store = useQuickViewStore()
const cart = useCartStore()
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