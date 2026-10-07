<template>
  <div>
    <AdminPageHeader :title="$t('admin.products.metaTitle')" :description="plural(totalCount, 'product')">
      <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleImport" />
      <button type="button" class="adm-btn adm-btn-secondary" :disabled="isImporting" @click="fileInput?.click()">
        <Icon :name="isImporting ? 'mdi:loading' : 'mdi:upload-outline'" class="text-base" :class="{ 'animate-spin': isImporting }" />
        {{ isImporting ? $t('admin.products.importing') : $t('admin.products.importCsv') }}
      </button>
      <a href="/api/admin/products/export" class="adm-btn adm-btn-secondary">
        <Icon name="mdi:download-outline" class="text-base" />
        {{ $t('admin.products.exportCsv') }}
      </a>
      <NuxtLink to="/admin/products/new" class="adm-btn adm-btn-primary">
        <Icon name="mdi:plus" class="text-base" />
        {{ $t('admin.products.add') }}
      </NuxtLink>
    </AdminPageHeader>

    <div v-if="importResult" class="adm-card p-4 mb-4 flex gap-3" :class="importResult.errors.length ? 'border-amber-200 dark:border-amber-500/30' : 'border-emerald-200 dark:border-emerald-500/30'">
      <Icon
        :name="importResult.errors.length ? 'mdi:alert-outline' : 'mdi:check-circle-outline'"
        class="text-xl shrink-0"
        :class="importResult.errors.length ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'"
      />
      <div class="flex-1 min-w-0 text-sm">
        <p class="font-medium text-stone-800">{{ $t('admin.products.importDone', { saved: importResult.upserted, total: importResult.totalRows }) }}</p>
        <template v-if="importResult.errors.length">
          <p class="text-stone-500 mt-0.5">{{ $t('admin.products.importSkipped', { count: importResult.errors.length }) }}</p>
          <ul class="text-stone-500 list-disc list-inside max-h-32 overflow-y-auto mt-1">
            <li v-for="err in importResult.errors" :key="err.row">{{ $t('admin.products.importRow', { row: err.row, message: err.code ? $t(`admin.errors.import.${err.code}`, err.params) : err.message }) }}</li>
          </ul>
        </template>
      </div>
      <button type="button" class="adm-icon-btn shrink-0" :aria-label="$t('admin.products.dismiss')" @click="importResult = null">
        <Icon name="mdi:close" class="text-lg" />
      </button>
    </div>

    <section class="adm-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-stone-200">
        <div class="relative flex-1 min-w-[220px]">
          <Icon name="mdi:magnify" class="absolute start-3 top-1/2 -translate-y-1/2 text-lg text-stone-400 pointer-events-none" />
          <input
            id="products-search"
            v-model="searchInput"
            type="search"
            :placeholder="$t('admin.products.searchPlaceholder')"
            class="adm-input ps-9"
          />
        </div>
        <select id="products-category" v-model="category" class="adm-input w-auto" :aria-label="$t('admin.products.table.category')">
          <option value="all">{{ $t('admin.products.allCategories') }}</option>
          <option v-for="c in PRODUCT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <select id="products-stock" v-model="stockFilter" class="adm-input w-auto" :aria-label="$t('admin.products.table.stock')">
          <option value="">{{ $t('admin.products.anyStock') }}</option>
          <option value="low">{{ $t('admin.products.lowStock', { limit: LOW_STOCK_LIMIT }) }}</option>
          <option value="out">{{ $t('admin.products.outOfStock') }}</option>
          <option value="in">{{ $t('admin.products.inStock') }}</option>
        </select>
        <select id="products-photo" v-model="photoFilter" class="adm-input w-auto" :aria-label="$t('admin.editor.photos')">
          <option value="">{{ $t('admin.products.anyPhoto') }}</option>
          <option value="missing">{{ $t('admin.products.needsPhoto') }}</option>
          <option value="has">{{ $t('admin.products.hasPhoto') }}</option>
        </select>
        <select id="products-sort" v-model="sort" class="adm-input w-auto" :aria-label="$t('admin.products.sort.newest')">
          <option value="newest">{{ $t('admin.products.sort.newest') }}</option>
          <option value="name">{{ $t('admin.products.sort.name') }}</option>
          <option value="stock">{{ $t('admin.products.sort.stock') }}</option>
          <option value="price">{{ $t('admin.products.sort.price') }}</option>
        </select>
      </div>

      <div v-if="selectedIds.length" class="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-ink/5 border-b border-stone-200">
        <span class="text-sm font-medium text-stone-800 me-1">{{ $t('admin.common.selected', { count: selectedIds.length }) }}</span>
        <select id="bulk-category" v-model="bulkCategory" class="adm-input h-8 text-xs w-auto">
          <option value="" disabled>{{ $t('admin.products.moveTo') }}</option>
          <option v-for="c in PRODUCT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <button type="button" class="adm-btn adm-btn-primary adm-btn-sm" :disabled="!bulkCategory || isBulkBusy" @click="bulkUpdateCategory">
          {{ $t('admin.common.apply') }}
        </button>
        <button type="button" class="adm-btn adm-btn-danger-soft adm-btn-sm" :disabled="isBulkBusy" @click="bulkDelete">
          <Icon name="mdi:trash-can-outline" class="text-sm" />
          {{ $t('admin.common.delete') }}
        </button>
        <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm ms-auto" @click="selectedIds = []">{{ $t('admin.common.clearSelection') }}</button>
      </div>

      <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" :title="$t('admin.products.loadFailed')" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">{{ $t('admin.common.tryAgain') }}</button>
      </AdminEmptyState>

      <AdminEmptyState
        v-else-if="!pending && products.length === 0"
        icon="mdi:package-variant-closed"
        :title="$t('admin.products.noneFound')"
        :description="$t('admin.products.tryFilter')"
      />

      <div v-else class="overflow-x-auto" :class="{ 'opacity-60 pointer-events-none': pending }">
        <table class="adm-table min-w-[760px]">
          <thead>
            <tr>
              <th class="w-10">
                <input
                  type="checkbox"
                  class="adm-checkbox"
                  :checked="allSelected"
                  :indeterminate.prop="selectedIds.length > 0 && !allSelected"
                  :aria-label="$t('admin.products.selectAll')"
                  @change="toggleAll"
                />
              </th>
              <th>{{ $t('admin.products.table.product') }}</th>
              <th>{{ $t('admin.products.table.category') }}</th>
              <th class="text-end">{{ $t('admin.products.table.price') }}</th>
              <th>{{ $t('admin.products.table.stock') }}</th>
              <th class="w-28"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id" :class="selectedIds.includes(product.id) ? 'bg-ink/5' : 'hover:bg-stone-50'">
              <td>
                <input
                  type="checkbox"
                  class="adm-checkbox"
                  :checked="selectedIds.includes(product.id)"
                  :aria-label="$t('admin.products.select', { name: $pname(product) })"
                  @change="toggleSelect(product.id)"
                />
              </td>
              <td>
                <NuxtLink :to="`/admin/products/${product.id}`" class="flex items-center gap-3 group">
                  <AdminProductThumb :src="product.image" :alt="$pname(product)" :missing="product.photoMissing" class="w-11 h-11 rounded-lg" />
                  <div class="min-w-0">
                    <p dir="auto" class="font-medium truncate max-w-[340px] text-start group-hover:text-ink group-hover:underline">{{ $pname(product) }}</p>
                    <p class="text-xs text-stone-500 truncate">
                      <span class="font-mono">{{ product.sku || $t('admin.products.noSku') }}</span>
                      <span v-if="product.brand"> · {{ product.brand }}</span>
                      <span v-if="product.photoMissing" class="text-amber-700 dark:text-amber-400"> · {{ $t('admin.products.needsPhoto') }}</span>
                      <span v-else-if="product.images?.length"> · {{ $t('admin.products.photos', { count: product.images.length + 1 }) }}</span>
                    </p>
                  </div>
                </NuxtLink>
              </td>
              <td class="text-stone-600 whitespace-nowrap">
                {{ categoryLabel(product.category) }}
                <span v-if="product.badge" class="adm-badge bg-gold/10 text-gold ms-1">{{ $t(`admin.editor.badges.${product.badge}`) }}</span>
              </td>
              <td class="text-end whitespace-nowrap">
                <template v-if="product.sale_price">
                  <p class="font-medium">{{ formatMoney(product.sale_price) }}</p>
                  <p class="text-xs text-stone-400 line-through">{{ formatMoney(product.price) }}</p>
                </template>
                <p v-else class="font-medium">{{ formatMoney(product.price) }}</p>
              </td>
              <td>
                <div class="flex items-center gap-1.5">
                  <button type="button" class="adm-icon-btn w-7 h-7 border border-stone-200" :disabled="product.stock === 0 || savingStock.has(product.id)" :aria-label="$t('admin.products.decrease')" @click="saveStock(product, product.stock - 1)">
                    <Icon name="mdi:minus" class="text-sm" />
                  </button>
                  <input
                    :value="product.stock"
                    type="number"
                    min="0"
                    inputmode="numeric"
                    :aria-label="$t('admin.products.stockFor', { name: $pname(product) })"
                    class="w-14 h-7 text-center text-sm rounded-md border outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    :class="product.stock === 0 ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400' : product.stock <= LOW_STOCK_LIMIT ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300' : 'border-stone-200'"
                    :disabled="savingStock.has(product.id)"
                    @keydown.enter="$event.target.blur()"
                    @change="saveStock(product, Number($event.target.value), $event.target)"
                  />
                  <button type="button" class="adm-icon-btn w-7 h-7 border border-stone-200" :disabled="savingStock.has(product.id)" :aria-label="$t('admin.products.increase')" @click="saveStock(product, product.stock + 1)">
                    <Icon name="mdi:plus" class="text-sm" />
                  </button>
                </div>
              </td>
              <td>
                <div class="flex items-center justify-end gap-0.5">
                  <a v-if="product.slug" :href="`/product/${product.slug}`" target="_blank" rel="noopener" class="adm-icon-btn" :title="$t('admin.products.viewInStore')" :aria-label="$t('admin.products.viewInStore')">
                    <Icon name="mdi:open-in-new" class="text-base" />
                  </a>
                  <NuxtLink :to="`/admin/products/${product.id}`" class="adm-icon-btn" :title="$t('admin.common.edit')" :aria-label="$t('admin.common.edit')">
                    <Icon name="mdi:pencil-outline" class="text-lg" />
                  </NuxtLink>
                  <button type="button" class="adm-icon-btn hover:!text-red-600 hover:!bg-red-50" :title="$t('admin.common.delete')" :aria-label="$t('admin.common.delete')" @click="handleDelete(product)">
                    <Icon name="mdi:trash-can-outline" class="text-lg" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminPagination
        v-if="totalCount > 0"
        v-model="currentPage"
        :total-pages="totalPages"
        :total="totalCount"
        :page-size="data?.pageSize ?? 50"
      />
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'products',
})
const { t, tc, productName } = useLang()
useSeoMeta({ title: () => t('admin.products.metaTitle'), robots: 'noindex' })

