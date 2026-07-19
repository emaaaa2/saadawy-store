<template>
  <div class="min-h-screen bg-beige px-6 py-8">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <img src="/logo.svg" alt="Saadawy Store" class="h-14" />
        <h1 class="text-xl font-bold text-olive">Admin Dashboard</h1>
      </div>

      <div class="grid sm:grid-cols-2 gap-5 mb-8">
        <NuxtLink
          to="/admin/orders"
          class="bg-white border border-olive/10 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition flex items-center gap-4"
        >
          <div class="w-14 h-14 rounded-full bg-olive/10 flex items-center justify-center shrink-0">
            <Icon name="mdi:receipt-text-outline" class="text-2xl text-olive" />
          </div>
          <div>
            <p class="font-bold text-olive text-lg">Orders</p>
            <p class="text-sm text-taupe">{{ stats?.totalOrders ?? 0 }} total orders</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/admin/products"
          class="bg-white border border-olive/10 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition flex items-center gap-4"
        >
          <div class="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <Icon name="mdi:package-variant" class="text-2xl text-gold" />
          </div>
          <div>
            <p class="font-bold text-olive text-lg">Products</p>
            <p class="text-sm text-taupe">Add, edit, or remove products</p>
          </div>
        </NuxtLink>
      </div>

      <div class="grid sm:grid-cols-2 gap-5">
        <div class="bg-white border border-olive/10 rounded-2xl p-5">
          <h3 class="font-semibold text-olive mb-4 flex items-center gap-2">
            <Icon name="mdi:trending-up" class="text-gold" />
            Top Selling Products
          </h3>

          <div v-if="!stats?.topSelling?.length" class="text-sm text-taupe py-4 text-center">
            No sales data yet
          </div>

          <div v-else class="space-y-3">
            <div v-for="(product, index) in stats.topSelling" :key="product.id" class="flex items-center justify-between text-sm">
              <span class="text-olive/80">{{ index + 1 }}. {{ product.name }}</span>
              <span class="font-bold text-olive">{{ product.sold }} sold</span>
            </div>
          </div>
        </div>

        <div class="bg-white border border-olive/10 rounded-2xl p-5">
          <h3 class="font-semibold text-olive mb-4 flex items-center gap-2">
            <Icon name="mdi:alert-outline" class="text-red-400" />
            Low Stock Alert
          </h3>

          <div v-if="!stats?.lowStock?.length" class="text-sm text-taupe py-4 text-center">
            All products well stocked
          </div>

          <div v-else class="space-y-3">
            <div v-for="product in stats.lowStock" :key="product.id" class="flex items-center justify-between text-sm">
              <span class="text-olive/80">{{ product.name }}</span>
              <span class="font-bold" :class="product.stock === 0 ? 'text-red-500' : 'text-gold'">
                {{ product.stock === 0 ? 'Out of stock' : `${product.stock} left` }}
              </span>
            </div>
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

const { data: stats } = await useFetch('/api/admin/stats')
</script>