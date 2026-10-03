<template>
  <div>
    <AdminPageHeader
      :title="isNew ? 'Add product' : form.name || 'Edit product'"
      :description="isNew ? 'Fill in the details, add photos, then save.' : `SKU ${form.sku || '—'}`"
      back="/admin/products"
    >
      <a v-if="!isNew && product?.slug" :href="`/product/${product.slug}`" target="_blank" rel="noopener" class="adm-btn adm-btn-secondary">
        <Icon name="mdi:open-in-new" class="text-base" />
        View in store
      </a>
      <button v-if="!isNew" type="button" class="adm-btn adm-btn-danger-soft" :disabled="isSubmitting" @click="handleDelete">
        <Icon name="mdi:trash-can-outline" class="text-base" />
        Delete
      </button>
      <button type="submit" form="product-form" class="adm-btn adm-btn-primary" :disabled="isSubmitting || uploadingCount > 0">
        <Icon :name="isSubmitting ? 'mdi:loading' : 'mdi:content-save-outline'" class="text-base" :class="{ 'animate-spin': isSubmitting }" />
        {{ isSubmitting ? 'Saving…' : isNew ? 'Add product' : 'Save changes' }}
      </button>
    </AdminPageHeader>

    <div v-if="loadError" class="adm-card">
      <AdminEmptyState icon="mdi:package-variant-remove" title="Product not found" description="It may have been deleted.">
        <NuxtLink to="/admin/products" class="adm-btn adm-btn-secondary">Back to products</NuxtLink>
      </AdminEmptyState>
    </div>

    <form v-else id="product-form" class="grid lg:grid-cols-3 gap-6 items-start" @submit.prevent="handleSubmit">
      <div class="lg:col-span-2 space-y-6">
        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">Details</h2></div>
          <div class="p-5 space-y-4">
            <div>
              <label for="product-name" class="adm-label">Name</label>
              <input id="product-name" dir="auto" v-model="form.name" type="text" required maxlength="300" class="adm-input" />
            </div>
            <div>
              <label for="product-brand" class="adm-label">Brand <span class="text-stone-400 font-normal">(optional)</span></label>
              <input id="product-brand" dir="auto" v-model="form.brand" type="text" placeholder="e.g. Dove" class="adm-input" />
            </div>
            <div>
              <label for="product-description" class="adm-label">Description</label>
              <textarea id="product-description" dir="auto" v-model="form.description" rows="5" class="adm-input"></textarea>
            </div>
            <div>
              <label for="product-usage" class="adm-label">Ingredients / how to use <span class="text-stone-400 font-normal">(optional)</span></label>
              <textarea id="product-usage" dir="auto" v-model="form.usageInfo" rows="4" class="adm-input"></textarea>
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header">
            <div>
              <h2 class="adm-card-title">Photos</h2>
              <p class="text-xs text-stone-500 mt-0.5">The first photo is the main one. Customers can scroll through the rest.</p>
            </div>
            <span class="text-xs text-stone-500">{{ photos.length }} / {{ MAX_PHOTOS }}</span>
          </div>
          <div class="p-5">
            <p v-if="brokenCount" class="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              <Icon name="mdi:image-off-outline" class="text-base shrink-0 mt-0.5" />
              {{ brokenCount === 1 ? "1 photo's file can't be found" : `${brokenCount} photos' files can't be found` }}.
              Remove {{ brokenCount === 1 ? 'it' : 'them' }} and upload new ones.
            </p>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <div
                v-for="(url, index) in photos"
                :key="url"
                class="group relative aspect-square rounded-lg border bg-stone-50 overflow-hidden"
                :class="index === 0 ? 'border-olive ring-2 ring-olive/15 col-span-2 row-span-2' : 'border-stone-200'"
              >
                <img
                  v-if="!brokenPhotos.has(url)"
                  :src="url"
                  :alt="`Photo ${index + 1}`"
                  class="w-full h-full object-cover"
                  @error="brokenPhotos.add(url)"
                />
                <div v-else class="w-full h-full flex flex-col items-center justify-center gap-1 text-stone-400 bg-amber-50/60">
                  <Icon name="mdi:image-off-outline" class="text-2xl" />
                  <span class="text-[11px] font-medium text-amber-700">File missing</span>
                </div>
                <span v-if="index === 0" class="absolute top-2 left-2 adm-badge bg-olive text-white">Main photo</span>
                <div class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 p-1.5 bg-gradient-to-t from-black/50 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                  <button v-if="index > 0" type="button" class="photo-btn" title="Move left" aria-label="Move left" @click="movePhoto(index, -1)">
                    <Icon name="mdi:chevron-left" />
                  </button>
                  <button v-if="index > 0" type="button" class="photo-btn" title="Make main photo" aria-label="Make main photo" @click="makeMain(index)">
                    <Icon name="mdi:star-outline" />
                  </button>
                  <button v-if="index < photos.length - 1" type="button" class="photo-btn" title="Move right" aria-label="Move right" @click="movePhoto(index, 1)">
                    <Icon name="mdi:chevron-right" />
                  </button>
                  <button type="button" class="photo-btn hover:!bg-red-600" title="Remove" aria-label="Remove photo" @click="removePhoto(index)">
                    <Icon name="mdi:trash-can-outline" />
                  </button>
                </div>
              </div>

              <div
                v-for="n in uploadingCount"
                :key="`uploading-${n}`"
                class="aspect-square rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center"
              >
                <Icon name="mdi:loading" class="text-2xl text-stone-400 animate-spin" />
              </div>

              <button
                v-if="photos.length + uploadingCount < MAX_PHOTOS"
                type="button"
                class="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-stone-500 transition"
                :class="[
                  isDragging ? 'border-olive bg-olive/5 text-olive' : 'border-stone-300 hover:border-olive hover:text-olive',
                  photos.length === 0 ? 'col-span-2 row-span-2' : '',
                ]"
                @click="photoInput?.click()"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="onDrop"
              >
                <Icon name="mdi:image-plus-outline" class="text-2xl" />
                <span class="text-xs font-medium">Add photos</span>
                <span v-if="photos.length === 0" class="text-[11px] text-stone-400">or drag them here</span>
              </button>
            </div>
            <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple class="hidden" @change="onPickPhotos" />

            <details class="mt-4 text-sm">
              <summary class="cursor-pointer text-stone-500 hover:text-stone-800 select-none">Add a photo from a link</summary>
              <div class="flex gap-2 mt-2">
                <input id="photo-link" v-model="photoLink" type="url" placeholder="https://…" class="adm-input" @keydown.enter.prevent="addPhotoLink" />
                <button type="button" class="adm-btn adm-btn-secondary" @click="addPhotoLink">Add</button>
              </div>
            </details>
          </div>
        </section>
      </div>

      <div class="space-y-6">
        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">Pricing</h2></div>
          <div class="p-5 space-y-4">
            <div>
              <label for="product-price" class="adm-label">Price</label>
              <div class="relative">
                <input id="product-price" v-model.number="form.price" type="number" required min="0.01" step="0.01" class="adm-input pr-12" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">EGP</span>
              </div>
            </div>
            <div>
              <label for="product-sale-price" class="adm-label">Sale price <span class="text-stone-400 font-normal">(optional)</span></label>
              <div class="relative">
                <input id="product-sale-price" v-model.number="form.salePrice" type="number" min="0.01" step="0.01" class="adm-input pr-12" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">EGP</span>
              </div>
              <p v-if="discountPercent" class="adm-hint text-emerald-700">{{ discountPercent }}% off</p>
              <p v-else-if="form.salePrice && form.price && form.salePrice >= form.price" class="adm-hint text-red-600">Must be lower than the price</p>
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">Inventory</h2></div>
          <div class="p-5 space-y-4">
            <div>
              <label for="product-sku" class="adm-label">SKU</label>
              <input id="product-sku" v-model="form.sku" type="text" maxlength="50" placeholder="e.g. 4133" class="adm-input font-mono" />
            </div>
            <div>
              <label for="product-stock" class="adm-label">Stock</label>
              <div class="flex items-center gap-2">
                <button type="button" class="adm-btn adm-btn-secondary w-10 px-0" :disabled="form.stock <= 0" aria-label="Decrease stock" @click="form.stock = Math.max(0, (form.stock || 0) - 1)">
                  <Icon name="mdi:minus" />
                </button>
                <input id="product-stock" v-model.number="form.stock" type="number" required min="0" step="1" class="adm-input text-center" />
                <button type="button" class="adm-btn adm-btn-secondary w-10 px-0" aria-label="Increase stock" @click="form.stock = (form.stock || 0) + 1">
                  <Icon name="mdi:plus" />
                </button>
              </div>
              <p v-if="form.stock === 0" class="adm-hint text-red-600">Out of stock — customers can't order it.</p>
              <p v-else-if="form.stock <= LOW_STOCK_LIMIT" class="adm-hint text-amber-700">Low stock</p>
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">Organization</h2></div>
          <div class="p-5 space-y-4">
            <div>
              <label for="product-category" class="adm-label">Category</label>
              <select id="product-category" v-model="form.category" required class="adm-input">
                <option value="" disabled>Choose a category</option>
                <option v-for="c in PRODUCT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div v-if="subcategoryOptions.length">
              <label for="product-subcategory" class="adm-label">Subcategory</label>
              <select id="product-subcategory" v-model="form.subcategory" class="adm-input">
                <option value="">None</option>
                <option v-for="s in subcategoryOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
            <div>
              <label for="product-badge" class="adm-label">Badge</label>
              <select id="product-badge" v-model="form.badge" class="adm-input">
                <option value="">None</option>
                <option value="Best Seller">Best Seller</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'products'
})