const route = useRoute()
const toast = useToastStore()
const { confirm } = useAdminConfirm()
const { refresh: refreshBadges } = useAdminBadges()

const currentPage = ref(1)
const searchInput = ref(typeof route.query.q === 'string' ? route.query.q : '')
const search = ref(searchInput.value)
const category = ref('all')
const stockFilter = ref(['low', 'out', 'in'].includes(route.query.stock) ? route.query.stock : '')
const photoFilter = ref(['missing', 'has'].includes(route.query.photo) ? route.query.photo : '')
const sort = ref(route.query.stock ? 'stock' : 'newest')
const selectedIds = ref([])
const bulkCategory = ref('')
const isBulkBusy = ref(false)
const fileInput = ref(null)
const importResult = ref(null)
const isImporting = ref(false)
const savingStock = reactive(new Set())

let searchTimer
watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { search.value = value.trim() }, 300)
})
watch(() => route.query.q, (q) => { if (typeof q === 'string') searchInput.value = q })
watch([search, category, stockFilter, photoFilter, sort], () => {
  currentPage.value = 1
  selectedIds.value = []
})
watch(currentPage, () => { selectedIds.value = [] })

const { data, pending, error, refresh } = await useFetch('/api/admin/products', {
  query: { page: currentPage, search, category, stock: stockFilter, photo: photoFilter, sort },
})

