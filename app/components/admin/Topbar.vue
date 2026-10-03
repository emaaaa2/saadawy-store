<template>
  <header class="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-stone-200">
    <div class="h-full flex items-center gap-3 px-4 sm:px-6 lg:px-8">
      <button type="button" class="adm-icon-btn lg:hidden -ml-1" aria-label="Open menu" @click="isNavOpen = true">
        <Icon name="mdi:menu" class="text-xl" />
      </button>

      <form v-if="searchTargets.length" class="relative flex-1 max-w-md" role="search" @submit.prevent="go(searchTargets[0])">
        <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-stone-400 pointer-events-none" />
        <input
          id="admin-search"
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="searchPlaceholder"
          class="adm-input pl-9 bg-stone-50 focus:bg-white"
          @focus="isSearchOpen = true"
          @blur="closeSearchSoon"
        />
        <div
          v-if="isSearchOpen && query.trim()"
          class="absolute left-0 right-0 top-full mt-1.5 adm-card shadow-lg py-1.5 overflow-hidden"
        >
          <button
            v-for="target in searchTargets"
            :key="target.path"
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-stone-800 hover:bg-stone-50"
            @mousedown.prevent="go(target)"
          >
            <Icon :name="target.icon" class="text-lg text-stone-400" />
            <span class="truncate">Search {{ target.label }} for “<span class="font-medium">{{ query.trim() }}</span>”</span>
          </button>
        </div>
      </form>

      <div class="ml-auto flex items-center gap-2">
        <NuxtLink
          v-if="can('orders')"
          to="/admin/orders?status=pending"
          class="adm-icon-btn relative"
          :title="badges.orders ? `${badges.orders} pending orders` : 'No pending orders'"
          aria-label="Pending orders"
        >
          <Icon name="mdi:bell-outline" class="text-xl" />
          <span v-if="badges.orders" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </NuxtLink>
        <a href="/" target="_blank" rel="noopener" class="adm-btn adm-btn-secondary adm-btn-sm">
          <Icon name="mdi:open-in-new" class="text-base" />
          <span class="hidden sm:inline">View store</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
const { can } = useAdminAccess()
const { badges } = useAdminBadges()
const isNavOpen = useState('admin-nav-open', () => false)
const query = ref('')
const isSearchOpen = ref(false)

const searchTargets = computed(() => [
  can('orders') && { label: 'orders', path: '/admin/orders', icon: 'mdi:receipt-text-outline' },
  can('products') && { label: 'products', path: '/admin/products', icon: 'mdi:package-variant-closed' },
].filter(Boolean))

const searchPlaceholder = computed(() =>
  searchTargets.value.length > 1 ? 'Search orders or products…' : `Search ${searchTargets.value[0]?.label}…`
)

function go(target) {
  const q = query.value.trim()
  if (!q || !target) return
  isSearchOpen.value = false
  query.value = ''
  navigateTo({ path: target.path, query: { q } })
}

function closeSearchSoon() {
  setTimeout(() => { isSearchOpen.value = false }, 100)
}
</script>
