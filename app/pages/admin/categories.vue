<template>
  <div class="pb-24">
    <AdminPageHeader :title="$t('admin.categories.metaTitle')" :description="$t('admin.categories.description')" />

    <AdminEmptyState v-if="error" icon="mdi:cloud-alert-outline" :title="$t('admin.categories.loadFailed')" :description="adminErrorMessage(error)">
      <button type="button" class="adm-btn adm-btn-secondary" @click="refresh()">{{ $t('admin.common.tryAgain') }}</button>
    </AdminEmptyState>

    <form v-else id="categories-form" class="grid lg:grid-cols-2 gap-6 max-w-5xl" @submit.prevent="handleSave">
      <section v-for="cat in STORE_CATEGORIES" :key="cat.slug" class="adm-card">
        <div class="adm-card-header">
          <h2 class="adm-card-title truncate">{{ nameOf(cat.slug) }}</h2>
          <NuxtLink :to="`/category/${cat.slug}`" target="_blank" class="adm-btn adm-btn-ghost adm-btn-sm shrink-0">
            <Icon name="mdi:open-in-new" class="text-sm" />
            {{ $t('admin.categories.viewOnStore') }}
          </NuxtLink>
        </div>

        <div class="p-5 space-y-5">
          <div class="flex items-start gap-4">
            <!-- Same square shape as the category tile on the home page. -->
            <div class="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-stone-100 ring-1 ring-stone-200">
              <img
                v-if="!failedImages.has(photoOf(cat))"
                :src="photoOf(cat)"
                :alt="nameOf(cat.slug)"
                class="absolute inset-0 w-full h-full object-cover"
                @error="failedImages.add(photoOf(cat))"
              />
              <div v-else class="absolute inset-0 flex items-center justify-center text-stone-400" :title="$t('admin.common.photoMissing')">
                <Icon :name="cat.icon" class="text-4xl" />
              </div>
              <div v-if="uploading[cat.slug]" class="absolute inset-0 bg-black/45 flex items-center justify-center">
                <Icon name="mdi:loading" class="text-2xl text-white animate-spin" />
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-2.5">
                <span class="adm-label mb-0">{{ $t('admin.categories.photo') }}</span>
                <span class="adm-badge" :class="form[cat.slug].image ? 'bg-gold/10 text-gold' : 'bg-stone-100 text-stone-600'">
                  {{ form[cat.slug].image ? $t('admin.categories.newPhoto') : $t('admin.categories.defaultPhoto') }}
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="adm-btn adm-btn-secondary adm-btn-sm" :disabled="uploading[cat.slug]" @click="pickPhoto(cat.slug)">
                  <Icon name="mdi:image-plus-outline" class="text-base" />
                  {{ uploading[cat.slug] ? $t('admin.categories.uploading') : $t('admin.categories.uploadPhoto') }}
                </button>
                <button v-if="form[cat.slug].image" type="button" class="adm-btn adm-btn-ghost adm-btn-sm" :disabled="uploading[cat.slug]" @click="form[cat.slug].image = ''">
                  <Icon name="mdi:restore" class="text-base" />
                  {{ $t('admin.categories.useDefaultPhoto') }}
                </button>
              </div>
              <p class="adm-hint">{{ $t('admin.categories.photoHint') }}</p>
              <input
                :id="`photo-${cat.slug}`"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                class="hidden"
                @change="onPickPhoto(cat.slug, $event)"
              />
            </div>
          </div>

          <div>
            <span class="adm-label">{{ $t('admin.categories.name') }}</span>
            <div class="grid sm:grid-cols-2 gap-3">
              <div v-for="l in langOrder" :key="l">
                <label :for="`name-${cat.slug}-${l}`" class="lang-label">{{ l === 'ar' ? $t('admin.settings.inArabic') : $t('admin.settings.inEnglish') }}</label>
                <input
                  :id="`name-${cat.slug}-${l}`"
                  v-model="form[cat.slug][l === 'ar' ? 'nameAr' : 'nameEn']"
                  type="text"
                  :maxlength="CATEGORY_NAME_LIMIT"
                  :dir="l === 'ar' ? 'rtl' : 'ltr'"
                  :placeholder="DEFAULT_NAMES[l][cat.slug]"
                  class="adm-input"
                />
              </div>
            </div>
          </div>

          <!-- The types inside this category (filters on its page and in the menu). -->
          <div class="pt-4 border-t border-stone-200">
            <div class="flex items-baseline justify-between gap-2 mb-2">
              <span class="adm-label mb-0">{{ $t('admin.categories.types') }}</span>
              <span class="text-xs text-stone-400">{{ $t('admin.categories.typesHint') }}</span>
            </div>
            <ul v-if="subs[cat.slug].length" class="space-y-2">
              <li v-for="(sub, index) in subs[cat.slug]" :key="sub.key" class="flex items-center gap-2">
                <input
                  v-model="sub.labelAr"
                  type="text"
                  dir="rtl"
                  required
                  :maxlength="SUBCATEGORY_NAME_LIMIT"
                  class="adm-input flex-1 min-w-0"
                  :placeholder="$t('admin.categories.typeAr')"
                  :aria-label="$t('admin.categories.typeAr')"
                />
                <input
                  v-model="sub.label"
                  type="text"
                  dir="ltr"
                  :maxlength="SUBCATEGORY_NAME_LIMIT"
                  class="adm-input flex-1 min-w-0"
                  :placeholder="$t('admin.categories.typeEn')"
                  :aria-label="$t('admin.categories.typeEn')"
                />
                <span
                  v-if="sub.value"
                  class="adm-badge shrink-0 w-14 justify-center"
                  :class="countOf(cat.slug, sub.value) ? 'bg-stone-100 text-stone-700' : 'bg-stone-50 text-stone-400'"
                  :title="tc('admin.categories.typeCount', countOf(cat.slug, sub.value))"
                >
                  {{ countOf(cat.slug, sub.value) }}
                </span>
                <span v-else class="adm-badge shrink-0 w-14 justify-center bg-gold/10 text-gold">{{ $t('admin.categories.newType') }}</span>
                <button type="button" class="adm-icon-btn hover:text-red-600 shrink-0" :aria-label="$t('admin.categories.removeType')" :title="$t('admin.categories.removeType')" @click="removeSub(cat.slug, index)">
                  <Icon name="mdi:trash-can-outline" class="text-lg" />
                </button>
              </li>
            </ul>
            <p v-else class="text-xs text-stone-500">{{ $t('admin.categories.noTypes') }}</p>
            <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm mt-2" @click="addSub(cat.slug)">
              <Icon name="mdi:plus" class="text-base" />
              {{ $t('admin.categories.addType') }}
            </button>
          </div>
        </div>
      </section>
    </form>

    <Transition name="adm-bar">
      <div v-if="isDirty" class="fixed bottom-0 inset-x-0 lg:start-64 z-30 bg-surface border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Icon name="mdi:circle-edit-outline" class="text-lg text-amber-600 dark:text-amber-400" />
          <p class="text-sm text-stone-700 me-auto">{{ $t('admin.categories.unsaved') }}</p>
          <button type="button" class="adm-btn adm-btn-secondary" :disabled="isSaving" @click="discard">{{ $t('admin.categories.discard') }}</button>
          <button type="submit" form="categories-form" class="adm-btn adm-btn-primary" :disabled="isSaving || isUploading">
            {{ isSaving ? $t('admin.common.saving') : $t('admin.common.save') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import arNames from '~~/i18n/locales/ar/categories'
import enNames from '~~/i18n/locales/en/categories'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'products'
})
const { t, tc, isAr } = useLang()
useSeoMeta({ title: () => t('admin.categories.metaTitle'), robots: 'noindex' })

