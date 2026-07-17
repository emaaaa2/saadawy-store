<template>
  <div class="min-h-screen bg-beige px-6 py-8">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-olive">Orders</h1>
        <img src="/logo.svg" alt="Saadawy Store" class="h-12" />
      </div>

      <div v-if="pending" class="text-center py-12 text-olive/50">Loading orders...</div>

      <div v-else-if="orders.length === 0" class="text-center py-12 text-olive/50">
        No orders yet.
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-2xl p-5 border border-olive/10"
        >
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="font-bold text-olive">{{ order.order_number }}</p>
              <p class="text-xs text-taupe">{{ new Date(order.created_at).toLocaleString() }}</p>
            </div>

            <select
              :value="order.status"
              class="text-sm border border-olive/20 rounded-full px-3 py-1.5 outline-none"
              @change="updateStatus(order.id, $event.target.value)"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div class="grid sm:grid-cols-2 gap-3 text-sm mb-3">
            <p><span class="text-taupe">Customer:</span> <span class="text-olive font-medium">{{ order.customer_name }}</span></p>
            <p><span class="text-taupe">Phone:</span> <span class="text-olive font-medium">{{ order.phone }}</span></p>
            <p class="sm:col-span-2"><span class="text-taupe">Address:</span> <span class="text-olive font-medium">{{ order.address }}</span></p>
            <p><span class="text-taupe">Payment:</span> <span class="text-olive font-medium">{{ order.payment_method }}</span></p>
            <p><span class="text-taupe">Total:</span> <span class="text-olive font-bold">EGP {{ order.total }}</span></p>
          </div>

          <details class="text-sm">
            <summary class="text-gold cursor-pointer font-medium">View items ({{ order.items.length }})</summary>
            <div class="mt-2 space-y-1">
              <p v-for="item in order.items" :key="item.id" class="text-olive/70">
                {{ item.name }} × {{ item.quantity }} — EGP {{ (item.sale_price ?? item.price) * item.quantity }}
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const { data, pending, refresh } = await useFetch('/api/admin/orders')
const orders = computed(() => data.value?.orders ?? [])

async function updateStatus(orderId, newStatus) {
  await $fetch(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: { status: newStatus }
  })
  refresh()
}
</script>