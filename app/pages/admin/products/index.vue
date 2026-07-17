<template>
  <div class="min-h-screen bg-beige px-6 py-8">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-olive">Products</h1>
        <div class="flex items-center gap-3">
          <NuxtLink to="/admin/orders" class="text-sm text-olive/70 hover:text-gold transition">
            View Orders
          </NuxtLink>
          <NuxtLink
            to="/admin/products/new"
            class="bg-olive text-beige px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition"
          >
            + Add Product
          </NuxtLink>
        </div>
      </div>

      <div v-if="pending" class="text-center py-12 text-olive/50">Loading products...</div>

      <div v-else-if="products.length === 0" class="text-center py-12 text-olive/50">
        No products yet.
      </div>

      <div v-else class="bg-white rounded-2xl overflow-hidden border border-olive/10">
        <div
          v-for="product in products"
          :key="product.id"
          class="flex items-center gap-4 p-4 border-b border-olive/10 last:border-0"
        >
          <div class="w-14 h-14 rounded-lg bg-champagne shrink-0 flex items-center justify-center overflow-hidden">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <Icon v-else name="mdi:image-outline" class="text-xl text-olive/30" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium text-olive truncate">{{ product.name }}</p>
            <p class="text-sm text-taupe capitalize">{{ product.category }} · Stock: {{ product.stock }}</p>
          </div>

          <p class="font-bold text-olive text-sm shrink-0">EGP {{ product.sale_price ?? product.price }}</p>

          <div class="flex items-center gap-2 shrink-0">
            <NuxtLink
              :to="`/admin/products/${product.id}`"
              class="w-9 h-9 rounded-full bg-olive/5 flex items-center justify-center hover:bg-gold/20 transition"
              aria-label="Edit"
            >
              <Icon name="mdi:pencil-outline" class="text-olive text-lg" />
            </NuxtLink>
            <button
              class="w-9 h-9 rounded-full bg-olive/5 flex items-center justify-center hover:bg-red-100 transition"
              aria-label="Delete"
              @click="handleDelete(product)"
            >
              <Icon name="mdi:trash-can-outline" class="text-red-500 text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: 'admin-auth'
})
const { data, pending, refresh } = await useFetch('/api/admin/products')
const products = computed(() => data.value?.products ?? [])

async function handleDelete(product) {
  const confirmed = confirm(`Delete "${product.name}"? This cannot be undone.`)
  if (!confirmed) return

  await $fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
  refresh()
}

</script>