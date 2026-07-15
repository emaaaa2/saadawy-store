<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">{{ route.params.slug }}</h1>

    <div v-if="pending" class="text-center py-12 text-olive/50">
      Loading products...
    </div>

    <div v-else-if="products.length === 0" class="text-center py-12 text-olive/50">
      No products found in this category yet.
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="border rounded-lg p-4"
      >
        <p class="font-bold">{{ product.name }}</p>
        <p class="text-gray-600">{{ product.price }} EGP</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

const { data, pending } = await useFetch('/api/products', {
  query: { category: route.params.slug }
})

const products = computed(() => data.value?.products ?? [])
</script>