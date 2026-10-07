<template>
  <div class="px-6 py-phi-3 max-w-6xl mx-auto">
    <div class="mb-phi-3">
      <p class="text-sm text-gold font-semibold uppercase tracking-wide mb-2">
        {{ $t('listing.search.eyebrow') }}
      </p>
      <h1 dir="auto" class="text-phi-h2 font-bold text-ink">
        "{{ route.query.q }}"
      </h1>
      <p class="text-sm text-taupe mt-1">{{ tc('listing.search.count', total) }}</p>
    </div>

    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <div v-for="n in 8" :key="n" class="aspect-square bg-ink/5 rounded-2xl animate-pulse"></div>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-phi-4">
      <Icon name="mdi:magnify-close" class="text-5xl text-ink/20 mb-4" />
      <p class="text-ink font-semibold mb-1">{{ $t('listing.search.empty') }}</p>
      <p class="text-sm text-taupe">{{ $t('listing.search.emptyText') }}</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-phi-2">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>

    <StorePagination v-model="currentPage" :total-pages="totalPages" />
  </div>
</template>

<script setup>
const route = useRoute()
const { t, tc } = useLang()

const currentPage = ref(1)
const searchTerm = computed(() => route.query.q)

useSeoMeta({
  title: () => (searchTerm.value ? t('listing.search.title', { query: searchTerm.value }) : t('listing.search.titleEmpty')),
  robots: 'noindex'
})

watch(searchTerm, () => {
  currentPage.value = 1
})

const { data, pending } = await useFetch('/api/products', {
  query: { search: searchTerm, page: currentPage, limit: 24 },
  watch: [currentPage, searchTerm]
})

const products = computed(() => data.value?.products ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 1)
</script>
