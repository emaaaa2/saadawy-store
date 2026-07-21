<template>
  <div class="px-8 py-8 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold text-olive mb-6">Reports</h1>

    <div v-if="pending" class="text-center py-12 text-olive/50">Loading reports...</div>

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white border border-olive/10 rounded-2xl p-5">
          <p class="text-xs text-taupe uppercase tracking-wide mb-2">Today</p>
          <p class="text-xl font-bold text-olive">EGP {{ reports.todayRevenue }}</p>
          <p class="text-xs text-taupe mt-1">{{ reports.todayOrders }} orders</p>
        </div>

        <div class="bg-white border border-olive/10 rounded-2xl p-5">
          <p class="text-xs text-taupe uppercase tracking-wide mb-2">This Week</p>
          <p class="text-xl font-bold text-olive">EGP {{ reports.weekRevenue }}</p>
          <p class="text-xs text-taupe mt-1">{{ reports.weekOrders }} orders</p>
        </div>

        <div class="bg-white border border-olive/10 rounded-2xl p-5">
          <p class="text-xs text-taupe uppercase tracking-wide mb-2">This Month</p>
          <p class="text-xl font-bold text-olive">EGP {{ reports.monthRevenue }}</p>
          <p class="text-xs text-taupe mt-1">{{ reports.monthOrders }} orders</p>
        </div>

        <div class="bg-white border border-olive/10 rounded-2xl p-5">
          <p class="text-xs text-taupe uppercase tracking-wide mb-2">Avg. Order Value</p>
          <p class="text-xl font-bold text-gold">EGP {{ reports.avgOrderValue }}</p>
          <p class="text-xs text-taupe mt-1">All time</p>
        </div>
      </div>

      <div class="bg-white border border-olive/10 rounded-2xl p-6 mb-6">
        <h3 class="font-semibold text-olive mb-6">Last 14 Days</h3>

        <div class="flex items-end gap-2 h-40">
          <div
            v-for="day in reports.last14Days"
            :key="day.date"
            class="flex-1 flex flex-col items-center justify-end gap-2 group relative"
          >
            <div
              class="w-full bg-olive/20 hover:bg-gold rounded-t transition-colors relative"
              :style="{ height: `${barHeight(day.revenue)}%` }"
            >
              <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-olive opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                EGP {{ day.revenue }}
              </span>
            </div>
            <span class="text-[10px] text-taupe rotate-0">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white border border-olive/10 rounded-2xl p-6">
        <h3 class="font-semibold text-olive mb-4">Revenue by Category</h3>

        <div v-if="reports.topCategories.length === 0" class="text-sm text-taupe text-center py-6">
          No sales data yet
        </div>

        <div v-else class="space-y-3">
          <div v-for="cat in reports.topCategories" :key="cat.category">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-olive capitalize">{{ cat.category }}</span>
              <span class="font-semibold text-olive">EGP {{ cat.revenue }}</span>
            </div>
            <div class="w-full h-2 bg-olive/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-gold rounded-full"
                :style="{ width: `${(cat.revenue / reports.topCategories[0].revenue) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { data, pending } = await useFetch('/api/admin/reports')
const reports = computed(() => data.value ?? {})

const maxDailyRevenue = computed(() => {
  if (!reports.value.last14Days) return 1
  return Math.max(...reports.value.last14Days.map((d) => d.revenue), 1)
})

function barHeight(revenue) {
  return Math.max((revenue / maxDailyRevenue.value) * 100, 2)
}
</script>