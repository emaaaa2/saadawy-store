<template>
  <section v-if="products.length" class="px-6 pt-4 md:pt-phi-2 pb-8 md:pb-phi-3 max-w-6xl mx-auto">
    <h2 class="text-xl md:text-phi-h2 font-bold text-ink mb-4 md:mb-phi-2">{{ $t('home.explore') }}</h2>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-phi-1 sm:gap-x-phi-2 gap-y-phi-2">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>

    <div v-if="page < totalPages" class="text-center mt-phi-3">
      <button
        type="button"
        :disabled="isLoading"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-olive text-beige font-semibold hover:bg-gold hover:text-olive transition disabled:opacity-60"
        @click="loadMore"
      >
        <Icon v-if="isLoading" name="mdi:loading" class="animate-spin" />
        {{ $t('home.loadMore') }}
      </button>
    </div>
  </section>
</template>

<script setup>
// "Explore more" at the bottom of the home page: every section mixed together, 20 at a time,
// with a button for more (like the endless product grid on Noon / Amazon).
const PAGE_SIZE = 20
const { t } = useLang()
const toast = useToastStore()

const { data } = await useFetch('/api/products', { key: 'home-explore', query: { sort: 'mix', limit: PAGE_SIZE, page: 1 } })
const more = ref([])
const page = ref(1)
const isLoading = ref(false)

const products = computed(() => [...(data.value?.products ?? []), ...more.value])
const totalPages = computed(() => data.value?.totalPages ?? 1)

async function loadMore() {
  isLoading.value = true
  try {
    const next = await $fetch('/api/products', { query: { sort: 'mix', limit: PAGE_SIZE, page: page.value + 1 } })
    const seen = new Set(products.value.map((p) => p.id))
    more.value.push(...next.products.filter((p) => !seen.has(p.id)))
    page.value++
  } catch (error) {
    toast.error(apiErrorMessage(error, t))
  } finally {
    isLoading.value = false
  }
}
</script>
