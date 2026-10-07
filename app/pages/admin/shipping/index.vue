<template>
  <div>
    <AdminPageHeader :title="$t('admin.shipping.metaTitle')" :description="$t('admin.shipping.description')">
      <button type="submit" form="shipping-form" class="adm-btn adm-btn-primary" :disabled="isSaving || !isDirty">
        <Icon :name="isSaving ? 'mdi:loading' : 'mdi:content-save-outline'" class="text-base" :class="{ 'animate-spin': isSaving }" />
        {{ isSaving ? $t('admin.common.saving') : $t('admin.common.save') }}
      </button>
    </AdminPageHeader>

    <form id="shipping-form" class="grid lg:grid-cols-3 gap-6 items-start" @submit.prevent="handleSave">
      <section class="adm-card lg:col-span-2 overflow-hidden">
        <div class="adm-card-header">
          <h2 class="adm-card-title">{{ $t('admin.shipping.fees') }}</h2>
        </div>
        <div class="divide-y divide-stone-200">
          <div v-for="tier in tiers" :key="tier.field" class="p-5 grid sm:grid-cols-[1fr_180px] gap-4 items-start">
            <div>
              <label :for="tier.field" class="text-sm font-medium text-stone-800">{{ $t(`admin.shipping.tiers.${tier.field}`) }}</label>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span v-for="g in tier.governorates" :key="g.value" class="adm-badge bg-stone-100 text-stone-600">{{ governorateName(g) }}</span>
              </div>
            </div>
            <div class="relative">
              <input :id="tier.field" v-model.number="form[tier.field]" type="number" min="0" step="0.01" required class="adm-input pe-12 text-end" />
              <span class="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{{ currency }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="adm-card">
        <div class="adm-card-header">
          <h2 class="adm-card-title">{{ $t('admin.shipping.free') }}</h2>
        </div>
        <div class="p-5">
          <label for="free_shipping_threshold" class="adm-label">{{ $t('admin.shipping.freeOver') }}</label>
          <div class="relative">
            <input id="free_shipping_threshold" v-model.number="form.free_shipping_threshold" type="number" min="0" step="0.01" required class="adm-input pe-12" />
            <span class="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{{ currency }}</span>
          </div>
          <p class="adm-hint">{{ $t('admin.shipping.freeHint') }}</p>

          <div class="mt-5 rounded-lg bg-stone-50 border border-stone-200 p-4 text-sm space-y-1.5">
            <p class="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{{ $t('admin.shipping.example') }}</p>
            <p class="flex justify-between gap-3"><span class="text-stone-500">{{ $t('admin.shipping.exampleCairo', { amount: formatMoney(sample) }) }}</span><span class="font-medium whitespace-nowrap">{{ feeFor(1, sample) }}</span></p>
            <p class="flex justify-between gap-3"><span class="text-stone-500">{{ $t('admin.shipping.exampleAswan', { amount: formatMoney(sample) }) }}</span><span class="font-medium whitespace-nowrap">{{ feeFor(3, sample) }}</span></p>
            <p class="flex justify-between gap-3"><span class="text-stone-500">{{ $t('admin.shipping.exampleAny', { amount: formatMoney(form.free_shipping_threshold || 0) }) }}</span><span class="font-medium text-emerald-700 dark:text-emerald-400">{{ $t('admin.common.free') }}</span></p>
          </div>
        </div>
      </section>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  adminPermission: 'shipping',
})
const { t, isAr, governorateName } = useLang()
useSeoMeta({ title: () => t('admin.shipping.metaTitle'), robots: 'noindex' })
const currency = computed(() => (isAr.value ? 'ج.م' : 'EGP'))

const toast = useToastStore()
const { data } = await useFetch('/api/admin/shipping-settings')

const toForm = (value) => ({
  tier1_fee: value?.tier1_fee ?? DEFAULT_SHIPPING_SETTINGS.tier1_fee,
  tier2_fee: value?.tier2_fee ?? DEFAULT_SHIPPING_SETTINGS.tier2_fee,
  tier3_fee: value?.tier3_fee ?? DEFAULT_SHIPPING_SETTINGS.tier3_fee,
  free_shipping_threshold: value?.free_shipping_threshold ?? DEFAULT_SHIPPING_SETTINGS.free_shipping_threshold,
})

const form = ref(toForm(data.value))
const saved = ref(JSON.stringify(form.value))
const isDirty = computed(() => JSON.stringify(form.value) !== saved.value)
const isSaving = ref(false)

const namesForTier = (tier) =>
  governorates.filter((g) => (GOVERNORATE_TIERS[g.value] ?? 3) === tier)

const tiers = [
  { field: 'tier1_fee', governorates: namesForTier(1) },
  { field: 'tier2_fee', governorates: namesForTier(2) },
  { field: 'tier3_fee', governorates: namesForTier(3) },
]

const sample = computed(() => Math.max(Math.round((form.value.free_shipping_threshold || 0) / 2), 100))

function feeFor(tier, subtotal) {
  if (subtotal >= form.value.free_shipping_threshold) return t('admin.common.free')
  return formatMoney(form.value[`tier${tier}_fee`])
}

async function handleSave() {
  isSaving.value = true
  try {
    await $fetch('/api/admin/shipping-settings', { method: 'PATCH', body: form.value })
    saved.value = JSON.stringify(form.value)
    toast.show(t('admin.shipping.saved'))
  } catch (err) {
    toast.error(adminErrorMessage(err))
  } finally {
    isSaving.value = false
  }
}
</script>
