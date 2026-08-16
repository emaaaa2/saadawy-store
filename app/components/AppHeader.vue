<template>
  <header class="bg-white relative overflow-visible border-b border-olive/10">
    <div class="px-6">
      <div
        class="max-w-6xl mx-auto py-3 min-h-[124px] grid grid-cols-[1fr_auto_1fr] items-center gap-4"
      >
        <div class="flex items-center gap-5 text-olive">
          <button
            class="lg:hidden hover:text-gold transition"
            aria-label="Menu"
            @click="isMenuOpen = !isMenuOpen"
          >
            <Icon
              :name="isMenuOpen ? 'mdi:close' : 'mdi:menu'"
              class="text-2xl"
            />
          </button>

          <button
            class="hidden lg:block hover:text-gold transition"
            aria-label="Search"
            @click="toggleSearch"
          >
            <Icon name="mdi:magnify" class="text-2xl" />
          </button>
        </div>

        <div class="relative justify-self-center self-stretch w-28 lg:w-36">
          <NuxtLink
            to="/"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <img
              src="/logo-trimmed.svg"
              alt="Saadawy Store"
              class="h-16 lg:h-24 w-auto max-w-none"
            />
          </NuxtLink>
        </div>

        <div class="flex items-center justify-end gap-5 text-olive shrink-0">
          <NuxtLink
            to="/wishlist"
            class="hidden sm:block relative hover:text-gold transition"
            aria-label="Wishlist"
          >
            <Icon name="mdi:heart-outline" class="text-2xl" />
            <span
              v-if="wishlist.count > 0"
              class="absolute -top-2 -right-2 bg-gold text-olive text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              {{ wishlist.count }}
            </span>
          </NuxtLink>

          <button
            class="hidden sm:block hover:text-gold transition"
            aria-label="Account"
          >
            <Icon name="mdi:account-outline" class="text-2xl" />
          </button>

          <button
            class="relative hover:text-gold transition"
            aria-label="Cart"
            @click="cartUI.open()"
          >
            <Icon name="mdi:cart-outline" class="text-2xl" />
            <span
              class="absolute -top-2 -right-2 bg-gold text-olive text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              {{ cart.itemCount }}
            </span>
          </button>

          <button
            class="lg:hidden hover:text-gold transition"
            aria-label="Search"
            @click="isMenuOpen = true"
          >
            <Icon name="mdi:magnify" class="text-2xl" />
          </button>
        </div>
      </div>
    </div>

    <Transition name="search-fade">
      <div
        v-if="searchOpen"
        class="fixed inset-0 bg-black/30 z-40"
        @click="closeSearch"
      ></div>
    </Transition>

    <Transition name="search-drop">
      <div v-if="searchOpen" class="absolute inset-x-0 top-full bg-white z-50">
        <div class="max-w-4xl mx-auto px-6 py-6">
          <div class="flex items-center gap-3">
            <Icon name="mdi:magnify" class="text-xl text-olive/40 shrink-0" />
            <input
              ref="searchInputEl"
              v-model="searchQuery"
              type="text"
              placeholder="Search over 4,000 products..."
              class="bg-transparent flex-1 text-olive placeholder-olive/40 outline-none text-base py-1"
              @keyup.enter="handleDesktopSearch"
            />
            <button
              v-if="searchQuery"
              class="text-olive/40 hover:text-gold transition shrink-0"
              aria-label="Clear search"
              @click="searchQuery = ''"
            >
              <Icon name="mdi:close" class="text-xl" />
            </button>
            <button
              class="text-olive/50 hover:text-gold transition shrink-0 border-s border-olive/15 ps-3"
              aria-label="Close search"
              @click="closeSearch"
            >
              <Icon name="mdi:close" class="text-xl" />
            </button>
          </div>

          <div v-if="searchPending" class="py-6 text-sm text-taupe text-center">
            Searching...
          </div>

          <div
            v-else-if="
              searchQuery.trim().length > 0 && searchResults.length === 0
            "
            class="py-6 text-sm text-taupe text-center"
          >
            No products found
          </div>

          <template v-else-if="searchResults.length > 0">
            <div class="pt-4 divide-y divide-olive/5 max-h-96 overflow-y-auto">
              <NuxtLink
                v-for="product in searchResults"
                :key="product.id"
                :to="`/product/${product.slug}`"
                class="flex items-center gap-4 py-3 hover:bg-beige/50 transition"
                @click="closeSearch"
              >
                <div
                  class="w-14 h-14 bg-champagne shrink-0 flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-cover"
                  />
                  <Icon
                    v-else
                    name="mdi:image-outline"
                    class="text-xl text-olive/30"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-olive truncate">
                    {{ product.name }}
                  </p>
                  <p class="text-xs text-taupe">
                    EGP {{ product.sale_price ?? product.price }}
                  </p>
                </div>
              </NuxtLink>
            </div>

            <div class="pt-4 mt-2 border-t border-olive/10">
              <button
                class="w-full bg-olive text-beige py-3 font-semibold hover:bg-gold hover:text-olive transition"
                @click="handleDesktopSearch"
              >
                Show all results for "{{ searchQuery.trim() }}"
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <nav
      class="hidden lg:flex items-center justify-center gap-20 text-olive font-semibold text-lg px-1 py-4"
    >
      <NuxtLink to="/" class="hover:text-gold transition">Home</NuxtLink>
      <NuxtLink to="/category/skincare" class="hover:text-gold transition"
        >Skincare</NuxtLink
      >
      <NuxtLink to="/category/perfume" class="hover:text-gold transition"
        >Perfume</NuxtLink
      >
      <NuxtLink to="/category/makeup" class="hover:text-gold transition"
        >Makeup</NuxtLink
      >
      <NuxtLink to="/category/haircare" class="hover:text-gold transition"
        >Haircare</NuxtLink
      >
      <NuxtLink to="/category/bags" class="hover:text-gold transition"
        >Bags</NuxtLink
      >
      <NuxtLink to="/category/kitchen" class="hover:text-gold transition"
        >Kitchen</NuxtLink
      >
      <NuxtLink to="/category/hijab" class="hover:text-gold transition"
        >Hijab & Essentials</NuxtLink
      >
    </nav>

    <div
      v-if="isMenuOpen"
      class="lg:hidden px-6 pb-6 pt-4 border-t border-olive/10 text-olive bg-white shadow-lg"
    >
      <div
        class="flex items-center gap-2 bg-beige rounded-full px-4 py-2.5 mb-4"
      >
        <Icon name="mdi:magnify" class="text-lg shrink-0 text-olive/50" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="bg-transparent text-olive placeholder-olive/40 outline-none text-sm w-full"
          @keyup.enter="handleMobileSearch"
        />
      </div>

      <nav class="flex flex-col gap-4 font-medium">
        <NuxtLink
          to="/"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Home</NuxtLink
        >
        <NuxtLink
          to="/category/skincare"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Skincare</NuxtLink
        >
        <NuxtLink
          to="/category/makeup"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Makeup</NuxtLink
        >
        <NuxtLink
          to="/category/haircare"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Haircare</NuxtLink
        >
        <NuxtLink
          to="/category/perfume"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Perfume</NuxtLink
        >
        <NuxtLink
          to="/category/bags"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Bags</NuxtLink
        >
        <NuxtLink
          to="/category/kitchen"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Kitchen</NuxtLink
        >
        <NuxtLink
          to="/category/hijab"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
          >Hijab & Essentials</NuxtLink
        >
      </nav>

      <div class="flex items-center gap-6 pt-4 mt-4 border-t border-olive/10">
        <NuxtLink
          to="/wishlist"
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
          aria-label="Wishlist"
        >
          <Icon name="mdi:heart-outline" class="text-xl" />
          <span>Wishlist ({{ wishlist.count }})</span>
        </NuxtLink>
        <button
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
          aria-label="Account"
        >
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
const wishlist = useWishlistStore();

const searchQuery = ref("");
const searchResults = ref([]);
const searchPending = ref(false);
const searchOpen = ref(false);
const searchInputEl = ref(null);
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

function toggleSearch() {
  searchOpen.value = !searchOpen.value;
  if (searchOpen.value) {
    nextTick(() => searchInputEl.value?.focus());
  } else {
    searchQuery.value = "";
    searchResults.value = [];
  }
}

function closeSearch() {
  searchOpen.value = false;
  searchQuery.value = "";
  searchResults.value = [];
}

function handleDesktopSearch() {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim();
    closeSearch();
    navigateTo(`/search?q=${encodeURIComponent(query)}`);
  }
}

function handleMobileSearch() {
  if (searchQuery.value.trim()) {
    isMenuOpen.value = false;
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
}
</script>

<style scoped>
.search-drop-enter-active,
.search-drop-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.search-drop-enter-from,
.search-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}
</style>