// The names a category has when the box is left empty, in both languages.
const DEFAULT_NAMES = { ar: arNames, en: enNames }

const toast = useToastStore()
const storeSettings = useStoreSettings()
const { confirm } = useAdminConfirm()
const { data, error, refresh } = await useFetch('/api/admin/categories')

// Every category gets all three fields here; the empty ones are dropped when saving.
function formFrom(categories) {
  return Object.fromEntries(STORE_CATEGORIES.map(({ slug }) => [
    slug,
    { nameAr: categories?.[slug]?.nameAr ?? '', nameEn: categories?.[slug]?.nameEn ?? '', image: categories?.[slug]?.image ?? '' },
  ]))
}

// Each category's types; `key` only tells the rows apart here, `value` is empty for a new one.
let subKey = 0
function subsFrom(subcategories) {
  return Object.fromEntries(STORE_CATEGORIES.map(({ slug }) => [
    slug,
    (subcategories?.[slug] ?? []).map((sub) => ({ key: ++subKey, value: sub.value ?? '', label: sub.label ?? '', labelAr: sub.labelAr ?? '' })),
  ]))
}
const subsPayload = () => Object.fromEntries(Object.entries(subs.value).map(([slug, list]) => [
  slug,
  list.map(({ key: _key, ...sub }) => sub),
]))

