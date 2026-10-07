<template>
  <div>
    <AdminPageHeader :title="greeting" :description="todayLabel">
      <NuxtLink v-if="can('orders')" to="/admin/orders" class="adm-btn adm-btn-secondary">
        <Icon name="mdi:receipt-text-outline" class="text-base" />
        {{ $t('admin.sections.orders') }}
      </NuxtLink>
      <NuxtLink v-if="can('products')" to="/admin/products/new" class="adm-btn adm-btn-primary">
        <Icon name="mdi:plus" class="text-base" />
        {{ $t('admin.dashboard.addProduct') }}
      </NuxtLink>
    </AdminPageHeader>

    <div v-if="error" class="adm-card">
      <AdminEmptyState icon="mdi:cloud-alert-outline" :title="$t('admin.dashboard.loadFailed')" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">{{ $t('admin.common.tryAgain') }}</button>
      </AdminEmptyState>
    </div>

    <template v-else-if="stats">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          :label="$t('admin.dashboard.todaySales')"
          :value="formatMoney(stats.todayRevenue)"
          :hint="tc('admin.dashboard.ordersToday', stats.todayOrders)"
          icon="mdi:cash-register"
          tone="emerald"
        />
        <AdminStatCard
          :label="$t('admin.dashboard.thisMonth')"
          :value="formatMoney(stats.monthRevenue)"
          :hint="plural(stats.monthOrders, 'order')"
          icon="mdi:calendar-month-outline"
          tone="olive"
          :to="can('reports') ? '/admin/reports' : ''"
        />
        <AdminStatCard
          :label="$t('admin.dashboard.toHandle')"
          :value="stats.pendingCount"
          :hint="$t('admin.dashboard.waiting')"
          icon="mdi:clock-outline"
          tone="amber"
          :to="can('orders') ? '/admin/orders?status=pending' : ''"
        />
        <AdminStatCard
          :label="$t('admin.dashboard.lowStock')"
          :value="stats.lowStockCount"
          :hint="$t('admin.dashboard.lowStockHint', { out: stats.outOfStockCount, products: plural(stats.totalProducts, 'product') })"
          icon="mdi:package-variant-closed-remove"
          tone="red"
          :to="can('products') ? '/admin/products?stock=low' : ''"
        />
      </div>

      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <section class="adm-card lg:col-span-2">
          <div class="adm-card-header">
            <div>
              <h2 class="adm-card-title">{{ $t('admin.dashboard.last7') }}</h2>
              <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.dashboard.fromOrders', { amount: formatMoney(weekTotal), orders: plural(weekOrders, 'order') }) }}</p>
            </div>
            <NuxtLink v-if="can('reports')" to="/admin/reports" class="text-sm font-medium text-ink hover:underline">{{ $t('admin.sections.reports') }}</NuxtLink>
          </div>
          <div class="px-5 pt-6 pb-4">
            <div class="flex items-end gap-2 sm:gap-4 h-48">
              <div
                v-for="day in stats.last7Days"
                :key="day.date"
                class="flex-1 h-full flex flex-col justify-end items-center gap-2 group"
                :title="`${dayLabel(day.date)}: ${formatMoney(day.revenue)} · ${plural(day.orders, 'order')}`"
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
                {{ dayLabel(day.date) }}
              </span>
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header">
            <h2 class="adm-card-title">{{ $t('admin.dashboard.bestSellers') }}</h2>
          </div>
          <AdminEmptyState v-if="!stats.topSelling.length" icon="mdi:trending-up" :title="$t('admin.dashboard.noSales')" />
          <ol v-else class="divide-y divide-stone-200">
            <li v-for="(product, index) in stats.topSelling" :key="product.id" class="flex items-center gap-3 px-5 py-3">
              <span class="w-6 h-6 rounded-md bg-stone-100 text-xs font-semibold text-stone-500 flex items-center justify-center shrink-0">
                {{ index + 1 }}
              </span>
              <span dir="auto" class="text-sm text-stone-800 truncate flex-1 min-w-0 text-start">{{ product.name }}</span>
              <span class="text-sm font-semibold text-stone-800 shrink-0">{{ product.sold }}</span>
            </li>
          </ol>
        </section>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <section class="adm-card lg:col-span-2 overflow-hidden">
          <div class="adm-card-header">
            <h2 class="adm-card-title">{{ $t('admin.dashboard.recentOrders') }}</h2>
            <NuxtLink v-if="can('orders')" to="/admin/orders" class="text-sm font-medium text-ink hover:underline">{{ $t('admin.common.viewAll') }}</NuxtLink>
          </div>
          <AdminEmptyState v-if="!stats.recentOrders.length" icon="mdi:receipt-text-outline" :title="$t('admin.dashboard.noOrders')" />
          <div v-else class="overflow-x-auto">
            <table class="adm-table min-w-[440px]">
              <thead>
                <tr>
                  <th>{{ $t('admin.dashboard.table.order') }}</th>
                  <th>{{ $t('admin.dashboard.table.customer') }}</th>
                  <th>{{ $t('admin.dashboard.table.status') }}</th>
                  <th class="text-end">{{ $t('admin.dashboard.table.total') }}</th>
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
                    <p dir="auto" class="truncate max-w-[180px] text-start">{{ order.customer_name }}</p>
                    <p class="text-xs text-stone-500">{{ plural(order.itemCount, 'item') }}</p>
                  </td>
                  <td><AdminStatusBadge :status="order.status" /></td>
                  <td class="text-end font-medium">{{ formatMoney(order.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="adm-card overflow-hidden">
          <div class="adm-card-header">
            <h2 class="adm-card-title">{{ $t('admin.dashboard.runningLow') }}</h2>
            <NuxtLink v-if="can('products') && stats.lowStockCount" to="/admin/products?stock=low" class="text-sm font-medium text-ink hover:underline">
              {{ $t('admin.dashboard.seeAll', { count: stats.lowStockCount }) }}
            </NuxtLink>
          </div>
          <AdminEmptyState v-if="!stats.lowStock.length" icon="mdi:check-circle-outline" :title="$t('admin.dashboard.allStocked')" />
          <ul v-else class="divide-y divide-stone-200">
            <li v-for="product in stats.lowStock" :key="product.id">
              <component
                :is="can('products') ? NuxtLink : 'div'"
                :to="can('products') ? `/admin/products/${product.id}` : undefined"
                class="flex items-center gap-3 px-5 py-2.5 hover:bg-stone-50 transition"
              >
                <AdminProductThumb :src="product.image" :alt="product.name" :missing="product.photoMissing" class="w-9 h-9 rounded-md" icon-class="text-base" />
                <div class="min-w-0 flex-1">
                  <p dir="auto" class="text-sm text-stone-800 truncate text-start">{{ product.name }}</p>
                  <p class="text-xs text-stone-500">SKU {{ product.sku || '—' }}</p>
                </div>
                <span class="adm-badge shrink-0" :class="product.stock === 0 ? 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'">
                  {{ product.stock === 0 ? $t('admin.dashboard.out') : $t('admin.dashboard.left', { count: product.stock }) }}
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
const { t, tc, isAr } = useLang()
useSeoMeta({ title: () => t('admin.dashboard.metaTitle'), robots: 'noindex' })

const { can } = useAdminAccess()
const { data: stats, error, refresh } = await useFetch('/api/admin/stats')

const cairoHour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'Africa/Cairo' }).format(new Date())) % 24
const greeting = computed(() => t(cairoHour < 12 ? 'admin.dashboard.morning' : cairoHour < 18 ? 'admin.dashboard.afternoon' : 'admin.dashboard.evening'))
const todayLabel = computed(() => new Date().toLocaleDateString(isAr.value ? 'ar-EG-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Cairo' }))

const maxDay = computed(() => Math.max(...(stats.value?.last7Days ?? []).map((d) => d.revenue), 1))
const weekTotal = computed(() => (stats.value?.last7Days ?? []).reduce((sum, d) => sum + d.revenue, 0))
const weekOrders = computed(() => (stats.value?.last7Days ?? []).reduce((sum, d) => sum + d.orders, 0))
</script>