const MAX_PHOTOS = 21
const route = useRoute()
const toast = useToastStore()
const { confirm } = useAdminConfirm()
const isNew = computed(() => route.params.id === 'new')
const isSubmitting = ref(false)
const uploadingCount = ref(0)
const isDragging = ref(false)
const photoInput = ref(null)
const photoLink = ref('')
const product = ref(null)
const loadError = ref(false)

useSeoMeta({ title: () => (isNew.value ? 'Add product' : 'Edit product'), robots: 'noindex' })

const emptyForm = () => ({
  name: '',
  brand: '',
  description: '',
  usageInfo: '',
  price: null,
  salePrice: null,
  sku: '',
  stock: 0,
  category: '',
  subcategory: '',
  badge: '',
})

const form = ref(emptyForm())
const photos = ref([])
// Photo links whose file doesn't exist in storage (from the server, or failed to load here).
const brokenPhotos = reactive(new Set())
const brokenCount = computed(() => photos.value.filter((url) => brokenPhotos.has(url)).length)

if (!isNew.value) {
  const { data, error } = await useFetch(`/api/admin/products/${route.params.id}`)
  if (error.value || !data.value?.product) {
    loadError.value = true
  } else {
    const p = data.value.product
    product.value = p
    form.value = {
      name: p.name ?? '',
      brand: p.brand ?? '',
      description: p.description ?? '',
      usageInfo: p.usage_info ?? '',
      price: p.price,
      salePrice: p.sale_price,
      sku: p.sku ?? '',
      stock: p.stock ?? 0,
      category: p.category ?? '',
      subcategory: p.subcategory ?? '',
      badge: p.badge ?? '',
    }
    photos.value = [...new Set([p.image, ...(p.images ?? [])].filter(Boolean))]
    for (const url of data.value.missingPhotos ?? []) brokenPhotos.add(url)
  }
}