const form = ref(formFrom(data.value?.categories))
const subs = ref(subsFrom(data.value?.subcategories))
const counts = ref(data.value?.subcategoryCounts ?? {})
const pageState = () => JSON.stringify([form.value, subsPayload()])
const saved = ref(pageState())
watch(data, (value) => {
  form.value = formFrom(value?.categories)
  subs.value = subsFrom(value?.subcategories)
  counts.value = value?.subcategoryCounts ?? {}
  saved.value = pageState()
})

const countOf = (slug, value) => counts.value?.[slug]?.[value] ?? 0

function addSub(slug) {
  subs.value[slug].push({ key: ++subKey, value: '', label: '', labelAr: '' })
}

// A type with products asks first: they stay in the category, without a type, once saved.
async function removeSub(slug, index) {
  const sub = subs.value[slug][index]
  const count = sub.value ? countOf(slug, sub.value) : 0
  if (count) {
    const ok = await confirm({
      title: t('admin.categories.removeTypeTitle', { name: sub.labelAr || sub.label }),
      message: tc('admin.categories.removeTypeText', count),
      confirmLabel: t('admin.categories.removeType'),
      danger: true,
    })
    if (!ok) return
  }
  subs.value[slug].splice(index, 1)
}

const isSaving = ref(false)
const uploading = reactive({})
const isUploading = computed(() => Object.values(uploading).some(Boolean))
const failedImages = reactive(new Set())
const isDirty = computed(() => pageState() !== saved.value)

// The dashboard's own language comes first.
const langOrder = computed(() => (isAr.value ? ['ar', 'en'] : ['en', 'ar']))

const photoOf = (cat) => form.value[cat.slug].image || cat.image
const nameOf = (slug) => form.value[slug][isAr.value ? 'nameAr' : 'nameEn'].trim() || DEFAULT_NAMES[isAr.value ? 'ar' : 'en'][slug]

function pickPhoto(slug) {
  document.getElementById(`photo-${slug}`)?.click()
}

async function onPickPhoto(slug, event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error(t('admin.categories.notAnImage'))
    return
  }

  uploading[slug] = true
  try {
    const body = new FormData()
    body.append('file', await shrinkImage(file, 1000), file.name)
    body.append('slug', slug)
    const { url } = await $fetch('/api/admin/categories/upload-image', { method: 'POST', body })
    form.value[slug].image = url
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    uploading[slug] = false
  }
}

async function handleSave() {
  isSaving.value = true
  try {
    const result = await $fetch('/api/admin/categories', { method: 'PATCH', body: { categories: form.value, subcategories: subsPayload() } })
    form.value = formFrom(result.categories)
    subs.value = subsFrom(result.subcategories)
    counts.value = result.subcategoryCounts ?? {}
    saved.value = pageState()
    // The menu, footer and home page of this visit show the new names, photos and types right away.
    storeSettings.value = { ...storeSettings.value, categories: structuredClone(result.categories), subcategories: structuredClone(result.subcategories) }
    toast.show(result.cleared ? tc('admin.categories.savedCleared', result.cleared) : t('admin.categories.saved'))
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSaving.value = false
  }
}

function discard() {
  const [savedForm, savedSubs] = JSON.parse(saved.value)
  form.value = savedForm
  subs.value = subsFrom(savedSubs)
  saved.value = pageState()
}

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true
  return await confirm({
    title: t('admin.common.unsavedTitle'),
    message: t('admin.categories.leaveText'),
    confirmLabel: t('admin.common.leave'),
    danger: true,
  })
})
</script>

<style scoped>
.lang-label {
  @apply block text-[11px] font-medium text-stone-400 mb-1;
}
.adm-bar-enter-active,
.adm-bar-leave-active {
  transition: transform 0.2s ease;
}
.adm-bar-enter-from,
.adm-bar-leave-to {
  transform: translateY(100%);
}
</style>
