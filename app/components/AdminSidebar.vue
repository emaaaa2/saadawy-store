<template>
  <div>
    <div class="lg:hidden flex items-center justify-between bg-olive px-4 py-3 sticky top-0 z-40">
      <img src="/logo-trimmed.svg" alt="Saadawy Store" class="h-10" />
      <button aria-label="Menu" @click="isOpen = !isOpen">
        <Icon :name="isOpen ? 'mdi:close' : 'mdi:menu'" class="text-2xl text-beige" />
      </button>
    </div>

    <div
      v-if="isOpen"
      class="lg:hidden fixed inset-0 bg-black/50 z-40"
      @click="isOpen = false"
    ></div>

    <aside
      class="w-64 bg-olive h-screen flex flex-col px-4 py-6 shrink-0 fixed lg:sticky top-0 z-50 transition-transform duration-300"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <img src="/logo-trimmed.svg" alt="Saadawy Store" class="h-12 mx-auto mb-8 hidden lg:block" />

      <nav class="flex-1 space-y-1">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition"
          :class="route.path === '/admin' ? 'bg-gold text-olive' : 'text-beige/80 hover:bg-beige/10'"
          @click="isOpen = false"
        >
          <Icon name="mdi:view-dashboard-outline" class="text-lg" />
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/admin/orders"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition"
          :class="route.path === '/admin/orders' ? 'bg-gold text-olive' : 'text-beige/80 hover:bg-beige/10'"
          @click="isOpen = false"
        >
          <Icon name="mdi:receipt-text-outline" class="text-lg" />
          Orders
          <span
            v-if="pendingCount > 0"
            class="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ pendingCount }}
          </span>
        </NuxtLink>

        <NuxtLink
          to="/admin/products"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition"
          :class="route.path.startsWith('/admin/products') ? 'bg-gold text-olive' : 'text-beige/80 hover:bg-beige/10'"
          @click="isOpen = false"
        >
          <Icon name="mdi:package-variant" class="text-lg" />
          Products
        </NuxtLink>

        <NuxtLink
          to="/admin/reports"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition"
          :class="route.path === '/admin/reports' ? 'bg-gold text-olive' : 'text-beige/80 hover:bg-beige/10'"
          @click="isOpen = false"
        >
          <Icon name="mdi:chart-line" class="text-lg" />
          Reports
        </NuxtLink>
      </nav>

      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-beige/60 hover:bg-beige/10 transition"
      >
        <Icon name="mdi:arrow-left" class="text-lg" />
        Back to Store
      </NuxtLink>
    </aside>
  </div>
</template>

<script setup>
const route = useRoute()
const isOpen = ref(false)
const pendingCount = ref(0)

async function checkPendingOrders() {
  try {
    const { orders } = await $fetch('/api/admin/orders')
    pendingCount.value = orders.filter((o) => o.status === 'pending').length
  } catch (error) {
    console.error('Failed to check pending orders:', error)
  }
}

let intervalId = null

onMounted(() => {
  checkPendingOrders()
  intervalId = setInterval(checkPendingOrders, 30000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>