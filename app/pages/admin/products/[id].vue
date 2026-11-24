<template>
  <div>
    <AdminPageHeader
      :title="isNew ? $t('admin.editor.addTitle') : form.name || $t('admin.editor.editTitle')"
      :description="isNew ? $t('admin.editor.addHint') : $t('admin.editor.skuLine', { sku: form.sku || '—' })"
      :back="listPath"
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
            <p v-if="hiddenFromStore" class="flex items-start gap-2 text-sm text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 rounded-lg px-3 py-2 mb-4">
              <Icon name="mdi:eye-off-outline" class="text-base shrink-0 mt-0.5" />
              {{ $t('admin.editor.hiddenNoPhoto') }}
            </p>
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

        <!-- Colours / shades under this code: each with its own stock (and an optional swatch and photo). -->
        <section class="adm-card">
          <div class="adm-card-header">
            <div>
              <h2 class="adm-card-title">{{ $t('admin.editor.variants.title') }}</h2>
              <p class="text-xs text-stone-500 mt-0.5">{{ $t('admin.editor.variants.hint') }}</p>
            </div>
            <span v-if="variants.length" class="adm-badge bg-stone-100 text-stone-700 shrink-0">{{ $t('admin.editor.variants.total', { count: variantsTotal }) }}</span>
          </div>

          <div v-if="variants.length" class="divide-y divide-stone-200">
            <div v-for="(v, index) in variants" :key="v.key" class="px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <label
                    class="block w-10 h-10 rounded-full border border-stone-300 cursor-pointer overflow-hidden"
                    :class="{ 'no-color': !v.color }"
                    :style="v.color ? { backgroundColor: v.color } : {}"
                    :title="$t('admin.editor.variants.color')"
                  >
                    <input type="color" class="opacity-0 w-full h-full cursor-pointer" :value="v.color || '#d4a5a5'" :aria-label="$t('admin.editor.variants.color')" @input="v.color = $event.target.value" />
                  </label>
                  <button v-if="v.color" type="button" class="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-surface border border-stone-300 text-stone-500 flex items-center justify-center" :aria-label="$t('admin.editor.variants.clearColor')" @click="v.color = ''">
                    <Icon name="mdi:close" class="text-[10px]" />
                  </button>
                </div>

                <div class="relative">
                  <button
                    type="button"
                    class="w-10 h-10 rounded-lg border border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center"
                    :title="$t('admin.editor.variants.photo')"
                    :aria-label="$t('admin.editor.variants.photo')"
                    @click="photoPickerFor = photoPickerFor === v.key ? null : v.key"
                  >
                    <img v-if="v.image" :src="v.image" alt="" class="w-full h-full object-cover" />
                    <Icon v-else name="mdi:image-plus-outline" class="text-lg text-stone-400" />
                  </button>
                  <div v-if="photoPickerFor === v.key" class="absolute z-20 top-full mt-1 start-0 w-64 adm-card p-2 shadow-lg">
                    <p class="text-xs text-stone-500 px-1 pb-2">{{ $t('admin.editor.variants.choosePhoto') }}</p>
                    <div v-if="photos.length" class="grid grid-cols-4 gap-1.5">
                      <button type="button" class="aspect-square rounded-md border border-stone-200 text-[10px] text-stone-500 flex items-center justify-center" @click="v.image = ''; photoPickerFor = null">
                        {{ $t('admin.editor.variants.noPhoto') }}
                      </button>
                      <button
                        v-for="url in photos"
                        :key="url"
                        type="button"
                        class="aspect-square rounded-md overflow-hidden border-2"
                        :class="v.image === url ? 'border-olive' : 'border-transparent'"
                        @click="v.image = url; photoPickerFor = null"
                      >
                        <img :src="url" alt="" class="w-full h-full object-cover" />
                      </button>
                    </div>
                    <p v-else class="text-xs text-stone-500 px-1">{{ $t('admin.editor.variants.noPhotos') }}</p>
                  </div>
                </div>
              </div>

              <input
                v-model="v.name"
                type="text"
                dir="rtl"
                required
                maxlength="60"
                class="adm-input flex-1 min-w-[7rem]"
                :placeholder="$t('admin.editor.variants.nameAr')"
                :aria-label="$t('admin.editor.variants.nameAr')"
              />
              <input
                v-model="v.nameEn"
                type="text"
                dir="ltr"
                maxlength="60"
                class="adm-input flex-1 min-w-[7rem]"
                :placeholder="$t('admin.editor.variants.nameEn')"
                :aria-label="$t('admin.editor.variants.nameEn')"
              />

              <div class="flex items-center gap-1.5">
                <button type="button" class="adm-btn adm-btn-secondary w-9 px-0" :disabled="v.stock <= 0" :aria-label="$t('admin.products.decrease')" @click="v.stock = Math.max(0, (v.stock || 0) - 1)">
                  <Icon name="mdi:minus" />
                </button>
                <input
                  v-model.number="v.stock"
                  type="number"
                  required
                  min="0"
                  step="1"
                  class="adm-input w-16 text-center"
                  :class="v.stock === 0 ? '!border-red-300 bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400' : v.stock <= LOW_STOCK_LIMIT ? '!border-amber-300 bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300' : ''"
                  :title="v.stock === 0 ? $t('admin.editor.variants.soldOut') : v.stock <= LOW_STOCK_LIMIT ? $t('admin.editor.variants.low') : ''"
                  :aria-label="$t('admin.editor.variants.stock')"
                />
                <button type="button" class="adm-btn adm-btn-secondary w-9 px-0" :aria-label="$t('admin.products.increase')" @click="v.stock = (v.stock || 0) + 1">
                  <Icon name="mdi:plus" />
                </button>
              </div>

              <button type="button" class="adm-icon-btn hover:text-red-600 ms-auto" :aria-label="$t('admin.editor.variants.remove')" :title="$t('admin.editor.variants.remove')" @click="removeVariant(index)">
                <Icon name="mdi:trash-can-outline" class="text-lg" />
              </button>
            </div>
          </div>

          <div class="px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3" :class="{ 'border-t border-stone-200': variants.length }">
            <button type="button" class="adm-btn adm-btn-secondary" @click="addVariant">
              <Icon name="mdi:plus" class="text-base" />
              {{ $t('admin.editor.variants.add') }}
            </button>
            <p class="text-xs text-stone-500">{{ variants.length ? $t('admin.editor.variants.fromColors') : $t('admin.editor.variants.firstNote') }}</p>
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
              <label for="product-discount" class="adm-label">{{ $t('admin.editor.discountPercent') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
              <div class="relative">
                <input
                  id="product-discount"
                  :value="discountInput"
                  type="number"
                  min="0"
                  max="99"
                  step="0.5"
                  inputmode="decimal"
                  :disabled="!form.price"
                  class="adm-input pe-10"
                  @input="setDiscount($event.target.value)"
                />
                <span class="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">%</span>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <button
                  v-for="percent in QUICK_DISCOUNTS"
                  :key="percent"
                  type="button"
                  :disabled="!form.price"
                  class="adm-btn adm-btn-sm"
                  :class="discountPercent === percent ? 'adm-btn-primary' : 'adm-btn-secondary'"
                  @click="setDiscount(String(percent))"
                >{{ percent }}%</button>
                <button v-if="form.salePrice" type="button" class="adm-btn adm-btn-sm adm-btn-secondary" @click="setDiscount('')">{{ $t('admin.editor.noDiscount') }}</button>
              </div>
              <p v-if="!form.price" class="adm-hint">{{ $t('admin.editor.discountNeedsPrice') }}</p>
            </div>
            <div>
              <label for="product-sale-price" class="adm-label">{{ $t('admin.editor.salePrice') }} <span class="text-stone-400 font-normal">{{ $t('admin.common.optional') }}</span></label>
              <div class="relative">
                <input id="product-sale-price" v-model.number="form.salePrice" type="number" min="0.01" step="0.01" class="adm-input pe-12" @input="discountTyped = false" />
                <span class="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{{ currency }}</span>
              </div>
              <p v-if="discountPercent" class="adm-hint text-emerald-700 dark:text-emerald-400">
                {{ $t('admin.editor.percentOff', { percent: discountPercent }) }} · {{ $t('admin.editor.customerSaves', { amount: formatMoney(form.price - form.salePrice) }) }}
              </p>
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
            <div v-if="variants.length">
              <p class="adm-label">{{ $t('admin.editor.stock') }}</p>
              <p class="text-2xl font-semibold text-stone-800">{{ variantsTotal }}</p>
              <p class="adm-hint">{{ $t('admin.editor.variants.fromColors') }}</p>
            </div>
            <div v-else>
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
const router = useRouter()
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
// The store hides products without a working main photo (server/utils/storeVisibility.ts).
const hiddenFromStore = computed(() => !photos.value.length || brokenPhotos.has(photos.value[0]))

// Colours / shades (product_variants). `key` only tells the rows apart on this page.
let variantKey = 0
const variantFromRow = (v) => ({ key: ++variantKey, id: v.id ?? null, name: v.name ?? '', nameEn: v.name_en ?? '', color: v.color ?? '', image: v.image ?? '', stock: v.stock ?? 0 })
const variants = ref([])
const savedVariants = ref([]) // as loaded or last saved: their stock is checked against the database on save
const photoPickerFor = ref(null)
const variantsTotal = computed(() => variants.value.reduce((sum, v) => sum + (Number(v.stock) || 0), 0))
const toPayload = (list) => list.map((v) => ({ id: v.id || undefined, name: v.name, nameEn: v.nameEn, color: v.color, image: v.image, stock: Number(v.stock) || 0 }))
const variantsPayload = () => toPayload(variants.value)

function addVariant() {
  variants.value.push(variantFromRow({}))
}

function removeVariant(index) {
  variants.value.splice(index, 1)
}

function formFromProduct(p) {
  return {
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
}

if (!isNew.value) {
  const { data, error } = await useFetch(`/api/admin/products/${route.params.id}`)
  if (error.value || !data.value?.product) {
    loadError.value = true
  } else {
    const p = data.value.product
    product.value = p
    form.value = formFromProduct(p)
    photos.value = [...new Set([p.image, ...(p.images ?? [])].filter(Boolean))]
    for (const url of data.value.missingPhotos ?? []) brokenPhotos.add(url)
    savedVariants.value = data.value.variants ?? []
    variants.value = savedVariants.value.map(variantFromRow)
  }
}

// Everything the page can save, to tell whether there are unsaved changes.
const pageState = () => JSON.stringify([form.value, photos.value, variantsPayload()])
const snapshot = ref(pageState())
const isDirty = computed(() => pageState() !== snapshot.value)
const variantsChanged = () => JSON.stringify(variantsPayload()) !== JSON.stringify(toPayload(savedVariants.value.map(variantFromRow)))

const subcategoriesOf = useSubcategories()
const subcategoryOptions = computed(() => {
  const options = subcategoriesOf(form.value.category)
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

// Discount calculator: typing a percentage (or tapping one) fills in the sale price, rounded to the
// nearest pound; typing a sale price shows its percentage. If the percentage was typed last, changing
// the price keeps that percentage and works the sale price out again.
const QUICK_DISCOUNTS = [10, 15, 20, 25, 30, 50]
const discountInput = ref('')
const discountTyped = ref(false)

function salePriceFor(percent) {
  const price = Number(form.value.price)
  if (!price || !(percent > 0) || percent >= 100) return null
  const sale = Math.round(price * (1 - percent / 100))
  return sale >= 1 && sale < price ? sale : Math.round(price * (1 - percent / 100) * 100) / 100
}

function setDiscount(value) {
  discountInput.value = value
  discountTyped.value = value !== ''
  form.value.salePrice = value === '' ? null : salePriceFor(Number(value))
}

const showSalePercent = () => { discountInput.value = discountPercent.value ? String(discountPercent.value) : '' }
// The product loaded, was saved or its changes were discarded: start again from its own sale price.
// (Registered first so it runs before the two below.)
watch(form, () => { discountTyped.value = false })
watch(() => form.value.price, () => {
  if (discountTyped.value && discountInput.value !== '') form.value.salePrice = salePriceFor(Number(discountInput.value))
  else showSalePercent()
})
watch(() => form.value.salePrice, () => {
  if (!discountTyped.value) showSalePercent()
}, { immediate: true })

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
  // A path on this computer (C:\…, file:///…) only exists here; customers could never load it.
  // Point to the upload button instead, and open the file picker right away.
  if (/^[a-z]:[\\/]|^\\\\|^file:|^\/(Users|home|storage|sdcard)\//i.test(url)) {
    toast.error(t('admin.editor.linkIsLocalFile'))
    photoInput.value?.click()
    return
  }
  if (/^http:\/\//i.test(url)) {
    toast.error(t('admin.editor.linkNotSecure'))
    return
  }
  if (!/^https:\/\/\S+$/.test(url)) {
    toast.error(t('admin.editor.linkInvalid'))
    return
  }
  addPhoto(url)
  photoLink.value = ''
}

// Products still waiting for a photo have a link to a file that doesn't exist as their main photo.
// The first real photo added takes over as main (missing ones are dropped), so the product shows
// on the store as soon as it's saved.
function addPhoto(url) {
  const list = photos.value.filter((u) => u !== url)
  photos.value = list.length && brokenPhotos.has(list[0])
    ? [url, ...list.filter((u) => !brokenPhotos.has(u))]
    : [...list, url]
}

async function uploadFiles(files) {
  const images = [...files].filter((file) => file.type.startsWith('image/'))
  const room = MAX_PHOTOS - photos.value.length - uploadingCount.value
  if (images.length > room) toast.error(tc('admin.editor.roomLeft', room))

  await Promise.all(images.slice(0, Math.max(room, 0)).map(async (file) => {
    uploadingCount.value++
    try {
      const blob = await shrinkImage(file)
      const body = new FormData()
      body.append('file', blob, file.name)
      body.append('sku', form.value.sku || '')
      const { url } = await $fetch('/api/admin/products/upload-image', { method: 'POST', body })
      addPhoto(url)
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

// For an existing product, only the fields that were changed are sent, together with the values
// they had when the page opened. The server refuses the save if one of those changed meanwhile
// (an order took stock, or another admin saved), instead of silently undoing that change.
function changesSinceLoad() {
  const saved = formFromProduct(product.value)
  const same = (a, b) => (a ?? '') === (b ?? '') || (a !== '' && b !== '' && Number(a) === Number(b))
  const changes = {}
  const original = {}
  for (const key of Object.keys(form.value)) {
    // With colours, stock is saved per colour (saveVariants).
    if (key === 'stock' && (variants.value.length || savedVariants.value.length)) continue
    if (same(form.value[key], saved[key])) continue
    changes[key] = key === 'salePrice' ? form.value.salePrice || null : form.value[key]
    original[key] = saved[key]
  }
  const savedPhotos = [...new Set([product.value.image, ...(product.value.images ?? [])].filter(Boolean))]
  if (JSON.stringify(photos.value) !== JSON.stringify(savedPhotos)) {
    changes.image = photos.value[0] ?? null
    changes.images = photos.value.slice(1)
    original.image = product.value.image ?? null
    original.images = product.value.images ?? []
  }
  return Object.keys(changes).length ? { ...changes, original } : null
}

async function handleSubmit() {
  const body = isNew.value
    ? { ...form.value, salePrice: form.value.salePrice || null, image: photos.value[0] ?? null, images: photos.value.slice(1) }
    : changesSinceLoad()
  const saveColours = variantsChanged()
  if (!body && !saveColours) {
    toast.show(t('admin.errors.nothingToUpdate'))
    return
  }

  isSubmitting.value = true
  try {
    if (isNew.value) {
      const { product: created } = await $fetch('/api/admin/products', { method: 'POST', body })
      if (variants.value.length) await saveVariants(created.id)
      snapshot.value = pageState()
      toast.show(t('admin.editor.added'))
      backToList()
    } else {
      if (body) {
        const { product: saved } = await $fetch(`/api/admin/products/${route.params.id}`, { method: 'PATCH', body })
        product.value = saved
      }
      if (saveColours) await saveVariants(route.params.id)
      snapshot.value = pageState()
      toast.show(t('admin.editor.saved'))
      backToList()
    }
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSubmitting.value = false
  }
}

// The products list this page was opened from, with its page and filters (the list keeps them in
// its address), for the back arrow and for after saving. Opened another way: the list's first page.
const listPath = ref('/admin/products')
const openedFromList = ref(false)
onMounted(() => {
  const back = window.history.state?.back
  if (typeof back === 'string' && /^\/admin\/products(\?|$)/.test(back)) {
    listPath.value = back
    openedFromList.value = true
  }
})

function backToList() {
  if (openedFromList.value) router.back()
  else navigateTo(listPath.value)
}

// Sends the colours as the page shows them; the product's stock comes back as their total.
async function saveVariants(productId) {
  const result = await $fetch(`/api/admin/products/${productId}/variants`, {
    method: 'PUT',
    body: {
      variants: variantsPayload(),
      original: savedVariants.value.map((v) => ({ id: v.id, stock: v.stock })),
      stock: Number(form.value.stock) || 0, // the product's own stock again if the last colour was removed
    },
  })
  savedVariants.value = result.variants
  variants.value = result.variants.map(variantFromRow)
  product.value = result.product
  form.value.stock = result.product.stock
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
    snapshot.value = pageState()
    toast.show(t('admin.products.deleted'))
    backToList()
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
/* A colour row without a swatch colour. */
.no-color {
  background: repeating-linear-gradient(45deg, rgb(var(--stone-100)) 0 4px, rgb(var(--stone-50)) 4px 8px);
}
.photo-btn {
  @apply w-7 h-7 rounded-md bg-surface/90 text-stone-800 flex items-center justify-center text-base hover:bg-surface hover:text-stone-900 transition;
}
</style>
