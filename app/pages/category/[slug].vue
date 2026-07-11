<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">قسم: {{ route.params.slug }}</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="border rounded-lg p-4"
      >
        <p class="font-bold">{{ product.name }}</p>
        <p class="text-gray-600">{{ product.price }} جنيه</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { products } from '~/data/products'

const route = useRoute()

const filteredProducts = computed(() => {
  return products.filter(p => p.category === route.params.slug)
})
</script>