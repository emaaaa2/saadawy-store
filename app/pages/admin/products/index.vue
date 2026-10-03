<template>
  <div>
    <AdminPageHeader title="Products" :description="plural(totalCount, 'product')">
      <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleImport" />
      <button type="button" class="adm-btn adm-btn-secondary" :disabled="isImporting" @click="fileInput?.click()">
        <Icon :name="isImporting ? 'mdi:loading' : 'mdi:upload-outline'" class="text-base" :class="{ 'animate-spin': isImporting }" />
        {{ isImporting ? 'Importing…' : 'Import CSV' }}
      </button>
      <a href="/api/admin/products/export" class="adm-btn adm-btn-secondary">
        <Icon name="mdi:download-outline" class="text-base" />
        Export CSV
      </a>
      <NuxtLink to="/admin/products/new" class="adm-btn adm-btn-primary">
        <Icon name="mdi:plus" class="text-base" />
        Add product
      </NuxtLink>
    </AdminPageHeader>

    <div v-if="importResult" class="adm-card p-4 mb-4 flex gap-3" :class="importResult.errors.length ? 'border-amber-200' : 'border-emerald-200'">
      <Icon
        :name="importResult.errors.length ? 'mdi:alert-outline' : 'mdi:check-circle-outline'"
        class="text-xl shrink-0"
        :class="importResult.errors.length ? 'text-amber-600' : 'text-emerald-600'"
      />
      <div class="flex-1 min-w-0 text-sm">
        <p class="font-medium text-stone-800">Import finished: {{ importResult.upserted }} of {{ importResult.totalRows }} rows saved.</p>
        <template v-if="importResult.errors.length">
          <p class="text-stone-500 mt-0.5">{{ importResult.errors.length }} row(s) were skipped:</p>
          <ul class="text-stone-500 list-disc list-inside max-h-32 overflow-y-auto mt-1">
            <li v-for="err in importResult.errors" :key="err.row">Row {{ err.row }}: {{ err.message }}</li>
          </ul>
        </template>
      </div>
      <button type="button" class="adm-icon-btn shrink-0" aria-label="Dismiss" @click="importResult = null">
        <Icon name="mdi:close" class="text-lg" />
      </button>
    </div>

    <section class="adm-card overflow-hidden">
      <div class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-stone-200">
        <div class="relative flex-1 min-w-[220px]">
          <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-stone-400 pointer-events-none" />
          <input
            id="products-search"
            v-model="searchInput"
            type="search"
            placeholder="Search by name, SKU or brand"
            class="adm-input pl-9"
          />
        </div>
        <select id="products-category" v-model="category" class="adm-input w-auto" aria-label="Category">
          <option value="all">All categories</option>
          <option v-for="c in PRODUCT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <select id="products-stock" v-model="stockFilter" class="adm-input w-auto" aria-label="Stock">
          <option value="">Any stock</option>
          <option value="low">Low stock (≤ {{ LOW_STOCK_LIMIT }})</option>
          <option value="out">Out of stock</option>
          <option value="in">In stock</option>
        </select>
        <select id="products-photo" v-model="photoFilter" class="adm-input w-auto" aria-label="Photo">
          <option value="">Any photo</option>
          <option value="missing">Needs a photo</option>
          <option value="has">Has a photo</option>
        </select>
        <select id="products-sort" v-model="sort" class="adm-input w-auto" aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="stock">Lowest stock</option>
          <option value="price">Highest price</option>
        </select>
      </div>

      <div v-if="selectedIds.length" class="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-olive/5 border-b border-stone-200">
        <span class="text-sm font-medium text-stone-800 mr-1">{{ selectedIds.length }} selected</span>
        <select id="bulk-category" v-model="bulkCategory" class="adm-input h-8 text-xs w-auto">
          <option value="" disabled>Move to category…</option>
          <option v-for="c in PRODUCT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <button type="button" class="adm-btn adm-btn-primary adm-btn-sm" :disabled="!bulkCategory || isBulkBusy" @click="bulkUpdateCategory">
          Apply
        </button>
        <button type="button" class="adm-btn adm-btn-danger-soft adm-btn-sm" :disabled="isBulkBusy" @click="bulkDelete">
          <Icon name="mdi:trash-can-outline" class="text-sm" />
          Delete
        </button>
        <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm ml-auto" @click="selectedIds = []">Clear selection</button>
      </div>

      <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" title="Couldn't load products" :description="adminErrorMessage(error)">
        <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">Try again</button>
      </AdminEmptyState>

      <AdminEmptyState
        v-else-if="!pending && products.length === 0"
        icon="mdi:package-variant-closed"
        title="No products found"
        description="Try a different search or filter."
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
                  aria-label="Select all products on this page"
                  @change="toggleAll"
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th class="text-right">Price</th>
              <th>Stock</th>
              <th class="w-28"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id" :class="selectedIds.includes(product.id) ? 'bg-olive/5' : 'hover:bg-stone-50'">
              <td>
                <input
                  type="checkbox"
                  class="adm-checkbox"
                  :checked="selectedIds.includes(product.id)"
                  :aria-label="`Select ${product.name}`"
                  @change="toggleSelect(product.id)"
                />
              </td>
              <td>
                <NuxtLink :to="`/admin/products/${product.id}`" class="flex items-center gap-3 group">
                  <AdminProductThumb :src="product.image" :alt="product.name" :missing="product.photoMissing" class="w-11 h-11 rounded-lg" />
                  <div class="min-w-0">
                    <p class="font-medium truncate max-w-[340px] group-hover:text-olive group-hover:underline">{{ product.name }}</p>
                    <p class="text-xs text-stone-500 truncate">
                      <span class="font-mono">{{ product.sku || 'No SKU' }}</span>
                      <span v-if="product.brand"> · {{ product.brand }}</span>
                      <span v-if="product.photoMissing" class="text-amber-700"> · Needs a photo</span>
                      <span v-else-if="product.images?.length"> · {{ product.images.length + 1 }} photos</span>
                    </p>
                  </div>
                </NuxtLink>
              </td>
              <td class="text-stone-600 whitespace-nowrap">
                {{ categoryLabel(product.category) }}
                <span v-if="product.badge" class="adm-badge bg-gold/10 text-gold ml-1">{{ product.badge }}</span>
              </td>
              <td class="text-right whitespace-nowrap">
                <template v-if="product.sale_price">
                  <p class="font-medium">{{ formatMoney(product.sale_price) }}</p>
                  <p class="text-xs text-stone-400 line-through">{{ formatMoney(product.price) }}</p>
                </template>
                <p v-else class="font-medium">{{ formatMoney(product.price) }}</p>
              </td>
              <td>
                <div class="flex items-center gap-1.5">
                  <button type="button" class="adm-icon-btn w-7 h-7 border border-stone-200" :disabled="product.stock === 0 || savingStock.has(product.id)" aria-label="Decrease stock" @click="saveStock(product, product.stock - 1)">
                    <Icon name="mdi:minus" class="text-sm" />
                  </button>
                  <input
                    :value="product.stock"
                    type="number"
                    min="0"
                    inputmode="numeric"
                    :aria-label="`Stock for ${product.name}`"
                    class="w-14 h-7 text-center text-sm rounded-md border outline-none focus:border-olive focus:ring-2 focus:ring-olive/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    :class="product.stock === 0 ? 'border-red-200 bg-red-50 text-red-700' : product.stock <= LOW_STOCK_LIMIT ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-stone-200'"
                    :disabled="savingStock.has(product.id)"
                    @keydown.enter="$event.target.blur()"
                    @change="saveStock(product, Number($event.target.value), $event.target)"
                  />
                  <button type="button" class="adm-icon-btn w-7 h-7 border border-stone-200" :disabled="savingStock.has(product.id)" aria-label="Increase stock" @click="saveStock(product, product.stock + 1)">
                    <Icon name="mdi:plus" class="text-sm" />
                  </button>
                </div>
              </td>
              <td>
                <div class="flex items-center justify-end gap-0.5">
                  <a v-if="product.slug" :href="`/product/${product.slug}`" target="_blank" rel="noopener" class="adm-icon-btn" title="View in store" aria-label="View in store">
                    <Icon name="mdi:open-in-new" class="text-base" />
                  </a>
                  <NuxtLink :to="`/admin/products/${product.id}`" class="adm-icon-btn" title="Edit" aria-label="Edit">
                    <Icon name="mdi:pencil-outline" class="text-lg" />
                  </NuxtLink>
                  <button type="button" class="adm-icon-btn hover:!text-red-600 hover:!bg-red-50" title="Delete" aria-label="Delete" @click="handleDelete(product)">
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
useSeoMeta({ title: 'Products', robots: 'noindex' })

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
    toast.error('Stock must be a whole number, 0 or more')
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
    title: `Import ${file.name}?`,
    message: 'Products are matched by SKU. Existing products get the prices and stock from the file.',
    confirmLabel: 'Import',
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
  if (failed.length) toast.error(`${done} moved, ${failed.length} failed: ${adminErrorMessage(failed[0].reason)}`)
  else toast.show(`${done} product${done === 1 ? '' : 's'} moved to ${label}`)
}

async function bulkDelete() {
  const count = selectedIds.value.length
  const ok = await confirm({
    title: `Delete ${count} product${count === 1 ? '' : 's'}?`,
    message: "They'll be removed from the store. This can't be undone.",
    confirmLabel: 'Delete',
    danger: true,
  })
  if (!ok) return

  const { done, failed } = await runForSelected((id) => $fetch(`/api/admin/products/${id}`, { method: 'DELETE' }))
  if (failed.length) toast.error(`${done} deleted, ${failed.length} failed: ${adminErrorMessage(failed[0].reason)}`)
  else toast.show(`${done} product${done === 1 ? '' : 's'} deleted`)
}

async function handleDelete(product) {
  const ok = await confirm({
    title: `Delete “${product.name}”?`,
    message: "It'll be removed from the store. This can't be undone.",
    confirmLabel: 'Delete',
    danger: true,
  })
  if (!ok) return

  try {
    await $fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    toast.show('Product deleted')
    await refresh()
    refreshBadges()
  } catch (err) {
    toast.error(adminErrorMessage(err))
  }
}
</script>