const snapshot = ref(JSON.stringify([form.value, photos.value]))
const isDirty = computed(() => JSON.stringify([form.value, photos.value]) !== snapshot.value)

const subcategoryOptions = computed(() => {
  const options = categorySubcategories[form.value.category] ?? []
  // Keep an existing value visible even if it's not in today's list.
  if (form.value.subcategory && !options.some((o) => o.value === form.value.subcategory)) {
    return [...options, { value: form.value.subcategory, label: form.value.subcategory }]
  }
  return options
})

watch(() => form.value.category, (category, previous) => {
  if (previous && category !== previous) form.value.subcategory = ''
})

const discountPercent = computed(() => {
  const { price, salePrice } = form.value
  if (!price || !salePrice || salePrice >= price) return 0
  return Math.round((1 - salePrice / price) * 100)
})

function movePhoto(index, step) {
  const list = [...photos.value]
  const [item] = list.splice(index, 1)
  list.splice(index + step, 0, item)
  photos.value = list
}

function makeMain(index) {
  const list = [...photos.value]
  const [item] = list.splice(index, 1)
  photos.value = [item, ...list]
}

function removePhoto(index) {
  photos.value = photos.value.filter((_, i) => i !== index)
}

function addPhotoLink() {
  const url = photoLink.value.trim()
  if (!/^https:\/\/\S+$/.test(url)) {
    toast.error('Paste a link that starts with https://')
    return
  }
  if (!photos.value.includes(url)) photos.value = [...photos.value, url]
  photoLink.value = ''
}

