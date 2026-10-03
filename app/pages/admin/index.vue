<template>
  <div>
    <AdminPageHeader :title="greeting" :description="todayLabel">
      <NuxtLink v-if="can('orders')" to="/admin/orders" class="adm-btn adm-btn-secondary">
        <Icon name="mdi:receipt-text-outline" class="text-base" />
        Orders
      </NuxtLink>
      <NuxtLink v-if="can('products')" to="/admin/products/new" class="adm-btn adm-btn-primary">
        <Icon name="mdi:plus" class="text-base" />
        Add product
      </NuxtLink>
    </AdminPageHeader>

    <div v-if="error" class="adm-card">
      <AdminEmptyState icon="mdi:cloud-alert-outline" title="Couldn't load the dashboard" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">Try again</button>
      </AdminEmptyState>
    </div>

    <template v-else-if="stats">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          label="Today's sales"
          :value="formatMoney(stats.todayRevenue)"
          :hint="`${stats.todayOrders} order${stats.todayOrders === 1 ? '' : 's'} today`"
          icon="mdi:cash-register"
          tone="emerald"
        />
        <AdminStatCard
          label="This month"
          :value="formatMoney(stats.monthRevenue)"
          :hint="`${stats.monthOrders} order${stats.monthOrders === 1 ? '' : 's'}`"
          icon="mdi:calendar-month-outline"
          tone="olive"
          :to="can('reports') ? '/admin/reports' : ''"
        />
        <AdminStatCard
          label="Orders to handle"
          :value="stats.pendingCount"
          hint="Waiting for confirmation"
          icon="mdi:clock-outline"
          tone="amber"
          :to="can('orders') ? '/admin/orders?status=pending' : ''"
        />
        <AdminStatCard
          label="Low stock"
          :value="stats.lowStockCount"
          :hint="`${stats.outOfStockCount} out of stock · ${plural(stats.totalProducts, 'product')}`"
          icon="mdi:package-variant-closed-remove"
          tone="red"
          :to="can('products') ? '/admin/products?stock=low' : ''"
        />
      </div>

      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <section class="adm-card lg:col-span-2">
          <div class="adm-card-header">
            <div>
              <h2 class="adm-card-title">Sales in the last 7 days</h2>
              <p class="text-xs text-stone-500 mt-0.5">{{ formatMoney(weekTotal) }} from {{ plural(weekOrders, 'order') }}</p>
            </div>
            <NuxtLink v-if="can('reports')" to="/admin/reports" class="text-sm font-medium text-olive hover:underline">Reports</NuxtLink>
          </div>
          <div class="px-5 pt-6 pb-4">
            <div class="flex items-end gap-2 sm:gap-4 h-48">
              <div
                v-for="day in stats.last7Days"
                :key="day.date"
                class="flex-1 h-full flex flex-col justify-end items-center gap-2 group"
                :title="`${day.label}: ${formatMoney(day.revenue)} · ${plural(day.orders, 'order')}`"
              >
                <span class="text-[11px] font-medium text-stone-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {{ formatMoney(day.revenue) }}
                </span>
                <div
                  class="w-full max-w-[48px] rounded-md transition-colors"
                  :class="day.revenue ? 'bg-olive/80 group-hover:bg-olive' : 'bg-stone-100'"
                  :style="{ height: `${Math.max((day.revenue / maxDay) * 100, 3)}%` }"
                ></div>
              </div>
            </div>
            <div class="flex gap-2 sm:gap-4 mt-2">
              <span v-for="day in stats.last7Days" :key="day.date" class="flex-1 text-center text-[11px] text-stone-500">
                {{ day.label }}
              </span>
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header">
            <h2 class="adm-card-title">Best sellers</h2>
          </div>
          <AdminEmptyState v-if="!stats.topSelling.length" icon="mdi:trending-up" title="No sales yet" />
          <ol v-else class="divide-y divide-stone-200">
            <li v-for="(product, index) in stats.topSelling" :key="product.id" class="flex items-center gap-3 px-5 py-3">
              <span class="w-6 h-6 rounded-md bg-stone-100 text-xs font-semibold text-stone-500 flex items-center justify-center shrink-0">
                {{ index + 1 }}
              </span>
              <span class="text-sm text-stone-800 truncate flex-1 min-w-0">{{ product.name }}</span>
              <span class="text-sm font-semibold text-stone-800 shrink-0">{{ product.sold }}</span>
            </li>
          </ol>
        </section>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <section class="adm-card lg:col-span-2 overflow-hidden">
          <div class="adm-card-header">
            <h2 class="adm-card-title">Recent orders</h2>
            <NuxtLink v-if="can('orders')" to="/admin/orders" class="text-sm font-medium text-olive hover:underline">View all</NuxtLink>
          </div>
          <AdminEmptyState v-if="!stats.recentOrders.length" icon="mdi:receipt-text-outline" title="No orders yet" />
          <div v-else class="overflow-x-auto">
            <table class="adm-table min-w-[440px]">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in stats.recentOrders"
                  :key="order.id"
                  class="hover:bg-stone-50 transition"
                  :class="{ 'cursor-pointer': can('orders') }"
                  @click="can('orders') && navigateTo(`/admin/orders?open=${order.id}`)"
                >
                  <td>
                    <p class="font-medium">{{ order.order_number }}</p>
                    <p class="text-xs text-stone-500">{{ timeAgo(order.created_at) }}</p>
                  </td>
                  <td>
                    <p class="truncate max-w-[180px]">{{ order.customer_name }}</p>
                    <p class="text-xs text-stone-500">{{ order.itemCount }} item{{ order.itemCount === 1 ? '' : 's' }}</p>
                  </td>
                  <td><AdminStatusBadge :status="order.status" /></td>
                  <td class="text-right font-medium">{{ formatMoney(order.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="adm-card overflow-hidden">
          <div class="adm-card-header">
            <h2 class="adm-card-title">Running low</h2>
            <NuxtLink v-if="can('products') && stats.lowStockCount" to="/admin/products?stock=low" class="text-sm font-medium text-olive hover:underline">
              See all {{ stats.lowStockCount }}
            </NuxtLink>
          </div>
          <AdminEmptyState v-if="!stats.lowStock.length" icon="mdi:check-circle-outline" title="Everything is well stocked" />
          <ul v-else class="divide-y divide-stone-200">
            <li v-for="product in stats.lowStock" :key="product.id">
              <component
                :is="can('products') ? NuxtLink : 'div'"
                :to="can('products') ? `/admin/products/${product.id}` : undefined"
                class="flex items-center gap-3 px-5 py-2.5 hover:bg-stone-50 transition"
              >
                <AdminProductThumb :src="product.image" :alt="product.name" :missing="product.photoMissing" class="w-9 h-9 rounded-md" icon-class="text-base" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm text-stone-800 truncate">{{ product.name }}</p>
                  <p class="text-xs text-stone-500">SKU {{ product.sku || '—' }}</p>
                </div>
                <span class="adm-badge shrink-0" :class="product.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'">
                  {{ product.stock === 0 ? 'Out' : `${product.stock} left` }}
                </span>
              </component>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { NuxtLink } from '#components'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'dashboard'
})
useSeoMeta({ title: 'Dashboard', robots: 'noindex' })

const { can } = useAdminAccess()
const { data: stats, error, refresh } = await useFetch('/api/admin/stats')

const cairoHour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'Africa/Cairo' }).format(new Date())) % 24
const greeting = cairoHour < 12 ? 'Good morning' : cairoHour < 18 ? 'Good afternoon' : 'Good evening'
const todayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Cairo' })

const maxDay = computed(() => Math.max(...(stats.value?.last7Days ?? []).map((d) => d.revenue), 1))
const weekTotal = computed(() => (stats.value?.last7Days ?? []).reduce((sum, d) => sum + d.revenue, 0))
const weekOrders = computed(() => (stats.value?.last7Days ?? []).reduce((sum, d) => sum + d.orders, 0))
</script>
