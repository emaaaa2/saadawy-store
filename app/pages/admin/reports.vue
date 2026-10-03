<template>
  <div>
    <AdminPageHeader title="Reports" description="Sales exclude cancelled orders and card payments that weren't completed. Days follow Cairo time.">
      <button type="button" class="adm-btn adm-btn-secondary" :disabled="pending" @click="refresh()">
        <Icon name="mdi:refresh" class="text-base" :class="{ 'animate-spin': pending }" />
        Refresh
      </button>
    </AdminPageHeader>

    <div v-if="error" class="adm-card">
      <AdminEmptyState icon="mdi:cloud-alert-outline" title="Couldn't load reports" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">Try again</button>
      </AdminEmptyState>
    </div>

    <template v-else-if="r">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Today" :value="formatMoney(r.todayRevenue)" :hint="plural(r.todayOrders, 'order')" icon="mdi:calendar-today-outline" tone="emerald" />
        <AdminStatCard label="This week" :value="formatMoney(r.weekRevenue)" :hint="`${plural(r.weekOrders, 'order')} since Saturday`" icon="mdi:calendar-week-outline" tone="sky" />
        <AdminStatCard label="This month" :value="formatMoney(r.monthRevenue)" :hint="plural(r.monthOrders, 'order')" icon="mdi:calendar-month-outline" tone="olive" />
        <AdminStatCard label="Average order" :value="formatMoney(r.avgOrderValue)" :hint="`${formatMoney(r.totalRevenue)} all time`" icon="mdi:basket-outline" tone="gold" />
      </div>

      <section class="adm-card mb-6">
        <div class="adm-card-header">
          <div>
            <h2 class="adm-card-title">Daily sales · last 30 days</h2>
            <p class="text-xs text-stone-500 mt-0.5">{{ formatMoney(monthTotal) }} from {{ plural(monthOrders, 'order') }}</p>
          </div>
          <p v-if="hovered" class="text-sm text-right">
            <span class="font-semibold text-stone-800">{{ formatMoney(hovered.revenue) }}</span>
            <span class="text-stone-500"> · {{ plural(hovered.orders, 'order') }} · {{ hovered.label }}</span>
          </p>
        </div>
        <div class="px-5 pt-6 pb-4">
          <div class="flex items-end gap-[3px] sm:gap-1.5 h-52" @mouseleave="hovered = null">
            <div
              v-for="day in r.last30Days"
              :key="day.date"
              class="flex-1 h-full flex items-end cursor-default"
              @mouseenter="hovered = day"
            >
              <div
                class="w-full rounded-t transition-colors"
                :class="hovered?.date === day.date ? 'bg-gold' : day.revenue ? 'bg-olive/75' : 'bg-stone-100'"
                :style="{ height: `${Math.max((day.revenue / maxDay) * 100, 2)}%` }"
              ></div>
            </div>
          </div>
          <div class="flex justify-between mt-2 text-[11px] text-stone-500">
            <span>{{ r.last30Days[0]?.label }}</span>
            <span>{{ r.last30Days[14]?.label }}</span>
            <span>Today</span>
          </div>
        </div>
      </section>

      <div class="grid lg:grid-cols-2 gap-6 mb-6">
        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">Sales by category</h2></div>
          <AdminEmptyState v-if="!r.topCategories.length" icon="mdi:shape-outline" title="No sales yet" />
          <div v-else class="p-5 space-y-4">
            <div v-for="cat in r.topCategories" :key="cat.category">
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="text-stone-700">{{ categoryLabel(cat.category) }}</span>
                <span class="font-medium text-stone-800">{{ formatMoney(cat.revenue) }}</span>
              </div>
              <div class="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div class="h-full bg-olive rounded-full" :style="{ width: `${(cat.revenue / r.topCategories[0].revenue) * 100}%` }"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">Payment methods</h2></div>
          <AdminEmptyState v-if="!r.paymentBreakdown.length" icon="mdi:credit-card-outline" title="No sales yet" />
          <div v-else class="p-5 space-y-4">
            <div v-for="row in r.paymentBreakdown" :key="row.method">
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="text-stone-700">{{ paymentLabel(row.method) }} <span class="text-stone-400">· {{ plural(row.orders, 'order') }}</span></span>
                <span class="font-medium text-stone-800">{{ formatMoney(row.revenue) }}</span>
              </div>
              <div class="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div class="h-full bg-gold rounded-full" :style="{ width: `${(row.revenue / r.paymentBreakdown[0].revenue) * 100}%` }"></div>
              </div>
            </div>
          </div>

          <div class="border-t border-stone-200 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">All orders by status</p>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="option in ORDER_STATUS_OPTIONS"
                :key="option.value"
                :to="`/admin/orders?status=${option.value}`"
                class="adm-badge hover:opacity-80"
                :class="ORDER_STATUS_META[option.value].badge"
              >
                {{ option.label }} · {{ r.statusCounts[option.value] || 0 }}
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>

      <section class="adm-card overflow-hidden">
        <div class="adm-card-header"><h2 class="adm-card-title">Top products by sales</h2></div>
        <AdminEmptyState v-if="!r.topProducts.length" icon="mdi:trending-up" title="No sales yet" />
        <div v-else class="overflow-x-auto">
          <table class="adm-table min-w-[480px]">
            <thead>
              <tr>
                <th class="w-12">#</th>
                <th>Product</th>
                <th class="text-right">Units sold</th>
                <th class="text-right">Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in r.topProducts" :key="product.id" class="hover:bg-stone-50">
                <td class="text-stone-400">{{ index + 1 }}</td>
                <td>
                  <NuxtLink v-if="can('products')" :to="`/admin/products/${product.id}`" class="hover:text-olive hover:underline">{{ product.name }}</NuxtLink>
                  <span v-else>{{ product.name }}</span>
                </td>
                <td class="text-right">{{ product.sold }}</td>
                <td class="text-right font-medium">{{ formatMoney(product.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'reports'
})
useSeoMeta({ title: 'Reports', robots: 'noindex' })

const { can } = useAdminAccess()
const { data: r, error, pending, refresh } = await useFetch('/api/admin/reports')
const hovered = ref(null)

const maxDay = computed(() => Math.max(...(r.value?.last30Days ?? []).map((d) => d.revenue), 1))
const monthTotal = computed(() => (r.value?.last30Days ?? []).reduce((sum, d) => sum + d.revenue, 0))
const monthOrders = computed(() => (r.value?.last30Days ?? []).reduce((sum, d) => sum + d.orders, 0))
</script>
