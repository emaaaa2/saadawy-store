<template>
  <header class="bg-surface relative overflow-visible border-b border-ink/10">
    <div class="px-4 sm:px-6">
      <div
        class="max-w-6xl mx-auto py-3 min-h-[124px] grid grid-cols-[1fr_auto_1fr] items-center gap-4"
      >
        <div class="flex items-center gap-2.5 sm:gap-5 text-ink">
          <button
            class="lg:hidden hover:text-gold transition"
            :aria-label="$t('common.menu')"
            @click="isMenuOpen = !isMenuOpen"
          >
            <Icon
              :name="isMenuOpen ? 'mdi:close' : 'mdi:menu'"
              class="text-2xl"
            />
          </button>

          <button
            class="hidden lg:block hover:text-gold transition"
            :aria-label="$t('common.search')"
            @click="toggleSearch"
          >
            <Icon name="mdi:magnify" class="text-2xl" />
          </button>

          <LangSwitch class="hidden lg:inline-flex" />
          <ThemeSwitch class="hidden lg:inline-flex" />
          <!-- Phones and tablets: one tap, always in view. -->
          <LangSwitch compact class="lg:hidden" />
          <ThemeSwitch compact class="lg:hidden" />
        </div>

        <div class="relative justify-self-center self-stretch w-28 lg:w-36">
          <NuxtLink
            to="/"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <img
              src="/logo-trimmed.svg"
              :alt="$t('common.storeName')"
              class="h-16 lg:h-24 w-auto max-w-none dark:hidden"
            />
            <img
              src="/logo-trimmed-beige.svg"
              :alt="$t('common.storeName')"
              class="h-16 lg:h-24 w-auto max-w-none hidden dark:block"
            />
          </NuxtLink>
        </div>

        <div class="flex items-center justify-end gap-5 text-ink shrink-0">
          <NuxtLink
            to="/wishlist"
            class="hidden sm:block relative hover:text-gold transition"
            :aria-label="$t('nav.wishlist')"
          >
            <Icon name="mdi:heart-outline" class="text-2xl" />
            <span
              v-if="wishlist.count > 0"
              class="absolute -top-2 -end-2 bg-gold text-olive text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              {{ wishlist.count }}
            </span>
          </NuxtLink>

          <NuxtLink
            to="/track-order"
            class="hidden sm:block hover:text-gold transition"
            :aria-label="$t('nav.trackOrder')"
          >
            <Icon name="mdi:truck-outline" class="text-2xl" />
          </NuxtLink>

          <NuxtLink
            v-if="isAdmin"
            to="/admin"
            class="hidden sm:block hover:text-gold transition"
            :aria-label="$t('nav.dashboard')"
          >
            <Icon name="mdi:view-dashboard-outline" class="text-2xl" />
          </NuxtLink>

          <NuxtLink
            to="/account"
            class="hidden sm:block hover:text-gold transition"
            :aria-label="user ? $t('nav.myAccount') : $t('nav.signIn')"
          >
            <img
              v-if="accountAvatar && !avatarFailed"
              :src="accountAvatar"
              alt=""
              referrerpolicy="no-referrer"
              class="w-7 h-7 rounded-full object-cover ring-1 ring-ink/15"
              @error="avatarFailed = true"
            />
            <Icon v-else name="mdi:account-outline" class="text-2xl" />
          </NuxtLink>

          <button
            class="relative hover:text-gold transition"
            :aria-label="$t('nav.cart')"
            @click="cartUI.open()"
          >
            <Icon name="mdi:cart-outline" class="text-2xl" />
            <span
              class="absolute -top-2 -end-2 bg-gold text-olive text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              {{ cart.itemCount }}
            </span>
          </button>

          <button
            class="lg:hidden hover:text-gold transition"
            :aria-label="$t('common.search')"
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
      <div v-if="searchOpen" class="absolute inset-x-0 top-full bg-surface z-50">
        <div class="max-w-4xl mx-auto px-6 py-6">
          <div class="flex items-center gap-3">
            <Icon name="mdi:magnify" class="text-xl text-ink/40 shrink-0" />
            <input
              ref="searchInputEl"
              v-model="searchQuery"
              type="text"
              dir="auto"
              :placeholder="$t('nav.searchPlaceholder')"
              class="bg-transparent flex-1 text-ink placeholder-ink/40 outline-none text-base py-1"
              @keyup.enter="handleDesktopSearch"
            />
            <button
              v-if="searchQuery"
              class="text-ink/40 hover:text-gold transition shrink-0"
              :aria-label="$t('nav.clearSearch')"
              @click="searchQuery = ''"
            >
              <Icon name="mdi:close" class="text-xl" />
            </button>
            <button
              class="text-ink/50 hover:text-gold transition shrink-0 border-s border-ink/15 ps-3"
              :aria-label="$t('nav.closeSearch')"
              @click="closeSearch"
            >
              <Icon name="mdi:close" class="text-xl" />
            </button>
          </div>

          <div v-if="searchPending" class="py-6 text-sm text-taupe text-center">
            {{ $t('nav.searching') }}
          </div>

          <div
            v-else-if="
              searchQuery.trim().length > 0 && searchResults.length === 0
            "
            class="py-6 text-sm text-taupe text-center"
          >
            {{ $t('nav.noResults') }}
          </div>

          <template v-else-if="searchResults.length > 0">
            <div class="pt-4 divide-y divide-ink/5 max-h-96 overflow-y-auto">
              <NuxtLink
                v-for="product in searchResults"
                :key="product.id"
                :to="`/product/${product.slug}`"
                class="flex items-center gap-4 py-3 hover:bg-page/50 transition"
                @click="closeSearch"
              >
                <div
                  class="w-14 h-14 bg-tint shrink-0 flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="product.image && !failedSearchImages.has(product.image)"
                    :src="product.image"
                    :alt="$pname(product)"
                    class="w-full h-full object-cover"
                    @error="failedSearchImages.add(product.image)"
                  />
                  <Icon
                    v-else
                    name="mdi:image-outline"
                    class="text-xl text-ink/30"
                  />
                </div>
                <div class="min-w-0">
                  <p dir="auto" class="text-sm font-medium text-ink truncate">
                    {{ $pname(product) }}
                  </p>
                  <p class="text-xs text-taupe">
                    {{ $price(product.sale_price ?? product.price) }}
                  </p>
                </div>
              </NuxtLink>
            </div>

            <div class="pt-4 mt-2 border-t border-ink/10">
              <button
                class="w-full bg-olive text-beige py-3 font-semibold hover:bg-gold hover:text-olive transition"
                @click="handleDesktopSearch"
              >
                {{ $t('nav.showAllResults', { query: searchQuery.trim() }) }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <nav
      class="hidden lg:flex items-center justify-between flex-wrap gap-y-2 text-ink font-semibold text-base max-w-6xl mx-auto px-6 py-4"
    >
      <NuxtLink to="/" class="hover:text-gold transition">{{ $t('nav.home') }}</NuxtLink>
      <NuxtLink to="/quiz" class="hover:text-gold transition">{{ $t('nav.beautyQuiz') }}</NuxtLink>
      <div v-for="cat in navCategories" :key="cat.slug" class="relative group">
        <NuxtLink :to="`/category/${cat.slug}`" class="hover:text-gold transition">{{
          categoryName(cat.slug)
        }}</NuxtLink>
        <div
          class="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50"
        >
          <div class="bg-surface border border-ink/10 rounded-xl shadow-lg py-2 min-w-[180px] text-sm font-normal">
            <NuxtLink
              v-for="sub in cat.subcategories"
              :key="sub.value"
              :to="`/category/${cat.slug}?subcategory=${sub.value}`"
              class="block px-4 py-2 text-ink hover:bg-page/50 hover:text-gold transition"
              >{{ subcategoryLabel(sub) }}</NuxtLink
            >
          </div>
        </div>
      </div>
    </nav>

    <div
      v-if="isMenuOpen"
      class="lg:hidden px-6 pb-6 pt-4 border-t border-ink/10 text-ink bg-surface shadow-lg"
    >
      <div
        class="flex items-center gap-2 bg-page rounded-full px-4 py-2.5 mb-4"
      >
        <Icon name="mdi:magnify" class="text-lg shrink-0 text-ink/50" />
        <input
          v-model="searchQuery"
          type="text"
          dir="auto"
          :placeholder="$t('nav.searchPlaceholderShort')"
          class="bg-transparent text-ink placeholder-ink/40 outline-none text-sm w-full"
          @keyup.enter="handleMobileSearch"
        />
      </div>

      <nav class="flex flex-col gap-4 font-medium">
        <NuxtLink to="/" class="hover:text-gold transition" @click="isMenuOpen = false">{{ $t('nav.home') }}</NuxtLink>
        <NuxtLink to="/quiz" class="hover:text-gold transition" @click="isMenuOpen = false">{{ $t('nav.beautyQuiz') }}</NuxtLink>
        <NuxtLink
          v-for="cat in navCategories"
          :key="cat.slug"
          :to="`/category/${cat.slug}`"
          class="hover:text-gold transition"
          @click="isMenuOpen = false"
        >{{ categoryName(cat.slug) }}</NuxtLink>
      </nav>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 mt-4 border-t border-ink/10">
        <NuxtLink
          to="/wishlist"
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
        >
          <Icon name="mdi:heart-outline" class="text-xl" />
          <span>{{ $t('nav.wishlistCount', { count: wishlist.count }) }}</span>
        </NuxtLink>
        <NuxtLink
          to="/track-order"
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
        >
          <Icon name="mdi:truck-outline" class="text-xl" />
          <span>{{ $t('nav.trackOrder') }}</span>
        </NuxtLink>
        <NuxtLink
          to="/account"
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
        >
          <Icon name="mdi:account-outline" class="text-xl" />
          <span>{{ user ? $t('nav.myAccount') : $t('nav.signIn') }}</span>
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin"
          to="/admin"
          class="flex items-center gap-2 hover:text-gold transition"
          @click="isMenuOpen = false"
        >
          <Icon name="mdi:view-dashboard-outline" class="text-xl" />
          <span>{{ $t('nav.dashboard') }}</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
const isMenuOpen = ref(false);
const cartUI = useCartUIStore();
const cart = useCartStore();
const wishlist = useWishlistStore();
const user = useSupabaseUser();
const { isAdmin, check: checkAdmin } = useAdminAccess();
const { categoryName, subcategoryLabel } = useLang();
onMounted(checkAdmin);
watch(user, checkAdmin);
const avatarFailed = ref(false);
const accountAvatar = computed(() => user.value?.user_metadata?.avatar_url || user.value?.user_metadata?.picture || "");

const searchQuery = ref("");
const searchResults = ref([]);
const searchPending = ref(false);
const failedSearchImages = reactive(new Set());
const searchOpen = ref(false);
const searchInputEl = ref(null);
let debounceTimer = null;

const navCategories = ["skincare", "perfume", "makeup", "haircare", "bags", "kitchen", "hijab", "accessories"].map((slug) => ({
  slug,
  subcategories: categorySubcategories[slug] ?? [],
}));

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