const products = computed(() => data.value?.products ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 1)
const totalCount = computed(() => data.value?.total ?? 0)
const allSelected = computed(() => products.value.length > 0 && products.value.every((p) => selectedIds.value.includes(p.id)))

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(index, 1)
}

function toggleAll() {
  selectedIds.value = allSelected.value ? [] : products.value.map((p) => p.id)
}

async function saveStock(product, value, input) {
  if (!Number.isInteger(value) || value < 0) {
    if (input) input.value = product.stock
    toast.error(t('admin.products.stockInvalid'))
    return
  }
  if (value === product.stock) return

  const previous = product.stock
  product.stock = value
  savingStock.add(product.id)
  try {
    await $fetch(`/api/admin/products/${product.id}`, { method: 'PATCH', body: { stock: value } })
    refreshBadges()
  } catch (err) {
    product.stock = previous
    if (input) input.value = previous
    toast.error(adminErrorMessage(err))
  } finally {
    savingStock.delete(product.id)
  }
}

async function handleImport(event) {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return

  const ok = await confirm({
    title: t('admin.products.importTitle', { file: file.name }),
    message: t('admin.products.importText'),
    confirmLabel: t('admin.products.importConfirm'),
  })
  if (!ok) return

  isImporting.value = true
  try {
    importResult.value = await $fetch('/api/admin/products/import', { method: 'POST', body: { csv: await file.text() } })
    await refresh()
    refreshBadges()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isImporting.value = false
  }
}

