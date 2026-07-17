<template>
  <div class="min-h-screen bg-beige px-6 py-8">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-10">
        <img src="/logo.svg" alt="Saadawy Store" class="h-14" />
        <h1 class="text-xl font-bold text-olive">Admin Dashboard</h1>
      </div>

      <div class="grid sm:grid-cols-2 gap-5">
        <NuxtLink
          to="/admin/orders"
          class="bg-white border border-olive/10 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition flex items-center gap-4"
        >
          <div class="w-14 h-14 rounded-full bg-olive/10 flex items-center justify-center shrink-0">
            <Icon name="mdi:receipt-text-outline" class="text-2xl text-olive" />
          </div>
          <div>
            <p class="font-bold text-olive text-lg">Orders</p>
            <p class="text-sm text-taupe">View and manage customer orders</p>
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
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: 'admin-auth'
})
</script>