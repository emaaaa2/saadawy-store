<template>
  <div class="px-8 py-8 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold text-olive mb-6">Orders</h1>

    <div class="flex items-center gap-2 mb-6 bg-white rounded-full p-1.5 w-fit border border-olive/10">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-2 rounded-full text-sm font-medium transition"
        :class="activeTab === tab.value ? 'bg-olive text-beige' : 'text-olive/60 hover:text-olive'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span
          class="ml-1 text-xs"
          :class="activeTab === tab.value ? 'text-beige/70' : 'text-olive/40'"
        >
          {{ countForTab(tab.value) }}
        </span>
      </button>
    </div>

    <div v-if="pending" class="text-center py-12 text-olive/50">Loading orders...</div>

    <div v-else-if="filteredOrders.length === 0" class="text-center py-12 text-olive/50">
      No orders in this category.
    </div>

    <div v-else class="bg-white rounded-2xl overflow-hidden border border-olive/10">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-olive/10 text-left text-olive/50 text-xs uppercase tracking-wide">
            <th class="px-5 py-3 font-medium">Order</th>
            <th class="px-5 py-3 font-medium">Customer</th>
            <th class="px-5 py-3 font-medium">Total</th>
            <th class="px-5 py-3 font-medium">Payment</th>
            <th class="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
      <tbody>
  <template v-for="order in filteredOrders" :key="order.id">
    <tr
      class="border-b border-olive/5 last:border-0 hover:bg-beige/30 transition cursor-pointer"
      @click="expandedId = expandedId === order.id ? null : order.id"
    >
      <td class="px-5 py-4">
        <div class="flex items-center gap-2">
          <Icon
            name="mdi:chevron-right"
            class="text-olive/40 transition-transform"
            :class="{ 'rotate-90': expandedId === order.id }"
          />
          <div>
            <p class="font-semibold text-olive">{{ order.order_number }}</p>
            <p class="text-xs text-taupe">{{ new Date(order.created_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </td>
      <td class="px-5 py-4">
        <p class="text-olive">{{ order.customer_name }}</p>
        <p class="text-xs text-taupe">{{ order.phone }}</p>
      </td>
      <td class="px-5 py-4 font-semibold text-olive">EGP {{ order.total }}</td>
      <td class="px-5 py-4 text-olive/70 capitalize">{{ order.payment_method.replace('_', ' ') }}</td>
      <td class="px-5 py-4" @click.stop>
        <select
          :value="order.status"
          class="text-xs font-medium border rounded-full px-3 py-1.5 outline-none cursor-pointer"
          :class="statusStyles[order.status]"
          @change="updateStatus(order.id, $event.target.value)"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </td>
    </tr>

    <tr v-if="expandedId === order.id" class="bg-beige/20">
      <td colspan="5" class="px-5 py-4">
        <p class="text-xs font-semibold text-olive/60 uppercase tracking-wide mb-2">
          Items ({{ order.items.length }})
        </p>
        <div class="space-y-1 mb-3">
 <p v-for="item in order.items" :key="item.id" class="flex items-center gap-2 text-sm text-olive/80 py-1">
  <span class="inline-flex items-center bg-gold/10 text-gold text-xs font-mono font-semibold px-2 py-0.5 rounded-md shrink-0">
    {{ item.sku }}
  </span>
  <span class="flex-1">{{ item.name }} × {{ item.quantity }}</span>
  <span class="font-medium text-olive shrink-0">EGP {{ (item.sale_price ?? item.price) * item.quantity }}</span>
</p>
        </div>
        <p class="text-xs font-semibold text-olive/60 uppercase tracking-wide mb-1">Address</p>
        <p class="text-sm text-olive/80">{{ order.address }}</p>
      </td>
    </tr>
  </template>
</tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { data, pending, refresh } = await useFetch('/api/admin/orders')
const orders = computed(() => data.value?.orders ?? [])

const activeTab = ref('all')
const expandedId = ref(null)

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusStyles = {
  pending: 'bg-gold/10 text-gold border-gold/30',
  confirmed: 'bg-sage/10 text-sage border-sage/30',
  delivered: 'bg-green-50 text-green-600 border-green-200',
  cancelled: 'bg-red-50 text-red-500 border-red-200',
}

function countForTab(tabValue) {
  if (tabValue === 'all') return orders.value.length
  return orders.value.filter((o) => o.status === tabValue).length
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter((o) => o.status === activeTab.value)
})

async function updateStatus(orderId, newStatus) {
  await $fetch(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: { status: newStatus }
  })
  refresh()
}
</script>