<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="cartUI.isOpen" class="fixed inset-0 z-[100]">
        <div class="absolute inset-0 bg-black/50" @click="cartUI.close()"></div>

        <div
          class="absolute top-0 right-0 h-full w-full sm:w-96 bg-white flex flex-col shadow-xl"
        >
          <div
            class="flex items-center justify-between p-4 border-b border-olive/10"
          >
            <h3 class="font-bold text-olive text-lg">Your Cart</h3>
            <button aria-label="Close cart" @click="cartUI.close()">
              <Icon name="mdi:close" class="text-xl text-olive" />
            </button>
          </div>

          <div
            v-if="cart.items.length === 0"
            class="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <Icon name="mdi:cart-outline" class="text-6xl text-olive/20 mb-4" />
            <p class="font-semibold text-olive mb-1">Your cart is empty</p>
            <p class="text-sm text-taupe mb-6">
              Looks like you haven't added anything yet.
            </p>
            <button
              class="bg-olive text-beige px-6 py-2.5 rounded-full font-semibold hover:bg-gold hover:text-olive transition"
              @click="cartUI.close()"
            >
              Start Shopping
            </button>
          </div>

          <template v-else>
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div
                v-for="item in cart.items"
                :key="item.id"
                class="flex gap-3 pb-4 border-b border-olive/10"
              >
                <div
                  class="w-16 h-16 rounded-lg bg-champagne shrink-0 flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                  <Icon
                    v-else
                    name="mdi:image-outline"
                    class="text-2xl text-olive/30"
                  />
                </div>

                <div class="flex-1">
                  <p class="text-sm font-medium text-olive mb-1">
                    {{ item.name }}
                  </p>
                  <p class="text-sm font-bold text-olive mb-2">
                    EGP {{ item.sale_price ?? item.price }}
                  </p>

                  <div class="flex items-center gap-2">
                    <button
                      class="w-6 h-6 rounded-full border border-olive/20 flex items-center justify-center text-olive hover:bg-olive hover:text-beige transition"
                      @click="cart.decreaseQty(item.id)"
                    >
                      <Icon name="mdi:minus" class="text-xs" />
                    </button>
                    <span class="text-sm w-4 text-center">{{
                      item.quantity
                    }}</span>
                    <button
                      class="w-6 h-6 rounded-full border border-olive/20 flex items-center justify-center text-olive hover:bg-olive hover:text-beige transition"
                      @click="cart.increaseQty(item.id)"
                    >
                      <Icon name="mdi:plus" class="text-xs" />
                    </button>

                    <button
                      class="ml-auto text-taupe hover:text-red-500 transition"
                      aria-label="Remove item"
                      @click="cart.removeItem(item.id)"
                    >
                      <Icon name="mdi:trash-can-outline" class="text-base" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4 border-t border-olive/10">
              <div class="flex items-center justify-between mb-4">
                <span class="font-semibold text-olive">Subtotal</span>
                <span class="font-bold text-olive text-lg"
                  >EGP {{ cart.subtotal }}</span
                >
              </div>
              <button
                class="w-full bg-olive text-beige py-3 rounded-full font-semibold hover:bg-gold hover:text-olive transition"
              >
                Checkout
              </button>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const cartUI = useCartUIStore();
const cart = useCartStore();
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
