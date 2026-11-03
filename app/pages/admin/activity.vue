<template>
  <div>
    <AdminPageHeader :title="$t('admin.activity.metaTitle')" :description="$t('admin.activity.description')" />

    <div class="flex flex-wrap items-center gap-2 mb-4">
      <button
        v-for="option in areaOptions"
        :key="option.value"
        type="button"
        class="adm-btn adm-btn-sm"
        :class="area === option.value ? 'adm-btn-primary' : 'adm-btn-secondary'"
        @click="area = option.value"
      >
        {{ option.label }}
      </button>
      <input v-model="searchInput" type="search" dir="auto" :placeholder="$t('admin.activity.searchPlaceholder')" class="adm-input max-w-xs ms-auto" />
    </div>

    <section class="adm-card overflow-hidden">
      <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" :title="$t('admin.activity.loadFailed')" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">{{ $t('admin.common.tryAgain') }}</button>
      </AdminEmptyState>
      <AdminEmptyState v-else-if="!pending && entries.length === 0" icon="mdi:history" :title="$t('admin.activity.empty')" :description="$t('admin.activity.emptyText')" />

      <ul v-else class="divide-y divide-stone-200" :class="{ 'opacity-60': pending }">
        <li v-for="entry in entries" :key="entry.id" class="flex flex-wrap items-start gap-3 px-5 py-3">
          <div class="w-9 h-9 rounded-full bg-gold/15 text-gold font-semibold flex items-center justify-center uppercase shrink-0">{{ entry.admin_email[0] }}</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-stone-800">
              <span class="font-semibold">{{ actionLabel(entry.action) }}</span>
              <span v-if="entry.target" dir="ltr" class="ms-1.5 adm-badge bg-stone-100 text-stone-700">{{ entry.target }}</span>
              <span v-if="entry.details?.name" class="ms-1.5 text-stone-600">{{ entry.details.name }}</span>
            </p>
            <ul v-if="lines(entry).length" class="mt-1 space-y-0.5 text-xs text-stone-600">
              <li v-for="(line, i) in lines(entry)" :key="i" class="break-words">{{ line }}</li>
            </ul>
            <p class="text-xs text-stone-400 mt-1">
              <span dir="ltr">{{ entry.admin_email }}</span> · {{ formatDate(entry.created_at, true) }}
            </p>
          </div>
          <button v-if="entry.action === 'product.delete'" type="button" class="adm-btn adm-btn-secondary adm-btn-sm" :disabled="restoring === entry.id" @click="restore(entry)">
            <Icon :name="restoring === entry.id ? 'mdi:loading' : 'mdi:restore'" class="text-sm" :class="{ 'animate-spin': restoring === entry.id }" />
            {{ $t('admin.activity.restore') }}
          </button>
        </li>
      </ul>
      <AdminPagination v-if="totalPages > 1" v-model="currentPage" :total-pages="totalPages" :total="total" :page-size="pageSize" />
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminOwnerOnly: true
})

const { t, isAr } = useLang()
const { te } = useI18n()
// before → after, pointing the reading direction
const arrow = computed(() => (isAr.value ? '←' : '→'))
useSeoMeta({ title: () => t('admin.activity.metaTitle'), robots: 'noindex' })
const toast = useToastStore()
const { confirm } = useAdminConfirm()

const area = ref('')
const searchInput = ref('')
const search = ref('')
const currentPage = ref(1)
let searchTimer
watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { search.value = value.trim(); currentPage.value = 1 }, 350)
})
watch(area, () => { currentPage.value = 1 })

const areaOptions = computed(() => [
  { value: '', label: t('admin.activity.all') },
  ...['product', 'order', 'coupon', 'settings', 'shipping', 'admin', 'review', 'newsletter'].map((value) => ({ value, label: t(`admin.activity.areas.${value}`) })),
])

const { data, pending, error, refresh } = await useFetch('/api/admin/activity', {
  query: { page: currentPage, area, search },
})
const entries = computed(() => data.value?.entries ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 1)
const pageSize = computed(() => data.value?.pageSize ?? 50)

function actionLabel(action) {
  const key = `admin.activity.actions.${action}`
  return te(key) ? t(key) : action
}

function show(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return t('admin.activity.photos', { count: value.length })
  if (typeof value === 'boolean') return value ? t('admin.activity.yes') : t('admin.activity.no')
  if (typeof value === 'object') return JSON.stringify(value)
  const text = String(value)
  if (/^https?:\/\//.test(text)) return text.split('/').pop()
  return text.length > 80 ? `${text.slice(0, 80)}…` : text
}

function columnLabel(column) {
  const key = `admin.activity.columns.${column}`
  return te(key) ? t(key) : column
}

// What changed, as short readable lines.
function lines(entry) {
  const d = entry.details
  if (!d) return []
  if (d.changes) {
    const list = Object.entries(d.changes).map(([column, [before, after]]) => `${columnLabel(column)}: ${show(before)} ${arrow.value} ${show(after)}`)
    return list.length ? list : [t('admin.activity.noChange')]
  }
  if (entry.action === 'order.status') return [`${t(`admin.status.${d.from}`)} ${arrow.value} ${t(`admin.status.${d.to}`)}`]
  if (entry.action === 'products.import') return [t('admin.activity.importSummary', { rows: d.rows, saved: d.saved, added: d.added })]
  if (entry.action === 'newsletter.send') return [`${d.subject ?? ''} — ${t('admin.activity.sentSummary', { sent: d.sent ?? 0 })}`]
  if (entry.action === 'admin.permissions' || entry.action === 'admin.add') {
    const names = (list) => (list ?? []).map((p) => t(`admin.sections.${p}`)).join('، ')
    return entry.action === 'admin.add' ? [names(d.permissions)] : [`${names(d.from)} ${arrow.value} ${names(d.to)}`]
  }
  if (entry.action === 'product.create') return [`${columnLabel('price')}: ${show(d.price)} · ${columnLabel('stock')}: ${show(d.stock)}`]
  if (entry.action === 'product.delete' && d.row) return [`${columnLabel('price')}: ${show(d.row.price)} · ${columnLabel('stock')}: ${show(d.row.stock)} · ${columnLabel('category')}: ${show(d.row.category)}`]
  return []
}

const restoring = ref(null)
async function restore(entry) {
  const name = entry.details?.name ?? entry.target
  const ok = await confirm({
    title: t('admin.activity.restoreTitle', { name }),
    message: t('admin.activity.restoreText'),
    confirmLabel: t('admin.activity.restore'),
  })
  if (!ok) return
  restoring.value = entry.id
  try {
    await $fetch(`/api/admin/activity/${entry.id}/restore`, { method: 'POST' })
    toast.show(t('admin.activity.restored', { name }))
    await refresh()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    restoring.value = null
  }
}
</script>
