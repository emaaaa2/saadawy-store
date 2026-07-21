<template>
  <div class="px-8 py-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-olive">Products</h1>
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/orders" class="text-sm text-olive/70 hover:text-gold transition">
          View Orders
        </NuxtLink>
        <NuxtLink
          to="/admin/products/new"
          class="bg-olive text-beige px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gold hover:text-olive transition"
        >
          + Add Product
        </NuxtLink>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="flex items-center bg-white border border-olive/15 rounded-full px-4 py-2.5 gap-2 flex-1">
        <Icon name="mdi:magnify" class="text-olive/40 text-lg shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by product name..."
          class="bg-transparent text-olive placeholder-olive/40 outline-none text-sm w-full"
        />
        <button
          v-if="searchQuery"
          class="text-olive/40 hover:text-olive transition shrink-0"
          aria-label="Clear search"
          @click="searchQuery = ''"
        >
          <Icon name="mdi:close-circle" class="text-lg" />
        </button>
      </div>

      <select
        v-model="selectedCategory"
        class="bg-white border border-olive/15 rounded-full px-4 py-2.5 text-sm text-olive outline-none focus:border-gold"
      >
        <option value="all">All Categories</option>
        <option value="skincare">Skincare</option>
        <option value="makeup">Makeup</option>
        <option value="haircare">Haircare</option>
        <option value="perfume">Perfume</option>
        <option value="bags">Bags</option>
        <option value="kitchen">Kitchen</option>
        <option value="hijab">Hijab</option>
        <option value="accessories">Accessories</option>
        <option value="uncategorized">Uncategorized</option>
      </select>
    </div>

    <p class="text-sm text-taupe mb-4">
      Showing {{ products.length }} of {{ totalCount }} products
    </p>

    <div v-if="selectedIds.length > 0" class="flex items-center gap-3 bg-olive text-beige rounded-2xl px-5 py-3 mb-4">
      <span class="text-sm font-medium">{{ selectedIds.length }} selected</span>

      <select
        class="text-sm bg-beige/10 border border-beige/20 rounded-full px-3 py-1.5 outline-none"
        @change="bulkUpdateCategory($event.target.value)"
      >
        <option value="">Change category to...</option>
        <option value="skincare">Skincare</option>
        <option value="makeup">Makeup</option>
        <option value="haircare">Haircare</option>
        <option value="perfume">Perfume</option>
        <option value="bags">Bags</option>
        <option value="kitchen">Kitchen</option>
        <option value="hijab">Hijab</option>
        <option value="accessories">Accessories</option>
      </select>

      <button
        class="text-sm font-medium text-red-300 hover:text-red-200 transition ml-auto"
        @click="bulkDelete"
      >
        Delete Selected
      </button>

      <button class="text-sm text-beige/60 hover:text-beige transition" @click="selectedIds = []">
        Cancel
      </button>
    </div>

    <div v-if="pending" class="text-center py-12 text-olive/50">Loading products...</div>

    <div v-else-if="products.length === 0" class="text-center py-12 text-olive/50">
      No products match your search.
    </div>

    <div v-else class="bg-white rounded-2xl overflow-hidden border border-olive/10">
      <div
        v-for="product in products"
        :key="product.id"
        class="flex items-center gap-4 p-4 border-b border-olive/10 last:border-0"
      >
        <input
          type="checkbox"
          :checked="selectedIds.includes(product.id)"
          class="w-4 h-4 accent-olive shrink-0"
          @change="toggleSelect(product.id)"
        />

        <div class="w-14 h-14 rounded-lg bg-champagne shrink-0 flex items-center justify-center overflow-hidden">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <Icon v-else name="mdi:image-outline" class="text-xl text-olive/30" />
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-medium text-olive truncate">{{ product.name }}</p>
          <p class="text-sm text-taupe capitalize">{{ product.category }}</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            class="w-7 h-7 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive/5 transition"
            :disabled="product.stock === 0"
            @click="adjustStock(product, -1)"
          >
            <Icon name="mdi:minus" class="text-xs text-olive" />
          </button>
          <span class="w-8 text-center text-sm font-medium" :class="product.stock === 0 ? 'text-red-500' : 'text-olive'">
            {{ product.stock }}
          </span>
          <button
            class="w-7 h-7 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive/5 transition"
            @click="adjustStock(product, 1)"
          >
            <Icon name="mdi:plus" class="text-xs text-olive" />
          </button>
        </div>

        <p class="font-bold text-olive text-sm shrink-0">EGP {{ product.sale_price ?? product.price }}</p>

        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink
            :to="`/admin/products/${product.id}`"
            class="w-9 h-9 rounded-full bg-olive/5 flex items-center justify-center hover:bg-gold/20 transition"
            aria-label="Edit"
          >
            <Icon name="mdi:pencil-outline" class="text-olive text-lg" />
          </NuxtLink>
          <button
            class="w-9 h-9 rounded-full bg-olive/5 flex items-center justify-center hover:bg-red-100 transition"
            aria-label="Delete"
            @click="handleDelete(product)"
          >
            <Icon name="mdi:trash-can-outline" class="text-red-500 text-lg" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button
        :disabled="currentPage === 1"
        class="px-4 py-2 rounded-full text-sm border border-olive/20 disabled:opacity-30 hover:bg-olive/5 transition"
        @click="currentPage--"
      >
        Previous
      </button>
      <span class="text-sm text-olive/70">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        class="px-4 py-2 rounded-full text-sm border border-olive/20 disabled:opacity-30 hover:bg-olive/5 transition"
        @click="currentPage++"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const currentPage = ref(1)
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedIds = ref([])

const { data, pending, refresh } = await useFetch('/api/admin/products', {
  query: {
    page: currentPage,
    search: searchQuery,
    category: selectedCategory
  },
  watch: [currentPage, searchQuery, selectedCategory]
})

const products = computed(() => data.value?.products ?? [])
const totalPages = computed(() => data.value?.totalPages ?? 1)
const totalCount = computed(() => data.value?.total ?? 0)

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

async function bulkUpdateCategory(newCategory) {
  if (!newCategory) return

  await Promise.all(
    selectedIds.value.map((id) =>
      $fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        body: { category: newCategory }
      })
    )
  )

  selectedIds.value = []
  refresh()
}

async function bulkDelete() {
  const confirmed = confirm(`Delete ${selectedIds.value.length} products? This cannot be undone.`)
  if (!confirmed) return

  await Promise.all(
    selectedIds.value.map((id) => $fetch(`/api/admin/products/${id}`, { method: 'DELETE' }))
  )

  selectedIds.value = []
  refresh()
}

async function adjustStock(product, delta) {
  const newStock = Math.max(0, product.stock + delta)

  await $fetch(`/api/admin/products/${product.id}`, {
    method: 'PATCH',
    body: { stock: newStock }
  })

  await refresh()
}

async function handleDelete(product) {
  const confirmed = confirm(`Delete "${product.name}"? This cannot be undone.`)
  if (!confirmed) return

  await $fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
  refresh()
}
</script>