<template>
  <div>
    <AdminPageHeader
      :title="isNew ? $t('admin.editor.addTitle') : form.name || $t('admin.editor.editTitle')"
      :description="isNew ? $t('admin.editor.addHint') : $t('admin.editor.skuLine', { sku: form.sku || '—' })"
      back="/admin/products"
    >
      <a v-if="!isNew && product?.slug" :href="`/product/${product.slug}`" target="_blank" rel="noopener" class="adm-btn adm-btn-secondary">
        <Icon name="mdi:open-in-new" class="text-base" />
        {{ $t('admin.products.viewInStore') }}
      </a>
      <button v-if="!isNew" type="button" class="adm-btn adm-btn-danger-soft" :disabled="isSubmitting" @click="handleDelete">
        <Icon name="mdi:trash-can-outline" class="text-base" />
        {{ $t('admin.common.delete') }}
      </button>
      <button type="submit" form="product-form" class="adm-btn adm-btn-primary" :disabled="isSubmitting || uploadingCount > 0">
        <Icon :name="isSubmitting ? 'mdi:loading' : 'mdi:content-save-outline'" class="text-base" :class="{ 'animate-spin': isSubmitting }" />
        {{ isSubmitting ? $t('admin.common.saving') : isNew ? $t('admin.editor.addTitle') : $t('admin.common.save') }}
      </button>
    </AdminPageHeader>

    <div v-if="loadError" class="adm-card">
      <AdminEmptyState icon="mdi:package-variant-remove" :title="$t('admin.editor.notFound')" :description="$t('admin.editor.notFoundText')">
        <NuxtLink to="/admin/products" class="adm-btn adm-btn-secondary">{{ $t('admin.editor.backToProducts') }}</NuxtLink>
      </AdminEmptyState>
    </div>

    <form v-else id="product-form" class="grid lg:grid-cols-3 gap-6 items-start" @submit.prevent="handleSubmit">
      <div class="lg:col-span-2 space-y-6">
        <section class="adm-card">
          <div class="adm-card-header">
            <h2 class="adm-card-title">{{ $t('admin.editor.details') }}</h2>
            <!-- The original (mostly Arabic) text and its English version. -->
            <div class="inline-flex rounded-lg border border-stone-200 p-0.5 text-xs font-medium" role="tablist">
              <button
                v-for="tab in ['ar', 'en']"
                :key="tab"
                type="button"
                role="tab"
                :aria-selected="detailsLang === tab"
                class="px-3 py-1 rounded-md transition"
                :class="detailsLang === tab ? 'bg-olive text-white' : 'text-stone-600 hover:bg-stone-100'"
                @click="detailsLang = tab"
              >
                {{ tab === 'ar' ? $t('admin.editor.arabic') : $t('admin.editor.english') }}
              </button>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <template v-if="detailsLang === 'ar'">
              <div>
                <label for="product-name" class="adm-label">{{ $t('admin.editor.nameAr') }}</label>
                <input id="product-name" v-model="form.name" dir="auto" type="text" required maxlength="300" class="adm-input" />
              </div>
              <div>
                <label for="product-description" class="adm-label">{{ $t('admin.editor.description') }}</label>
                <textarea id="product-description" v-model="form.description" dir="auto" rows="5" class="adm-input"></textarea>
              </div>
              <div>
                <label for="product-usage" class="adm-label">{{ $t('admin.editor.usage') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
                <textarea id="product-usage" v-model="form.usageInfo" dir="auto" rows="4" class="adm-input"></textarea>
              </div>
            </template>
            <template v-else>
              <div>
                <label for="product-name-en" class="adm-label">{{ $t('admin.editor.nameEn') }}</label>
                <input id="product-name-en" v-model="form.nameEn" dir="ltr" type="text" maxlength="300" :placeholder="form.name" class="adm-input" />
                <p class="adm-hint">{{ $t('admin.editor.nameEnHint') }}</p>
              </div>
              <div>
                <label for="product-description-en" class="adm-label">{{ $t('admin.editor.description') }}</label>
                <textarea id="product-description-en" v-model="form.descriptionEn" dir="ltr" rows="5" class="adm-input"></textarea>
              </div>
              <div>
                <label for="product-usage-en" class="adm-label">{{ $t('admin.editor.usage') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
                <textarea id="product-usage-en" v-model="form.usageInfoEn" dir="ltr" rows="4" class="adm-input"></textarea>
              </div>
            </template>
            <div>
              <label for="product-brand" class="adm-label">{{ $t('admin.editor.brand') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
              <input id="product-brand" v-model="form.brand" dir="auto" type="text" :placeholder="$t('admin.editor.brandPlaceholder')" class="adm-input" />
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header">
            <div>
              <h2 class="adm-card-title">{{ $t('admin.editor.photos') }}</h2>
              <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.editor.photosHint') }}</p>
            </div>
            <span class="text-xs text-stone-500">{{ photos.length }} / {{ MAX_PHOTOS }}</span>
          </div>
          <div class="p-5">
            <p v-if="brokenCount" class="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 rounded-lg px-3 py-2 mb-4">
              <Icon name="mdi:image-off-outline" class="text-base shrink-0 mt-0.5" />
              {{ tc('admin.editor.brokenPhotos', brokenCount) }}
            </p>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <div
                v-for="(url, index) in photos"
                :key="url"
                class="group relative aspect-square rounded-lg border bg-stone-50 overflow-hidden"
                :class="index === 0 ? 'border-ink ring-2 ring-ink/15 col-span-2 row-span-2' : 'border-stone-200'"
              >
                <img
                  v-if="!brokenPhotos.has(url)"
                  :src="url"
                  :alt="`${form.name} ${index + 1}`"
                  class="w-full h-full object-cover"
                  @error="brokenPhotos.add(url)"
                />
                <div v-else class="w-full h-full flex flex-col items-center justify-center gap-1 text-stone-400 bg-amber-50/60 dark:bg-amber-500/10">
                  <Icon name="mdi:image-off-outline" class="text-2xl" />
                  <span class="text-[11px] font-medium text-amber-700 dark:text-amber-400">{{ $t('admin.editor.fileMissing') }}</span>
                </div>
                <span v-if="index === 0" class="absolute top-2 start-2 adm-badge bg-olive text-white">{{ $t('admin.editor.mainPhoto') }}</span>
                <div class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 p-1.5 bg-gradient-to-t from-black/50 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                  <button v-if="index > 0" type="button" class="photo-btn" :title="$t('admin.editor.moveLeft')" :aria-label="$t('admin.editor.moveLeft')" @click="movePhoto(index, -1)">
                    <Icon name="mdi:chevron-left" class="rtl:-scale-x-100" />
                  </button>
                  <button v-if="index > 0" type="button" class="photo-btn" :title="$t('admin.editor.makeMain')" :aria-label="$t('admin.editor.makeMain')" @click="makeMain(index)">
                    <Icon name="mdi:star-outline" />
                  </button>
                  <button v-if="index < photos.length - 1" type="button" class="photo-btn" :title="$t('admin.editor.moveRight')" :aria-label="$t('admin.editor.moveRight')" @click="movePhoto(index, 1)">
                    <Icon name="mdi:chevron-right" class="rtl:-scale-x-100" />
                  </button>
                  <button type="button" class="photo-btn hover:!bg-red-600" :title="$t('admin.editor.removePhoto')" :aria-label="$t('admin.editor.removePhoto')" @click="removePhoto(index)">
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
                  isDragging ? 'border-ink bg-ink/5 text-ink' : 'border-stone-300 hover:border-ink hover:text-ink',
                  photos.length === 0 ? 'col-span-2 row-span-2' : '',
                ]"
                @click="photoInput?.click()"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="onDrop"
              >
                <Icon name="mdi:image-plus-outline" class="text-2xl" />
                <span class="text-xs font-medium">{{ $t('admin.editor.addPhotos') }}</span>
                <span v-if="photos.length === 0" class="text-[11px] text-stone-400">{{ $t('admin.editor.dragHere') }}</span>
              </button>
            </div>
            <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple class="hidden" @change="onPickPhotos" />

            <details class="mt-4 text-sm">
              <summary class="cursor-pointer text-stone-500 hover:text-stone-800 select-none">{{ $t('admin.editor.addFromLink') }}</summary>
              <div class="flex gap-2 mt-2">
                <input id="photo-link" v-model="photoLink" type="url" dir="ltr" placeholder="https://…" class="adm-input" @keydown.enter.prevent="addPhotoLink" />
                <button type="button" class="adm-btn adm-btn-secondary" @click="addPhotoLink">{{ $t('admin.editor.add') }}</button>
              </div>
            </details>
          </div>
        </section>
      </div>

      <div class="space-y-6">
        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">{{ $t('admin.editor.pricing') }}</h2></div>
          <div class="p-5 space-y-4">
            <div>
              <label for="product-price" class="adm-label">{{ $t('admin.editor.price') }}</label>
              <div class="relative">
                <input id="product-price" v-model.number="form.price" type="number" required min="0.01" step="0.01" class="adm-input pe-12" />
                <span class="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{{ currency }}</span>
              </div>
            </div>
            <div>
              <label for="product-sale-price" class="adm-label">{{ $t('admin.editor.salePrice') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
              <div class="relative">
                <input id="product-sale-price" v-model.number="form.salePrice" type="number" min="0.01" step="0.01" class="adm-input pe-12" />
                <span class="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{{ currency }}</span>
              </div>
              <p v-if="discountPercent" class="adm-hint text-emerald-700 dark:text-emerald-400">{{ $t('admin.editor.percentOff', { percent: discountPercent }) }}</p>
              <p v-else-if="form.salePrice && form.price && form.salePrice >= form.price" class="adm-hint text-red-600 dark:text-red-400">{{ $t('admin.editor.saleTooHigh') }}</p>
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">{{ $t('admin.editor.inventory') }}</h2></div>
          <div class="p-5 space-y-4">
            <div>
              <label for="product-sku" class="adm-label">{{ $t('admin.editor.sku') }}</label>
              <input id="product-sku" v-model="form.sku" type="text" dir="ltr" maxlength="50" placeholder="4133" class="adm-input font-mono rtl:text-right" />
            </div>
            <div>
              <label for="product-stock" class="adm-label">{{ $t('admin.editor.stock') }}</label>
              <div class="flex items-center gap-2">
                <button type="button" class="adm-btn adm-btn-secondary w-10 px-0" :disabled="form.stock <= 0" :aria-label="$t('admin.products.decrease')" @click="form.stock = Math.max(0, (form.stock || 0) - 1)">
                  <Icon name="mdi:minus" />
                </button>
                <input id="product-stock" v-model.number="form.stock" type="number" required min="0" step="1" class="adm-input text-center" />
                <button type="button" class="adm-btn adm-btn-secondary w-10 px-0" :aria-label="$t('admin.products.increase')" @click="form.stock = (form.stock || 0) + 1">
                  <Icon name="mdi:plus" />
                </button>
              </div>
              <p v-if="form.stock === 0" class="adm-hint text-red-600 dark:text-red-400">{{ $t('admin.editor.outOfStock') }}</p>
              <p v-else-if="form.stock <= LOW_STOCK_LIMIT" class="adm-hint text-amber-700 dark:text-amber-400">{{ $t('admin.editor.lowStock') }}</p>
            </div>
          </div>
        </section>

        <section class="adm-card">
          <div class="adm-card-header"><h2 class="adm-card-title">{{ $t('admin.editor.organization') }}</h2></div>
          <div class="p-5 space-y-4">
            <div>
              <label for="product-category" class="adm-label">{{ $t('admin.editor.category') }}</label>
              <select id="product-category" v-model="form.category" required class="adm-input">
                <option value="" disabled>{{ $t('admin.editor.chooseCategory') }}</option>
                <option v-for="c in PRODUCT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div v-if="subcategoryOptions.length">
              <label for="product-subcategory" class="adm-label">{{ $t('admin.editor.subcategory') }}</label>
              <select id="product-subcategory" v-model="form.subcategory" class="adm-input">
                <option value="">{{ $t('admin.common.none') }}</option>
                <option v-for="s in subcategoryOptions" :key="s.value" :value="s.value">{{ subcategoryLabel(s) }}</option>
              </select>
            </div>
            <div>
              <label for="product-badge" class="adm-label">{{ $t('admin.editor.badge') }}</label>
              <select id="product-badge" v-model="form.badge" class="adm-input">
                <option value="">{{ $t('admin.common.none') }}</option>
                <option v-for="badge in ['Best Seller', 'New', 'Sale']" :key="badge" :value="badge">{{ $t(`admin.editor.badges.${badge}`) }}</option>
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
const { t, tc, isAr, subcategoryLabel } = useLang()
const isNew = computed(() => route.params.id === 'new')
const isSubmitting = ref(false)
const uploadingCount = ref(0)
const isDragging = ref(false)
const photoInput = ref(null)
const photoLink = ref('')
const product = ref(null)
const loadError = ref(false)
const detailsLang = ref('ar')
const currency = computed(() => (isAr.value ? 'ج.م' : 'EGP'))

useSeoMeta({ title: () => (isNew.value ? t('admin.editor.addTitle') : t('admin.editor.editTitle')), robots: 'noindex' })

const emptyForm = () => ({
  name: '',
  nameEn: '',
  brand: '',
  description: '',
  descriptionEn: '',
  usageInfo: '',
  usageInfoEn: '',
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
      nameEn: p.name_en ?? '',
      brand: p.brand ?? '',
      description: p.description ?? '',
      descriptionEn: p.description_en ?? '',
      usageInfo: p.usage_info ?? '',
      usageInfoEn: p.usage_info_en ?? '',
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
    return [...options, { value: form.value.subcategory, label: form.value.subcategory, labelAr: form.value.subcategory }]
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
    toast.error(t('admin.editor.linkInvalid'))
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
  if (images.length > room) toast.error(tc('admin.editor.roomLeft', room))

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
      toast.show(t('admin.editor.added'))
      await navigateTo(`/admin/products/${created.id}`, { replace: true })
    } else {
      const { product: saved } = await $fetch(`/api/admin/products/${route.params.id}`, { method: 'PATCH', body })
      product.value = saved
      snapshot.value = JSON.stringify([form.value, photos.value])
      toast.show(t('admin.editor.saved'))
    }
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete() {
  const ok = await confirm({
    title: t('admin.products.deleteTitle', { name: form.value.name }),
    message: t('admin.products.deleteText'),
    confirmLabel: t('admin.common.delete'),
    danger: true,
  })
  if (!ok) return

  isSubmitting.value = true
  try {
    await $fetch(`/api/admin/products/${route.params.id}`, { method: 'DELETE' })
    snapshot.value = JSON.stringify([form.value, photos.value])
    toast.show(t('admin.products.deleted'))
    await navigateTo('/admin/products')
  } catch (err) {
    toast.error(adminErrorMessage(err))
    isSubmitting.value = false
  }
}

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true
  return await confirm({
    title: t('admin.common.unsavedTitle'),
    message: t('admin.editor.leaveText'),
    confirmLabel: t('admin.common.leave'),
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
  @apply w-7 h-7 rounded-md bg-surface/90 text-stone-800 flex items-center justify-center text-base hover:bg-surface hover:text-stone-900 transition;
}
</style>
