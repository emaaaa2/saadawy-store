<template>
  <div>
    <AdminPageHeader :title="$t('admin.orders.metaTitle')" :description="$t('admin.orders.inTotal', { orders: plural(orders.length, 'order') })">
      <button type="button" class="adm-btn adm-btn-secondary" :disabled="pending" @click="refreshAll">
        <Icon name="mdi:refresh" class="text-base" :class="{ 'animate-spin': pending }" />
        {{ $t('admin.common.refresh') }}
      </button>
    </AdminPageHeader>

    <section class="adm-card overflow-hidden">
      <div class="px-4 pt-2">
        <AdminTabs v-model="activeTab" :tabs="tabs" />
      </div>

      <div class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-stone-200">
        <div class="relative flex-1 min-w-[220px] max-w-md">
          <Icon name="mdi:magnify" class="absolute start-3 top-1/2 -translate-y-1/2 text-lg text-stone-400 pointer-events-none" />
          <input
            id="orders-search"
            v-model="search"
            type="search"
            :placeholder="$t('admin.orders.searchPlaceholder')"
            class="adm-input ps-9"
          />
        </div>
        <select id="orders-payment" v-model="paymentFilter" class="adm-input w-auto">
          <option value="">{{ $t('admin.orders.allPayments') }}</option>
          <option v-for="(label, value) in PAYMENT_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
        <p class="text-sm text-stone-500 ms-auto">{{ $t('admin.orders.shown', { count: filteredOrders.length }) }}</p>
      </div>

      <div
        v-if="selected.size"
        class="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-ink/5 border-b border-stone-200"
      >
        <span class="text-sm font-medium text-stone-800 me-1">{{ $t('admin.common.selected', { count: selected.size }) }}</span>
        <select id="bulk-status" v-model="bulkStatus" class="adm-input adm-btn-sm h-8 w-auto">
          <option value="" disabled>{{ $t('admin.orders.changeStatusTo') }}</option>
          <option v-for="option in ORDER_STATUS_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <button
          type="button"
          class="adm-btn adm-btn-primary adm-btn-sm"
          :disabled="!bulkStatus || isBulkBusy"
          @click="runBulk('status')"
        >
          {{ $t('admin.common.apply') }}
        </button>
        <button type="button" class="adm-btn adm-btn-danger-soft adm-btn-sm" :disabled="isBulkBusy" @click="runBulk('delete')">
          <Icon name="mdi:trash-can-outline" class="text-sm" />
          {{ $t('admin.common.delete') }}
        </button>
        <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm ms-auto" @click="selected.clear()">{{ $t('admin.common.clearSelection') }}</button>
      </div>

      <div v-if="pending && !orders.length" class="divide-y divide-stone-200">
        <div v-for="n in 6" :key="n" class="h-14 px-4 flex items-center gap-4">
          <div class="h-3 w-24 bg-stone-100 rounded animate-pulse"></div>
          <div class="h-3 w-40 bg-stone-100 rounded animate-pulse"></div>
          <div class="h-3 w-16 bg-stone-100 rounded animate-pulse ms-auto"></div>
        </div>
      </div>

      <AdminEmptyState
        v-else-if="error"
        icon="mdi:cloud-alert-outline"
        :title="$t('admin.orders.loadFailed')"
        :description="adminErrorMessage(error)"
      >
        <button type="button" class="adm-btn adm-btn-secondary" @click="refreshAll">{{ $t('admin.common.tryAgain') }}</button>
      </AdminEmptyState>

      <AdminEmptyState
        v-else-if="filteredOrders.length === 0"
        icon="mdi:receipt-text-outline"
        :title="search ? $t('admin.orders.noMatch', { query: search }) : $t('admin.orders.noneYet')"
        :description="search || paymentFilter ? $t('admin.orders.tryFilter') : $t('admin.orders.newShowHere')"
      />

      <div v-else class="overflow-x-auto">
        <table class="adm-table min-w-[760px]">
          <thead>
            <tr>
              <th class="w-10">
                <input
                  type="checkbox"
                  class="adm-checkbox"
                  :checked="allVisibleSelected"
                  :indeterminate.prop="selected.size > 0 && !allVisibleSelected"
                  :aria-label="$t('admin.orders.selectAll')"
                  @change="toggleAllVisible"
                />
              </th>
              <th>{{ $t('admin.orders.table.order') }}</th>
              <th>{{ $t('admin.orders.table.date') }}</th>
              <th>{{ $t('admin.orders.table.customer') }}</th>
              <th>{{ $t('admin.orders.table.payment') }}</th>
              <th>{{ $t('admin.orders.table.status') }}</th>
              <th class="text-end">{{ $t('admin.orders.table.total') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="cursor-pointer transition"
              :class="selected.has(order.id) ? 'bg-ink/5' : 'hover:bg-stone-50'"
              @click="openOrder(order)"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  class="adm-checkbox"
                  :checked="selected.has(order.id)"
                  :aria-label="$t('admin.orders.selectOne', { number: order.order_number })"
                  @change="toggleSelected(order.id)"
                />
              </td>
              <td>
                <p class="font-medium">{{ order.order_number }}</p>
                <p class="text-xs text-stone-500">{{ plural(order.items.length, 'item') }}</p>
              </td>
              <td class="text-stone-500 whitespace-nowrap">
                <p>{{ formatDate(order.created_at) }}</p>
                <p class="text-xs">{{ timeAgo(order.created_at) }}</p>
              </td>
              <td>
                <p dir="auto" class="truncate max-w-[200px] text-start">{{ order.customer_name }}</p>
                <p dir="ltr" class="text-xs text-stone-500 text-start">{{ order.phone }}</p>
              </td>
              <td class="text-stone-600 whitespace-nowrap">{{ paymentLabel(order.payment_method) }}</td>
              <td @click.stop>
                <div class="relative inline-flex">
                  <select
                    :value="order.status"
                    :disabled="busyIds.has(order.id)"
                    :aria-label="$t('admin.orders.statusOf', { number: order.order_number })"
                    class="appearance-none rounded-md text-xs font-medium ps-2 pe-6 py-1 cursor-pointer outline-none border-0 focus:ring-2 focus:ring-ink/20 disabled:opacity-50"
                    :class="ORDER_STATUS_META[order.status]?.badge"
                    @change="updateStatus(order, $event)"
                  >
                    <option v-for="option in ORDER_STATUS_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                  <Icon name="mdi:chevron-down" class="absolute end-1.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none opacity-60" />
                </div>
              </td>
              <td class="text-end font-medium whitespace-nowrap">{{ formatMoney(order.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AdminDrawer
      :open="!!activeOrder"
      :title="activeOrder ? $t('admin.orders.drawerTitle', { number: activeOrder.order_number }) : ''"
      :subtitle="activeOrder ? formatDate(activeOrder.created_at, true) : ''"
      @update:open="(value) => !value && closeOrder()"
    >
      <template v-if="activeOrder">
        <div class="flex flex-wrap items-center gap-2 mb-6">
          <label for="drawer-status" class="text-sm text-stone-500">{{ $t('admin.orders.status') }}</label>
          <select
            id="drawer-status"
            :value="activeOrder.status"
            :disabled="busyIds.has(activeOrder.id)"
            class="adm-input w-auto h-9"
            @change="updateStatus(activeOrder, $event)"
          >
            <option v-for="option in ORDER_STATUS_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <span class="adm-badge bg-stone-100 text-stone-600 ms-auto">{{ $t('admin.orders.paymentLabel', { method: paymentLabel(activeOrder.payment_method) }) }}</span>
        </div>

        <h3 class="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{{ $t('admin.orders.items') }}</h3>
        <ul class="adm-card divide-y divide-stone-200 mb-4">
          <li v-for="item in activeOrder.items" :key="item.id" class="flex items-center gap-3 px-4 py-3 text-sm">
            <span class="adm-badge bg-stone-100 text-stone-600 font-mono shrink-0">{{ item.sku || '—' }}</span>
            <span class="flex-1 min-w-0">
              <span dir="auto" class="block truncate text-start">{{ item.name }}</span>
              <span class="text-xs text-stone-500">{{ formatMoney(item.sale_price ?? item.price) }} × {{ item.quantity }}</span>
            </span>
            <span class="font-medium shrink-0">{{ formatMoney((item.sale_price ?? item.price) * item.quantity) }}</span>
          </li>
        </ul>

        <dl class="text-sm space-y-1.5 mb-8 px-1">
          <div v-if="activeOrder.discount" class="flex justify-between text-stone-600">
            <dt>{{ $t('admin.orders.discount') }} <span v-if="activeOrder.coupon_code" class="font-mono text-xs">({{ activeOrder.coupon_code }})</span></dt>
            <dd>− {{ formatMoney(activeOrder.discount) }}</dd>
          </div>
          <div class="flex justify-between text-stone-600">
            <dt>{{ $t('admin.orders.shipping') }}</dt>
            <dd>{{ activeOrder.shipping_fee ? formatMoney(activeOrder.shipping_fee) : $t('admin.common.free') }}</dd>
          </div>
          <div class="flex justify-between font-semibold text-stone-800 text-base pt-1.5 border-t border-stone-200">
            <dt>{{ $t('admin.orders.total') }}</dt>
            <dd>{{ formatMoney(activeOrder.total) }}</dd>
          </div>
        </dl>

        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-stone-400">{{ $t('admin.orders.customer') }}</h3>
          <button v-if="!isEditing" type="button" class="adm-btn adm-btn-ghost adm-btn-sm -me-2" @click="startEdit(activeOrder)">
            <Icon name="mdi:pencil-outline" class="text-sm" />
            {{ $t('admin.common.edit') }}
          </button>
        </div>

        <form v-if="isEditing" class="adm-card p-4 space-y-3" @submit.prevent="saveDetails(activeOrder)">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label for="edit-customer-name" class="adm-label">{{ $t('admin.orders.name') }}</label>
              <input id="edit-customer-name" v-model="editForm.customer_name" dir="auto" required class="adm-input" />
            </div>
            <div>
              <label for="edit-phone" class="adm-label">{{ $t('admin.orders.phone') }}</label>
              <input id="edit-phone" v-model="editForm.phone" type="tel" dir="ltr" required class="adm-input rtl:text-right" />
            </div>
          </div>
          <div>
            <label for="edit-governorate" class="adm-label">{{ $t('admin.orders.governorate') }}</label>
            <select id="edit-governorate" v-model="editForm.governorate" required class="adm-input">
              <option v-for="g in governorates" :key="g.value" :value="g.value">{{ governorateName(g) }}</option>
            </select>
          </div>
          <div>
            <label for="edit-address" class="adm-label">{{ $t('admin.orders.address') }}</label>
            <textarea id="edit-address" v-model="editForm.address" dir="auto" required rows="3" class="adm-input"></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="adm-btn adm-btn-secondary" @click="isEditing = false">{{ $t('admin.common.cancel') }}</button>
            <button type="submit" class="adm-btn adm-btn-primary" :disabled="busyIds.has(activeOrder.id)">{{ $t('admin.common.save') }}</button>
          </div>
        </form>

        <div v-else class="adm-card p-4 text-sm space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-ink/10 text-ink font-semibold flex items-center justify-center uppercase shrink-0">
              {{ activeOrder.customer_name?.[0] }}
            </div>
            <div class="min-w-0">
              <p dir="auto" class="font-medium truncate text-start">{{ activeOrder.customer_name }}</p>
              <p dir="ltr" class="text-stone-500 text-start">{{ activeOrder.phone }}</p>
            </div>
          </div>
          <div class="flex gap-2 text-stone-600">
            <Icon name="mdi:map-marker-outline" class="text-base shrink-0 mt-0.5 text-stone-400" />
            <p dir="auto">{{ activeOrder.governorate ? `${governorateLabel(activeOrder.governorate)} — ` : '' }}{{ activeOrder.address }}</p>
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            <a :href="`https://wa.me/${toWhatsAppNumber(activeOrder.phone)}`" target="_blank" rel="noopener" class="adm-btn adm-btn-secondary adm-btn-sm">
              <Icon name="mdi:whatsapp" class="text-base text-[#25D366]" />
              WhatsApp
            </a>
            <a :href="`tel:${activeOrder.phone}`" class="adm-btn adm-btn-secondary adm-btn-sm">
              <Icon name="mdi:phone-outline" class="text-base" />
              {{ $t('admin.orders.call') }}
            </a>
            <button type="button" class="adm-btn adm-btn-secondary adm-btn-sm" @click="copyOrder(activeOrder)">
              <Icon name="mdi:content-copy" class="text-sm" />
              {{ $t('admin.orders.copyDetails') }}
            </button>
          </div>
        </div>
      </template>

      <template #footer>
        <div v-if="activeOrder" class="flex items-center justify-between gap-2">
          <button type="button" class="adm-btn adm-btn-danger-soft" :disabled="busyIds.has(activeOrder.id)" @click="deleteOne(activeOrder)">
            <Icon name="mdi:trash-can-outline" class="text-base" />
            {{ $t('admin.orders.deleteOrder') }}
          </button>
          <button type="button" class="adm-btn adm-btn-secondary" @click="closeOrder">{{ $t('admin.common.close') }}</button>
        </div>
      </template>
    </AdminDrawer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'orders'
})
const { t, tc, governorateName } = useLang()
useSeoMeta({ title: () => t('admin.orders.metaTitle'), robots: 'noindex' })

const governorateLabel = (value) => governorateName(governorates.find((g) => g.value === value)) || value

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const { confirm } = useAdminConfirm()
const { refresh: refreshBadges } = useAdminBadges()
const { data, pending, error, refresh } = await useFetch('/api/admin/orders')
const orders = computed(() => data.value?.orders ?? [])

const activeTab = ref(ORDER_STATUS_META[route.query.status] ? route.query.status : 'all')
const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const paymentFilter = ref('')
const activeId = ref(route.query.open ? String(route.query.open) : null)
const isEditing = ref(false)
const editForm = ref({ customer_name: '', phone: '', governorate: '', address: '' })
const selected = reactive(new Set())
const busyIds = reactive(new Set())
const bulkStatus = ref('')
const isBulkBusy = ref(false)

const activeOrder = computed(() => orders.value.find((o) => String(o.id) === activeId.value) ?? null)

const tabs = computed(() => [
  { value: 'all', label: t('admin.orders.all'), count: orders.value.length },
  ...ORDER_STATUS_OPTIONS.map((option) => ({
    ...option,
    count: orders.value.filter((o) => o.status === option.value).length,
  })),
])

const filteredOrders = computed(() => {
  const query = search.value.trim().toLowerCase()
  return orders.value.filter((o) => {
    if (activeTab.value !== 'all' && o.status !== activeTab.value) return false
    if (paymentFilter.value && o.payment_method !== paymentFilter.value) return false
    if (!query) return true
    return [o.order_number, o.customer_name, o.phone].some((field) => String(field ?? '').toLowerCase().includes(query))
  })
})

const allVisibleSelected = computed(
  () => filteredOrders.value.length > 0 && filteredOrders.value.every((o) => selected.has(o.id))
)

watch([activeTab, search, paymentFilter], () => selected.clear())

// Topbar search and dashboard links land here with ?q= / ?status= / ?open=.
watch(() => route.query, (query) => {
  if (typeof query.q === 'string') search.value = query.q
  if (typeof query.status === 'string' && ORDER_STATUS_META[query.status]) activeTab.value = query.status
  activeId.value = query.open ? String(query.open) : null
})

function toggleSelected(id) {
  if (selected.has(id)) selected.delete(id)
  else selected.add(id)
}

function toggleAllVisible() {
  if (allVisibleSelected.value) filteredOrders.value.forEach((o) => selected.delete(o.id))
  else filteredOrders.value.forEach((o) => selected.add(o.id))
}

function openOrder(order) {
  isEditing.value = false
  router.replace({ query: { ...route.query, open: order.id } })
}

function closeOrder() {
  isEditing.value = false
  const { open, ...rest } = route.query
  router.replace({ query: rest })
}

async function refreshAll() {
  await Promise.all([refresh(), refreshBadges()])
}

async function updateStatus(order, event) {
  const newStatus = event.target.value
  busyIds.add(order.id)
  try {
    await $fetch(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { status: newStatus } })
    toast.show(t('admin.orders.markedAs', { number: order.order_number, status: ORDER_STATUS_META[newStatus]?.label }))
    await refreshAll()
  } catch (err) {
    event.target.value = order.status
    toast.error(adminErrorMessage(err))
  } finally {
    busyIds.delete(order.id)
  }
}

function startEdit(order) {
  editForm.value = {
    customer_name: order.customer_name ?? '',
    phone: order.phone ?? '',
    governorate: order.governorate ?? '',
    address: order.address ?? '',
  }
  isEditing.value = true
}

async function saveDetails(order) {
  busyIds.add(order.id)
  try {
    await $fetch(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: editForm.value })
    toast.show(t('admin.orders.updated', { number: order.order_number }))
    isEditing.value = false
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    busyIds.delete(order.id)
  }
}

async function copyOrder(order) {
  const lines = [
    t('admin.orders.copyText.order', { number: order.order_number }),
    `${order.customer_name} — ${order.phone}`,
    `${order.governorate ? `${governorateLabel(order.governorate)} — ` : ''}${order.address}`,
    '',
    ...order.items.map((item) => `${item.name} × ${item.quantity}`),
    '',
    t('admin.orders.copyText.total', { total: formatMoney(order.total), payment: paymentLabel(order.payment_method) }),
  ]
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
    toast.show(t('admin.orders.copied'))
  } catch {
    toast.error(t('admin.orders.copyFailed'))
  }
}

