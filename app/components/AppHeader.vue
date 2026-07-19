<template>
  <header class="px-6 py-4 bg-olive relative overflow-visible">
    <div class="flex items-center justify-between gap-6">
      <NuxtLink to="/" class="shrink-0">
        <img src="/logo-trimmed.svg" alt="Saadawy Store" class="h-16" />
      </NuxtLink>

      <nav
        class="hidden lg:flex flex-nowrap items-center gap-5 text-beige font-medium text-md flex-1 whitespace-nowrap"
      >
        <NuxtLink to="/" class="hover:text-gold transition">Home</NuxtLink>
        <NuxtLink to="/category/skincare" class="hover:text-gold transition">Skincare</NuxtLink>
        <NuxtLink to="/category/perfume" class="hover:text-gold transition">Perfume</NuxtLink>
        <NuxtLink to="/category/makeup" class="hover:text-gold transition">Makeup</NuxtLink>
        <NuxtLink to="/category/haircare" class="hover:text-gold transition">Haircare</NuxtLink>
        <NuxtLink to="/category/bags" class="hover:text-gold transition">Bags</NuxtLink>
        <NuxtLink to="/category/kitchen" class="hover:text-gold transition">Kitchen</NuxtLink>
        <NuxtLink to="/category/hijab" class="hover:text-gold transition">Hijab & Essentials</NuxtLink>
      </nav>

      <div class="flex items-center gap-5 text-beige shrink-0">
        <div class="hidden lg:flex items-center bg-beige/10 rounded-full px-4 py-2 gap-2 relative">
          <Icon name="mdi:magnify" class="text-beige text-xl" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="bg-transparent text-beige placeholder-beige/60 outline-none text-sm w-40"
            @focus="showResults = true"
          />

          <div
            v-if="showResults && searchQuery.trim().length > 0"
            class="absolute top-full mt-2 left-0 w-80 bg-white rounded-2xl shadow-xl border border-olive/10 overflow-hidden z-50"
          >
            <div v-if="searchPending" class="p-4 text-sm text-taupe text-center">
              Searching...
            </div>

            <div v-else-if="searchResults.length === 0" class="p-4 text-sm text-taupe text-center">
              No products found
            </div>

            <div v-else class="max-h-96 overflow-y-auto">
              <NuxtLink
                v-for="product in searchResults"
                :key="product.id"
                :to="`/product/${product.slug}`"
                class="flex items-center gap-3 p-3 hover:bg-beige/50 transition border-b border-olive/5 last:border-0"
                @click="closeSearch"
              >
                <div class="w-12 h-12 rounded-lg bg-champagne shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-cover"
                  />
                  <Icon v-else name="mdi:image-outline" class="text-lg text-olive/30" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-olive truncate">{{ product.name }}</p>
                  <p class="text-xs text-taupe">EGP {{ product.sale_price ?? product.price }}</p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <button class="lg:hidden hover:text-gold transition" aria-label="Search" @click="isMenuOpen = true">
          <Icon name="mdi:magnify" class="text-2xl" />
        </button>

        <button class="hidden sm:block hover:text-gold transition" aria-label="Wishlist">
          <Icon name="mdi:heart-outline" class="text-2xl" />
        </button>

        <button class="hidden sm:block hover:text-gold transition" aria-label="Account">
          <Icon name="mdi:account-outline" class="text-2xl" />
        </button>

        <button class="relative hover:text-gold transition" aria-label="Cart" @click="cartUI.open()">
          <Icon name="mdi:cart-outline" class="text-2xl" />
          <span class="absolute -top-2 -right-2 bg-gold text-olive text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {{ cart.itemCount }}
          </span>
        </button>

        <button class="lg:hidden" aria-label="Menu" @click="isMenuOpen = !isMenuOpen">
          <Icon :name="isMenuOpen ? 'mdi:close' : 'mdi:menu'" class="text-2xl" />
        </button>
      </div>
    </div>

    <div v-if="isMenuOpen" class="lg:hidden pt-4 mt-4 border-t border-beige/20 text-beige">
      <div class="flex items-center gap-2 bg-beige/10 rounded-full px-4 py-2.5 mb-4">
        <Icon name="mdi:magnify" class="text-lg shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="bg-transparent text-beige placeholder-beige/60 outline-none text-sm w-full"
          @keyup.enter="handleMobileSearch"
        />
      </div>

      <nav class="flex flex-col gap-4 font-medium">
        <NuxtLink to="/" class="hover:text-gold transition" @click="isMenuOpen = false">Home</NuxtLink>
        <NuxtLink to="/category/skincare" class="hover:text-gold transition" @click="isMenuOpen = false">Skincare</NuxtLink>
        <NuxtLink to="/category/makeup" class="hover:text-gold transition" @click="isMenuOpen = false">Makeup</NuxtLink>
        <NuxtLink to="/category/haircare" class="hover:text-gold transition" @click="isMenuOpen = false">Haircare</NuxtLink>
        <NuxtLink to="/category/perfume" class="hover:text-gold transition" @click="isMenuOpen = false">Perfume</NuxtLink>
        <NuxtLink to="/category/bags" class="hover:text-gold transition" @click="isMenuOpen = false">Bags</NuxtLink>
        <NuxtLink to="/category/kitchen" class="hover:text-gold transition" @click="isMenuOpen = false">Kitchen</NuxtLink>
        <NuxtLink to="/category/hijab" class="hover:text-gold transition" @click="isMenuOpen = false">Hijab & Essentials</NuxtLink>
      </nav>

      <div class="flex items-center gap-6 pt-4 mt-4 border-t border-beige/20">
        <button class="flex items-center gap-2 hover:text-gold transition" @click="isMenuOpen = false" aria-label="Wishlist">
          <Icon name="mdi:heart-outline" class="text-xl" />
          <span>Wishlist</span>
        </button>
        <button class="flex items-center gap-2 hover:text-gold transition" @click="isMenuOpen = false" aria-label="Account">
          <Icon name="mdi:account-outline" class="text-xl" />
          <span>Account</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const isMenuOpen = ref(false);
const cartUI = useCartUIStore();
const cart = useCartStore();

const searchQuery = ref("");
const searchResults = ref([]);
const searchPending = ref(false);
const showResults = ref(false);
let debounceTimer = null;

watch(searchQuery, (newValue) => {
  clearTimeout(debounceTimer);

  if (!newValue.trim()) {
    searchResults.value = [];
    return;
  }

  debounceTimer = setTimeout(async () => {
    searchPending.value = true;
    const { products } = await $fetch("/api/products", {
      query: { search: newValue.trim(), limit: 6 },
    });
    searchResults.value = products;
    searchPending.value = false;
  }, 400);
});

function closeSearch() {
  showResults.value = false;
  searchQuery.value = "";
}

function handleMobileSearch() {
  if (searchQuery.value.trim()) {
    isMenuOpen.value = false;
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
}
</script>