// Shrinks big phone photos before upload so they stay fast and under the size limit.
async function prepareImage(file) {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const webp = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.88))
    if (webp?.type === 'image/webp') return webp
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  } catch {
    return file
  }
}

async function uploadFiles(files) {
  const images = [...files].filter((file) => file.type.startsWith('image/'))
  const room = MAX_PHOTOS - photos.value.length - uploadingCount.value
  if (images.length > room) toast.error(`Only ${room} more photo${room === 1 ? '' : 's'} can be added`)

  await Promise.all(images.slice(0, Math.max(room, 0)).map(async (file) => {
    uploadingCount.value++
    try {
      const blob = await prepareImage(file)
      const body = new FormData()
      body.append('file', blob, file.name)
      body.append('sku', form.value.sku || '')
      const { url } = await $fetch('/api/admin/products/upload-image', { method: 'POST', body })
      photos.value = [...photos.value, url]
    } catch (err) {
      toast.error(`${file.name}: ${adminErrorMessage(err)}`)
    } finally {
      uploadingCount.value--
    }
  }))
}

function onPickPhotos(event) {
  uploadFiles(event.target.files)
  event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  uploadFiles(event.dataTransfer.files)
}

async function handleSubmit() {
  isSubmitting.value = true
  const body = {
    ...form.value,
    salePrice: form.value.salePrice || null,
    image: photos.value[0] ?? null,
    images: photos.value.slice(1),
  }

  try {
    if (isNew.value) {
      const { product: created } = await $fetch('/api/admin/products', { method: 'POST', body })
      snapshot.value = JSON.stringify([form.value, photos.value])
      toast.show('Product added')
      await navigateTo(`/admin/products/${created.id}`, { replace: true })
    } else {
      const { product: saved } = await $fetch(`/api/admin/products/${route.params.id}`, { method: 'PATCH', body })
      product.value = saved
      snapshot.value = JSON.stringify([form.value, photos.value])
      toast.show('Changes saved')
    }
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete() {
  const ok = await confirm({
    title: `Delete “${form.value.name}”?`,
    message: "It'll be removed from the store. This can't be undone.",
    confirmLabel: 'Delete',
    danger: true,
  })
  if (!ok) return

  isSubmitting.value = true
  try {
    await $fetch(`/api/admin/products/${route.params.id}`, { method: 'DELETE' })
    snapshot.value = JSON.stringify([form.value, photos.value])
    toast.show('Product deleted')
    await navigateTo('/admin/products')
  } catch (err) {
    toast.error(adminErrorMessage(err))
    isSubmitting.value = false
  }
}

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true
  return await confirm({
    title: 'Leave without saving?',
    message: 'Your changes to this product will be lost.',
    confirmLabel: 'Leave',
    danger: true,
  })
})

function warnBeforeUnload(event) {
  if (isDirty.value) event.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', warnBeforeUnload))
onUnmounted(() => window.removeEventListener('beforeunload', warnBeforeUnload))
</script>

<style scoped>
.photo-btn {
  @apply w-7 h-7 rounded-md bg-white/90 text-stone-800 flex items-center justify-center text-base hover:bg-white hover:text-stone-900 transition;
}
</style>