async function runForSelected(request) {
  isBulkBusy.value = true
  const results = await Promise.allSettled(selectedIds.value.map(request))
  isBulkBusy.value = false
  const failed = results.filter((r) => r.status === 'rejected')
  selectedIds.value = []
  await refresh()
  refreshBadges()
  return { done: results.length - failed.length, failed }
}

async function bulkUpdateCategory() {
  const label = categoryLabel(bulkCategory.value)
  const { done, failed } = await runForSelected((id) =>
    $fetch(`/api/admin/products/${id}`, { method: 'PATCH', body: { category: bulkCategory.value, subcategory: null } })
  )
  bulkCategory.value = ''
  if (failed.length) toast.error(t('admin.products.movedPartial', { done, failed: failed.length, reason: adminErrorMessage(failed[0].reason) }))
  else toast.show(tc('admin.products.moved', done, { category: label }))
}

async function bulkDelete() {
  const count = selectedIds.value.length
  const ok = await confirm({
    title: tc('admin.products.bulkDeleteTitle', count),
    message: t('admin.products.bulkDeleteText'),
    confirmLabel: t('admin.common.delete'),
    danger: true,
  })
  if (!ok) return

  const { done, failed } = await runForSelected((id) => $fetch(`/api/admin/products/${id}`, { method: 'DELETE' }))
  if (failed.length) toast.error(t('admin.products.bulkDeletedPartial', { done, failed: failed.length, reason: adminErrorMessage(failed[0].reason) }))
  else toast.show(tc('admin.products.bulkDeleted', done))
}

async function handleDelete(product) {
  const ok = await confirm({
    title: t('admin.products.deleteTitle', { name: productName(product) }),
    message: t('admin.products.deleteText'),
    confirmLabel: t('admin.common.delete'),
    danger: true,
  })
  if (!ok) return

  try {
    await $fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    toast.show(t('admin.products.deleted'))
    await refresh()
    refreshBadges()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  }
}
</script>
