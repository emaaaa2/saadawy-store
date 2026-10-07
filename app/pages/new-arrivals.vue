<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div class="mb-phi-3">
      <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2">
        {{ $t('listing.newArrivals.eyebrow') }}
      </p>
      <h1 class="text-phi-h2 font-bold text-ink mb-4">{{ $t('listing.newArrivals.title') }}</h1>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex items-center bg-surface border border-ink/15 rounded-full px-4 py-2.5 gap-2 max-w-sm w-full">
          <Icon name="mdi:magnify" class="text-ink/40 text-lg shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            dir="auto"
            :placeholder="$t('listing.newArrivals.search')"
            class="bg-transparent text-ink placeholder-ink/40 outline-none text-sm w-full"
          />
          <button
            v-if="searchQuery"
            class="text-ink/40 hover:text-ink transition shrink-0"
            :aria-label="$t('nav.clearSearch')"
            @click="searchQuery = ''"
          >
            <Icon name="mdi:close-circle" class="text-lg" />
          </button>
        </div>

        <div class="flex items-center bg-surface border border-ink/15 rounded-full px-4 py-2.5 gap-2 shrink-0">
          <Icon name="mdi:shape-outline" class="text-ink/40 text-lg shrink-0" />
          <select
            v-model="categoryFilter"
            class="bg-transparent text-ink outline-none text-sm cursor-pointer"
          >
            <option value="">{{ $t('listing.allCategories') }}</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ categoryName(cat) }}</option>
          </select>
        </div>

        <div class="flex items-center bg-surface border border-ink/15 rounded-full px-4 py-2.5 gap-2 shrink-0">
          <Icon name="mdi:sort" class="text-ink/40 text-lg shrink-0" />
          <select
            v-model="sortBy"
            class="bg-transparent text-ink outline-none text-sm cursor-pointer"
          >
            <option value="newest">{{ $t('listing.sort.newest') }}</option>
            <option value="price_asc">{{ $t('listing.sort.priceAsc') }}</option>
            <option value="price_desc">{{ $t('listing.sort.priceDesc') }}</option>
            <option value="name_asc">{{ $t('listing.sort.nameAsc') }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <div v-for="n in 8" :key="n" class="aspect-square bg-ink/5 rounded-2xl animate-pulse"></div>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:magnify-close" class="text-5xl text-ink/20 mb-4" />
      <p class="text-ink font-semibold mb-1">{{ $t('listing.newArrivals.empty') }}</p>
      <p class="text-sm text-taupe">{{ $t('listing.newArrivals.emptyText') }}</p>
    </div>

    <div v-else v-fade-in class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <ProductCard v-for="product in products" :key="product.id" :product="product" badge="New" />
    </div>

    <StorePagination v-model="currentPage" :total-pages="totalPages" />
  </div>
</template>

<script setup>
const { t, categoryName } = useLang()
const categories = ['skincare', 'perfume', 'makeup', 'haircare', 'bags', 'kitchen', 'hijab']

useSeoMeta({
  title: () => t('listing.newArrivals.title'),
  description: () => t('listing.newArrivals.metaDescription'),
  ogTitle: () => `${t('listing.newArrivals.title')} | ${t('common.storeName')}`,
  ogDescription: () => t('listing.newArrivals.metaDescription')
})

const currentPage = ref(1)
const searchQuery = ref('')
const categoryFilter = ref('')
const sortBy = ref('newest')

watch([searchQuery, categoryFilter, sortBy], () => {
  currentPage.value = 1
})

const { data, pending } = await useFetch('/api/products', {
  query: {
    search: searchQuery,
    category: categoryFilter,
    sort: sortBy,
    page: currentPage,
    limit: 24
  },
  watch: [currentPage, searchQuery, categoryFilter, sortBy]
})

const products = computed(() => data.value?.products ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 1)
</script>