async function deleteOne(order) {
  const ok = await confirm({
    title: t('admin.orders.deleteTitle', { number: order.order_number }),
    message: order.status === 'delivered' || order.status === 'cancelled'
      ? t('admin.orders.deleteText')
      : t('admin.orders.deleteRestock'),
    confirmLabel: t('admin.orders.deleteOrder'),
    danger: true,
  })
  if (!ok) return

  busyIds.add(order.id)
  try {
    const { failed } = await $fetch('/api/admin/orders/bulk', { method: 'POST', body: { ids: [order.id], action: 'delete' } })
    if (failed.length) {
      toast.error(adminErrorMessage(failed[0]))
      return
    }
    toast.show(t('admin.orders.deleted', { number: order.order_number }))
    selected.delete(order.id)
    closeOrder()
    await refreshAll()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    busyIds.delete(order.id)
  }
}

async function runBulk(action) {
  const ids = [...selected]
  if (action === 'delete') {
    const ok = await confirm({
      title: tc('admin.orders.bulkDeleteTitle', ids.length),
      message: t('admin.orders.bulkDeleteText'),
      confirmLabel: t('admin.common.delete'),
      danger: true,
    })
    if (!ok) return
  }

  isBulkBusy.value = true
  try {
    const { done, failed } = await $fetch('/api/admin/orders/bulk', {
      method: 'POST',
      body: { ids, action, status: bulkStatus.value || undefined },
    })
    if (failed.length) toast.error(t('admin.orders.bulkPartial', { done, failed: failed.length, number: failed[0].order_number, reason: adminErrorMessage(failed[0]) }))
    else toast.show(tc(action === 'delete' ? 'admin.orders.bulkDeleted' : 'admin.orders.bulkUpdated', done))
    selected.clear()
    bulkStatus.value = ''
    await refreshAll()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isBulkBusy.value = false
  }
}
</script>
